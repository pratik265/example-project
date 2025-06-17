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

  if (userLoading || loading) return <div className="loading">Loading treatments...</div>;
  if (error) return <div className="error">{error}</div>;

  // Pagination component
  const Pagination = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: currentPage === 1 ? '#f7fafc' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#a0aec0' : '#4a5568'
          }}
        >
          Previous
        </button>
        
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: currentPage === index + 1 ? '#667eea' : 'white',
              color: currentPage === index + 1 ? 'white' : '#4a5568',
              cursor: 'pointer'
            }}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: currentPage === totalPages ? '#f7fafc' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#a0aec0' : '#4a5568'
          }}
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
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e9ecef',
            paddingBottom: '1rem'
          }}>
            <h3 style={{ margin: 0, color: '#495057' }}>{t('booking.selectBranch')}</h3>
            <button
              onClick={closePopup}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          
          <p style={{ 
            marginBottom: '1.5rem', 
            color: '#6c757d',
            fontSize: '0.95rem'
          }}>
            {t('for_all.chooseBranch')} <strong>{selectedTreatment.name}</strong>:
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {availableBranches.map(branch => (
              <div
                key={branch.id}
                onClick={() => handleBranchSelect(branch.id)}
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#f8f9ff';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  {branch.image && (
                    <img
                      src={branch.image}
                      alt={branch.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#495057',
                      fontSize: '1.1rem'
                    }}>
                      {branch.name}
                    </h4>
                    {branch.address && (
                      <p style={{ 
                        margin: '0 0 0.5rem 0', 
                        color: '#6c757d',
                        fontSize: '0.9rem'
                      }}>
                        📍 {branch.address}
                      </p>
                    )}
                    {branch.description && (
                      <div 
                        style={{ 
                          margin: 0, 
                          color: '#6c757d',
                          fontSize: '0.85rem',
                          lineHeight: '1.4'
                        }}
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
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6c757d'
            }}>
              <p>No branches available for this treatment.</p>
              <button
                onClick={closePopup}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
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
    <div className="treatments-page">
      
      <section className="section">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="section-title">{t('treatments.title')}</h1>
          <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#6c757d', marginBottom: '3rem'}}>
            {t('treatments.description')}
          </p>

          {/* Treatments Grid */}
          <div className="cards-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            width: '100%'
          }}>
            {currentTreatments.map(treatment => (
              <div key={treatment.id} className="card treatment-card">
                {treatment.images && treatment.images.length > 0 ? (
                  <div style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: '8px 8px 0 0',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={`${treatment.images[0]}`}
                      alt={treatment.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`;
                        e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">${treatment.name.charAt(0).toUpperCase()}</div>`;
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: '8px 8px 0 0',
                    background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    {treatment.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="price">
                  ${treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                    Number(treatment.minForcePaymentPrice) : 
                    Number(treatment.price)
                  }
                </div>
                <h3>{treatment.name}</h3>
                <div style={{marginBottom: '1.5rem'}}>
                  <p><strong>⏱️ {t('common.duration')}:</strong> {treatment.time} {t('common.minutes')}</p>
                  <p><strong>💰 {t('common.price')}:</strong> ${treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                    Number(treatment.minForcePaymentPrice) : 
                    Number(treatment.price)
                  }</p>
                  <p><strong>💳 {t('treatments.payment')}:</strong> 
                    {treatment.force_pay === "1" ? (
                      <span style={{color: '#c62828'}}>{t('common.paymentRequired')}</span>
                    ) : (
                      <span style={{color: '#2e7d32'}}>{t('common.paymentNotRequired')}</span>
                    )}
                  </p>
                  
                  <p><strong>🚫 {t('treatments.cancellationFee')}:</strong> ${treatment.cancellationPrice || '0'}</p>
                </div>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
                  <Link 
                    to={createUserLink(`/treatments/${treatment.id}`)} 
                    className="btn" 
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      color: '#495057',
                      textDecoration: 'none',
                      flex: '1',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {t('treatments.viewDetails')}
                  </Link>
                  <button
                    onClick={() => handleBookNowClick(treatment)}
                    className="btn btn-primary"
                    style={{
                      flex: '1',
                      textAlign: 'center',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {t('treatments.bookNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {treatments.length === 0 && (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <p>No treatments found.</p>
            </div>
          )}

          {/* Show pagination if there are more than 6 treatments */}
          {treatments.length > treatmentsPerPage && <Pagination />}
        </div>
      </section>
      
      {/* Branch Selection Popup */}
      <BranchSelectionPopup />
    </div>
  );
};

export default Treatments; 