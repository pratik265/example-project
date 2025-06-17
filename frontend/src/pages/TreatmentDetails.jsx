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
            <h3 style={{ margin: 0, color: '#495057' }}>Select Branch</h3>
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
            {t('for_all.chooseBranch')} <strong>{treatment.name}</strong>:
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

  if (loading) return <div className="loading">Loading treatment details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!treatment) return <div className="error">Treatment not found</div>;

  return (
    <div className="treatment-details-page">
      <section className="section">
        <div className="container" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 20px' }}>
          <Link 
            to={createUserLink('/treatments')} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#6c757d',
              textDecoration: 'none',
              marginBottom: '2rem'
            }}
          >
            ← {t('treatments.backToTreatments')}
          </Link>

          <div className="treatment-details" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <h1 style={{ margin: '0', color: '#2c3e50' }}>{treatment.name}</h1>
              <div className="price" style={{
                background: '#ff4757',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '1.25rem'
              }}>
                ${treatment.price}
              </div>
            </div>

            {treatment.images && treatment.images.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <img
                  src={`${treatment.images[0]}`}
                  alt={treatment.name}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`;
                    e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: bold;">${treatment.name.charAt(0).toUpperCase()}</div>`;
                  }}
                />
              </div>
            )}

            <div className="treatment-info" style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="info-section">
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>{t('treatments.treatmentDetails')}</h3>
                <div style={{ 
                  display: 'grid', 
                  gap: '1rem',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  <div><strong>⏱️ {t('treatments.duration')}:</strong> {treatment.time} {t('common.minutes')}</div>
                  <div><strong>💰 {t('treatments.price')}:</strong> ${treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                      Number(treatment.minForcePaymentPrice) : 
                      Number(treatment.price)
                    }</div>
                  <div>
                    <strong>💳 Payment:</strong> {' '}
                    {treatment.force_pay === "1" ? (
                      <span style={{color: '#c62828'}}>{t('treatments.required')}</span>
                    ) : (
                      <span style={{color: '#2e7d32'}}>{t('treatments.notRequired')}</span>
                    )}
                  </div>
                  <div><strong>🚫 {t('treatments.cancellationFee')}:</strong> ${treatment.cancellationPrice || '0'}</div>
                  {treatment.description && (
                    <div>
                      <strong>📝 {t('treatments.description')}:</strong>
                      <div 
                        style={{ 
                          marginTop: '0.5rem',
                          lineHeight: '1.6',
                          color: '#4a5568'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: treatment.description
                            .replace(/&nbsp;/g, ' ')
                            .replace(/\\r\\n/g, '')
                            .replace(/\\/g, '')
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  onClick={handleBookNowClick}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t('treatments.bookNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Branch Selection Popup */}
        <BranchSelectionPopup />
      </section>
    </div>
  );
};

export default TreatmentDetails; 