import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTreatments, getClinics } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';

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
    <div className="treatments-page" style={{ 
      backgroundColor: '#f8fafc', 
      padding: '6rem 0',
      minHeight: '100vh'
    }}>
      
      <section className="section">
        <div className="container" style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 24px' 
        }}>
          <h1 className="section-title" style={{
            fontSize: '3rem',
            color: '#0f172a',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontWeight: '800',
            letterSpacing: '-0.025em'
          }}>{t('treatments.title')}</h1>
          <p style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            color: '#475569',
            marginBottom: '5rem',
            maxWidth: '700px',
            margin: '0 auto 5rem',
            lineHeight: '1.6'
          }}>
            {t('treatments.description')}
          </p>

          {/* Treatments Grid */}
          <div className="cards-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2.5rem',
            width: '100%'
          }}>
            {currentTreatments.map(treatment => (
              <div key={treatment.id} className="card treatment-card" style={{
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '24px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                overflow: 'hidden',
                padding: '2rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ':hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                }
              }}>
                {/* Price Ribbon */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '-50px',
                  backgroundColor: '#00c853',
                  color: 'white',
                  padding: '7px 0px',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  transform: 'rotate(310deg)',
                  transformOrigin: '62% 100%',
                  zIndex: 10,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  width: '200px',
                  textAlign: 'center',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}>
                  ${treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                    (Number(treatment.minForcePaymentPrice) || 0).toFixed(2) : 
                    (Number(treatment.price) || 0).toFixed(2)
                  }
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem',flexDirection: 'column' }}>
                  {/* Image Section (Left) */}
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    flexShrink: 0, 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}>
                    {treatment.images && treatment.images.length > 0 ? (
                      <img
                        src={`${treatment.images[0]}`}
                        alt={treatment.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`;
                          e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">${treatment.name.charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        borderRadius: '16px'
                      }}>
                        {treatment.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Details Section (Right) */}
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      color: '#0f172a', 
                      marginBottom: '0.75rem',
                      fontWeight: '700'
                    }}>{treatment.name}</h3>
                    <p style={{ 
                      margin: '0.75rem 0 0.3rem', 
                      color: '#475569', 
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: '#3b82f6' }}>⏱️</span>
                      {t('common.duration')}: {treatment.time} {t('common.minutes')}
                    </p>
                    <p style={{ 
                      margin: '0.3rem 0', 
                      color: '#475569', 
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: '#3b82f6' }}>💳</span>
                      {t('treatments.payment')}:
                      {treatment.force_pay === "1" ? (
                        <span style={{ color: '#ef4444', fontWeight: '600' }}> {t('common.paymentRequired')}</span>
                      ) : (
                        <span style={{ color: '#22c55e', fontWeight: '600' }}> {t('common.paymentNotRequired')}</span>
                      )}
                    </p>
                    <p style={{ 
                      margin: '0.3rem 0 1.25rem', 
                      color: '#475569', 
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: '#3b82f6' }}>🚫</span>
                      {t('treatments.cancellationFee')}: ${treatment.cancellationPrice || '0'}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end', 
                  marginTop: '2rem' 
                }}>
                  <Link 
                    to={createUserLink(`/treatments/${treatment.id}`)} 
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      color: '#475569',
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      flex: '1',
                      ':hover': {
                        backgroundColor: '#e2e8f0'
                      }
                    }}
                  >
                    {t('treatments.viewDetails')}
                  </Link>
                  <button
                    onClick={() => handleBookNowClick(treatment)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flex: '1',
                      ':hover': {
                        backgroundColor: '#059669'
                      }
                    }}
                  >
                    {t('treatments.bookNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {treatments.length === 0 && (
            <div style={{
              textAlign: 'center', 
              padding: '4rem',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
              <p style={{
                fontSize: '1.25rem',
                color: '#475569'
              }}>No treatments found.</p>
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