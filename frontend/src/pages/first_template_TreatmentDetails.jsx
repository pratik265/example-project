import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTreatmentById, getClinics } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

const TreatmentDetails = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { currentUser } = useUser();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to create user-aware URLs
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  // Add popup state for branch selection
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const [allBranches, setAllBranches] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both treatment and clinics data
        const [treatmentData, clinicsData] = await Promise.all([
          getTreatmentById(id),
          getClinics()
        ]);
        
        setTreatment(treatmentData);
        if (Array.isArray(clinicsData)) {
          setAllBranches(clinicsData);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load treatment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle Book Now click
  const handleBookNowClick = () => {
    if (!treatment) return;
    
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
    window.location.href = createUserLink(`/treatments/${treatment.id}/book?branch=${selectedBranchId}`);
  };

  // Close popup
  const closePopup = () => {
    setShowBranchPopup(false);
  };

  // Branch Selection Popup Component
  const BranchSelectionPopup = () => {
    if (!showBranchPopup || !treatment) return null;

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
            {t('for_all.chooseBranch')} <strong>{treatment.name}</strong>:
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

  if (loading) return <div className="ft-loading">{t('common.loading')}</div>;
  if (error) return <div className="ft-error">{error}</div>;
  if (!treatment) return <div className="ft-error">Treatment not found.</div>;

  return (
    <div className="ft-detail-page ft-treatment-detail-page">
      <div className="ft-container">
        <div className="ft-detail-header">
          {treatment.image && (
            <img src={treatment.image} alt={treatment.name} className="ft-detail-image" />
          )}
          <div className="ft-detail-info">
            <div className="ft-specialty">{t('for_all.treatment')}</div>
            <h1>{treatment.name}</h1>
            <p className="ft-detail-description">
              {treatment.description}
            </p>
            <div className="ft-treatment-price">
              <strong>{t('for_all.price')}:</strong> {treatment.price} {treatment.currency}
            </div>
            <button onClick={handleBookNowClick} className="ft-btn ft-btn-primary">
              {t('common.bookNow')}
            </button>
          </div>
        </div>

        {/* Related Treatments */}
        {treatment.relatedTreatments && treatment.relatedTreatments.length > 0 && (
          <div className="ft-related-treatments-section ft-section">
            <h2 className="ft-section-title">{t('treatmentDetails.relatedTreatments')}</h2>
            <div className="ft-cards-grid">
              {treatment.relatedTreatments.map(related => (
                <div key={related.id} className="ft-card ft-treatment-card">
                  <img src={related.image} alt={related.name} />
                  <h3>{related.name}</h3>
                  <p className="ft-price">{related.price} {related.currency}</p>
                  <Link to={createUserLink(`/treatments/${related.id}`)} className="ft-btn ft-btn-secondary">
                    {t('common.viewDetails')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinics Offering This Treatment */}
        {availableBranches.length > 0 && (
          <div className="ft-clinics-offering-section ft-section">
            <h2 className="ft-section-title">{t('treatmentDetails.availableAtClinics')}</h2>
            <div className="ft-cards-grid">
              {availableBranches.map(branch => (
                <div key={branch.id} className="ft-card ft-clinic-card">
                  <img src={branch.image} alt={branch.name} />
                  <h3>{branch.name}</h3>
                  <p className="ft-clinic-address">📍 {branch.address}</p>
                  <Link to={createUserLink(`/clinics/${branch.id}`)} className="ft-btn ft-btn-secondary">
                    {t('common.viewClinicDetails')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <BranchSelectionPopup />
      </div>
    </div>
  );
};

export default TreatmentDetails; 