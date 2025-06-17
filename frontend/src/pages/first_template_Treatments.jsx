import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTreatments, getClinics } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

const Treatments = () => {
  const { t, language } = useLanguage();
  const { currentUser, loading: userLoading } = useUser();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAttemptRef = useRef(0);
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branch');

  // Helper function to create user-aware URLs
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const treatmentsPerPage = 6;

  // Add popup state
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [allBranches, setAllBranches] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  // Calculate pagination values
  const indexOfLastTreatment = currentPage * treatmentsPerPage;
  const indexOfFirstTreatment = indexOfLastTreatment - treatmentsPerPage;
  const currentTreatments = treatments.slice(indexOfFirstTreatment, indexOfLastTreatment);
  const totalPages = Math.ceil(treatments.length / treatmentsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };

  // Handle Book Now click
  const handleBookNowClick = (treatment) => {
    if (!treatment || !treatment.id) {
      console.error('Invalid treatment object:', treatment);
      return;
    }

    setSelectedTreatment(treatment);
    
    // If user is already on a specific branch page, use that branch directly
    if (branchId) {
      window.location.href = createUserLink(`/treatments/${treatment.id}/book?branch=${branchId}`);
      return;
    }
    
    // Only show popup if no branch is pre-selected
    // Get available branches for this treatment
    try {
      const treatmentBranchIds = JSON.parse(treatment.branch || '[]');
      const treatmentBranches = allBranches.filter(branch => 
        treatmentBranchIds.includes(branch.id.toString()) || treatmentBranchIds.includes(branch.id)
      );
      
      setAvailableBranches(treatmentBranches);
      
      // If only one branch available, redirect directly
      if (treatmentBranches.length === 1) {
        window.location.href = createUserLink(`/treatments/${treatment.id}/book?branch=${treatmentBranches[0].id}`);
        return;
      }
      
      // If multiple branches, show popup
      if (treatmentBranches.length > 1) {
        setShowBranchPopup(true);
      } else {
        // If no specific branches, use default
        window.location.href = createUserLink(`/treatments/${treatment.id}/book?branch=38`);
      }
    } catch (err) {
      console.error('Error processing treatment branches:', err);
      // Fallback to default branch
      window.location.href = createUserLink(`/treatments/${treatment.id}/book?branch=38`);
    }
  };

  // Handle branch selection in popup
  const handleBranchSelect = (selectedBranchId) => {
    setShowBranchPopup(false);
    window.location.href = createUserLink(`/treatments/${selectedTreatment.id}/book?branch=${selectedBranchId}`);
  };

  // Close popup
  const closePopup = () => {
    setShowBranchPopup(false);
    setSelectedTreatment(null);
  };

  useEffect(() => {
    // Don't fetch data until user context is ready
    if (userLoading || !currentUser) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Only show loading on first attempt
        if (fetchAttemptRef.current === 0) {
          setLoading(true);
        }
        
        // Fetch treatments and branches data
        const [treatmentsData, clinicsData] = await Promise.all([
          getTreatments(abortController.signal, branchId),
          getClinics()
        ]);
        
        if (isMounted) {
          
          if (Array.isArray(treatmentsData)) {
            setTreatments(treatmentsData);
            setError(null);
          } else {
            setTreatments([]);
            setError('Invalid data received from server');
          }
          
          if (Array.isArray(clinicsData)) {
            setAllBranches(clinicsData);
          }
          
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        
        if (err.message === 'Server not ready' && fetchAttemptRef.current === 0) {
          // If it's the first attempt and server isn't ready, try once more
          fetchAttemptRef.current++;
          fetchData();
          return;
        }

        if (isMounted) {
          setError('Failed to load treatments. Please try again later.');
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [branchId, currentUser, userLoading]); // Add user context dependencies

  if (userLoading || loading) return <div className="ft-loading">{t('common.loading')}</div>;
  if (error) return <div className="ft-error">{error}</div>;

  // Pagination component
  const Pagination = () => {
    return (
      <div className="ft-pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="ft-pagination-button ft-pagination-prev"
        >
          Previous
        </button>
        
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`ft-pagination-button ${currentPage === index + 1 ? 'ft-pagination-button-active' : ''}`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ft-pagination-button ft-pagination-next"
        >
          Next
        </button>
      </div>
    );
  };

  // Branch Selection Popup Component
  const BranchSelectionPopup = () => {
    if (!showBranchPopup || !selectedTreatment) return null;

    return (
      <div className="ft-branch-selection-popup-overlay">
        <div className="ft-branch-selection-popup-content">
          <div className="ft-popup-header">
            <h3 className="ft-popup-title">Select Branch</h3>
            <button
              onClick={closePopup}
              className="ft-popup-close-btn"
            >
              ×
            </button>
          </div>
          
          <p className="ft-popup-description">
            {t('for_all.chooseBranch')} <strong>{selectedTreatment.name}</strong>:
          </p>

          <div className="ft-branch-list">
            {availableBranches.map(branch => (
              <div
                key={branch.id}
                onClick={() => handleBranchSelect(branch.id)}
                className="ft-branch-item"
              >
                <div className="ft-branch-item-content">
                  {branch.image && (
                    <img
                      src={branch.image}
                      alt={branch.name}
                      className="ft-branch-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="ft-branch-text-content">
                    <h4 className="ft-branch-name">
                      {branch.name}
                    </h4>
                    {branch.address && (
                      <p className="ft-branch-address">
                        📍 {branch.address}
                      </p>
                    )}
                    {branch.description && (
                      <div 
                        className="ft-branch-description"
                        dangerouslySetInnerHTML={{ 
                          __html: branch.description.length > 100 
                            ? `${branch.description.substring(0, 100)}...` 
                            : branch.description
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {availableBranches.length === 0 && (
            <div className="ft-no-branches-message">
              <p>No branches available for this treatment.</p>
              <button
                onClick={closePopup}
                className="ft-btn ft-btn-primary"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ft-treatments-page">
      <section className="ft-section">
        <div className="ft-container">
          <h1 className="ft-section-title">{t('treatments.title')}</h1>
          <p className="ft-section-description">
            {t('treatments.description')}
          </p>

          {currentTreatments.length === 0 ? (
            <div className="ft-no-treatments-found">
              {t('treatments.noTreatmentsFound')}
            </div>
          ) : (
            <div className="ft-cards-grid">
              {currentTreatments.map((treatment) => (
                <div key={treatment.id} className="ft-treatment-card">
                  <div className="ft-treatment-image">
                    {treatment.image ? (
                      <img
                        src={treatment.image}
                        alt={treatment.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-treatment.jpg'; // Add a placeholder image
                        }}
                      />
                    ) : (
                      <div className="ft-treatment-placeholder">
                        {treatment.name?.charAt(0) || 'T'}
                      </div>
                    )}
                  </div>
                  <div className="ft-treatment-content">
                    <h3 className="ft-treatment-name">{treatment.name || t('treatments.untitled')}</h3>
                    <p className="ft-treatment-description">
                      {treatment.description || t('treatments.noDescription')}
                    </p>
                    {treatment.price && (
                      <div className="ft-treatment-price">
                        {t('treatments.price')}: {treatment.price} {t('common.currency')}
                      </div>
                    )}
                    <button
                      onClick={() => handleBookNowClick(treatment)}
                      className="ft-btn ft-btn-primary"
                    >
                      {t('treatments.bookNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && <Pagination />}
        </div>
      </section>

      {/* Branch Selection Popup */}
      <BranchSelectionPopup />
    </div>
  );
};

export default Treatments; 