import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { getInitialData } from '../services/api';

const Home = () => {
  const { t, language } = useLanguage();
  const { currentUser, loading: userLoading,templateId } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper function to create user-aware links
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
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
        const initialData = await getInitialData(abortController.signal);
        if (isMounted && initialData) {
          setData(initialData);
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          setError('Failed to load data. Please try again later.');
        }
      } finally {
        if (isMounted) {
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
  }, [currentUser, userLoading]); // Add dependencies to re-fetch when user changes

  if (userLoading || loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!data) {
    return <div className="error">No data available</div>;
  }

  // Get the first banner data if available
  const bannerHeading = data?.template?.banner?.headings?.[0] || t('home.defaultBannerHeading');
  const bannerDescription = data?.template?.banner?.descriptions?.[0] || t('home.defaultBannerDescription');

  // Ensure doctors array exists
  const doctors = data.doctors || [];

  return (
    <div className="home" style={{ 
      background: templateId === '1' ? 'rgb(149 37 37)' : 'var(--main-color)'
    }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>{bannerHeading}</h1>
          <p>{bannerDescription}</p>
          <div className="cta-buttons">
            <Link to={createUserLink('/doctors')} className="btn btn-primary">{t('common.findADoctor')}</Link>
            <Link to={createUserLink('/contact')} className="btn btn-secondary">{t('common.bookAppointment')}</Link>
          </div>
        </div>
      </section>


      {/* About Us Section */}
      {data?.template?.aboutUs && (
        <section className="section" style={{backgroundColor: 'white'}}>
          <div className="container">
            <h2 className="section-title">{data.template.aboutUs.heading}</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center'}}>
              <div>
                <p style={{fontSize: '1.1rem', lineHeight: '1.6', color: '#6c757d'}}>
                  {data.template.aboutUs.description}
                </p>
                {data.clinic && (
                  <div style={{marginTop: '2rem'}} className='three-columns'>
                    <h3 style={{color: '#667eea', marginBottom: '1rem'}}>{t('common.contactInformation')}</h3>
                    <p><strong>📞 {t('common.phone')}:</strong> {data.clinic.phone}</p>
                    <p><strong>✉️ {t('common.email')}:</strong> {data.clinic.email}</p>
                    <p><strong>📍 {t('common.address')}:</strong> {data.clinic.address}</p>
                  </div>
                )}
              </div>
              {data.template.aboutUs.image && (
                <div>
                  <img 
                    src={data.template.aboutUs.image} 
                    alt="About Us" 
                    style={{width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Doctors Section */}
      {doctors.length > 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 className="section-title">{t('home.ourExpertDoctors')}</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              width: '100%',
              overflowX: 'auto'
            }}>
              {doctors.slice(0, 3).map(doctor => {
                // Clean up description text
                const cleanDescription = doctor.description
                  ? doctor.description
                      .replace(/<\/?p>/g, '') // Remove p tags
                      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                      .replace(/\\r\\n/g, '') // Remove \r\n
                      .replace(/\\"/g, '') // Remove escaped quotes
                      .trim()
                  : t('home.experiencedDescription');

                return (
                  <div key={doctor.id} className="card doctor-card" style={{
                    minWidth: '300px',
                    height: '100%'
                  }}>
                    {doctor.image ? (
                      <div className="doctor-image">
                        <img 
                          src={doctor.image}
                          alt={doctor.name || `${t('for_all.doctor')} ${doctor.teamMemberId}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const firstLetter = (doctor.name || t('for_all.doctor')).charAt(0).toUpperCase();
                            e.target.parentElement.innerHTML = `<div class="doctor-letter-avatar">${firstLetter}</div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="doctor-image">
                        <div className="doctor-letter-avatar">
                          {(doctor.name || t('for_all.doctor')).charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}

                    <h3>{doctor.name || `${t('for_all.doctor')} ${doctor.teamMemberId}`}</h3>
                    <p className="doctor-description">{cleanDescription}</p>
                    {doctor.teamMemberId && (
                      <p className="team-id">
                        <strong>{t('home.teamId')}:</strong> {doctor.teamMemberId}
                      </p>
                    )}
                    <Link to={createUserLink(`/doctors/${doctor.id}`)} className="btn btn-primary">
                      {t('common.viewProfile')}
                    </Link>
                  </div>
                );
              })}
            </div>
            <div style={{textAlign: 'center', marginTop: '2rem'}}>
              <Link to={createUserLink('/doctors')} className="btn btn-secondary">{t('home.viewAllDoctors')}</Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="section" style={{backgroundColor: '#f8f9fa'}}>
        <div className="container" style={{textAlign: 'center'}}>
          <h2 className="section-title">{t('home.ctaHeading')}</h2>
          <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: '#6c757d'}}>
            {t('home.ctaDescription')}
          </p>
          <div className="cta-buttons">
            <Link to={createUserLink('/contact')} className="btn btn-primary">{t('common.contactUs')}</Link>
            {data.template?.contact?.phone && (
              <a href={`tel:+${data.template.contact.phone}`} className="btn btn-secondary">
                {t('home.call')} {data.template.contact.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 