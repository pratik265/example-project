import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { getDoctors } from '../services/api';

const Doctors = () => {
  const { t, language } = useLanguage();
  const { currentUser, loading: userLoading } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAttemptRef = useRef(0);

  useEffect(() => {
    // Don't fetch data until user context is ready
    if (userLoading || !currentUser) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        // Only show loading on first attempt
        if (fetchAttemptRef.current === 0) {
          setLoading(true);
        }

        const data = await getDoctors(abortController.signal);
        if (isMounted) {
          setDoctors(data.filter(doctor => doctor.status === "1"));
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        
        if (err.message === 'Server not ready' && fetchAttemptRef.current === 0) {
          // If it's the first attempt and server isn't ready, try once more
          fetchAttemptRef.current++;
          fetchDoctors();
          return;
        }

        if (isMounted) {
          setError('Failed to load doctors. Please try again later.');
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchDoctors();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [currentUser, userLoading]); // Add dependencies to re-fetch when user changes

  // Helper function to create user-aware links
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  if (userLoading || loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctors-page">
      <section className="section">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="section-title">{t('doctors.title')}</h1>
          <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#6c757d', marginBottom: '3rem'}}>
            {t('doctors.description')}
          </p>

          {/* Doctors Grid */}
          <div className="cards-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            width: '100%'
          }}>
            {doctors.map(doctor => {
              // Clean up description text
              const cleanDescription = doctor.description
                ? doctor.description
                    .replace(/<\/?p>/g, '') // Remove p tags
                    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                    .replace(/\\r\\n/g, '') // Remove \r\n
                    .replace(/\\"/g, '') // Remove escaped quotes
                    .trim()
                : 'Experienced medical professional dedicated to providing quality healthcare.';

              return (
                <div key={doctor.id} className="card doctor-card" style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {doctor.image ? (
                    <div style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      marginBottom: '1.5rem',
                      overflow: 'hidden',
                      border: '4px solid #f8f9fa',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      <img 
                        src={doctor.image}
                        alt={doctor.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = `linear-gradient(135deg, ${doctor.color} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`;
                          e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: bold;">${(doctor.name || 'D').charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${doctor.color} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      marginBottom: '1.5rem',
                      border: '4px solid #f8f9fa',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      {(doctor.name || 'D').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <h3 style={{
                    marginBottom: '0.75rem', 
                    color: '#2c3e50',
                    fontSize: '1.5rem'
                  }}>{doctor.name}</h3>
                  
                  <div style={{
                    marginBottom: '1.5rem',
                    color: '#6c757d',
                    fontSize: '0.9rem',
                    flex: 1,
                    maxWidth: '100%',
                    lineHeight: '1.5'
                  }}>
                    {cleanDescription}
                  </div>

                  {doctor.team_member_id && (
                    <div style={{
                      marginBottom: '1rem',
                      color: '#6c757d',
                      fontSize: '0.9rem'
                    }}>
                      <strong>{t('home.teamId')}:</strong> {doctor.team_member_id}
                    </div>
                  )}

                  <Link 
                    to={createUserLink(`/doctors/${doctor.id}`)} 
                    className="btn btn-primary"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '25px',
                      transition: 'all 0.3s',
                      width: '100%',
                      textAlign: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    {t('common.viewProfile')}
                  </Link>
                </div>
              );
            })}
          </div>

          {doctors.length === 0 && (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <p>{t('doctors.noDoctorsFound')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Doctors; 