import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { getInitialData } from '../../services/api';
import doctorImage from '../../assets/hwllooo-removebg-preview.png';
const Home = () => {
  const { t } = useLanguage();
  const { currentUser, loading: userLoading } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  useEffect(() => {
    if (userLoading || !currentUser) return;

    const abortController = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        const initialData = await getInitialData(abortController.signal);
        if (isMounted && initialData) setData(initialData);
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          setError('Failed to load data. Please try again later.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setLoading(true);
    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [currentUser, userLoading]);

  if (userLoading || loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!data) {
    return <div className="error">No data available</div>;
  }

  const bannerHeading = data?.template?.banner?.headings?.[0] || t('home.defaultBannerHeading');
  const bannerDescription = data?.template?.banner?.descriptions?.[0] || t('home.defaultBannerDescription');
  const doctors = data.doctors || [];

  return (
    <div className="home">

      {/* Hero Section */}
      
      <section
  className="hero-section"
  style={{
    background: 'linear-gradient(135deg, #e6f4ea, #d1e7dd)',
    padding: '6rem 1.5rem',
    overflow: 'hidden',
    paddingBottom: '6rem',
  }}
>
  <div
    className="hero-container"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1200px',
      margin: '0 auto',
      flexWrap: 'wrap',
      gap: '3rem',
    }}
  >
    {/* Left Column: Text Content */}
    <div
      className="hero-text"
      style={{
        flex: '1 1 500px',
        textAlign: 'left',
        animation: 'fadeInLeft 1s ease-out',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          color: '#2e7d32',
          marginBottom: '1rem',
          fontWeight: '700',
          lineHeight: '1.2',
        }}
      >
        {bannerHeading}
      </h1>
      <p
        style={{
          fontSize: '1.25rem',
          color: '#4e6e58',
          maxWidth: '600px',
          marginBottom: '2rem',
          lineHeight: '1.7',
        }}
      >
        {bannerDescription}
      </p>

      {/* CTA Buttons */}
      <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to={createUserLink('/doctors')}
          className="btn-primary"
          style={{
            backgroundColor: '#4caf50',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            borderRadius: '10px',
            fontWeight: '600',
            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.25)',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'none')}
        >
          {t('common.findADoctor')}
        </Link>

        <Link
          to={createUserLink('/contact')}
          className="btn-secondary"
          style={{
            backgroundColor: '#a5d6a7',
            color: '#1b5e20',
            padding: '0.75rem 1.75rem',
            borderRadius: '10px',
            fontWeight: '600',
            boxShadow: '0 6px 16px rgba(165, 214, 167, 0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'none')}
        >
          {t('common.bookAppointment')}
        </Link>
      </div>
    </div>

    {/* Right Column: Image */}
    <div
      className="hero-image"
      style={{
        flex: '1 1 400px',
        textAlign: 'center',
        animation: 'fadeInRight 1s ease-out',
      }}
    >
      <img
        src={doctorImage}
        alt="Doctor Illustration"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  </div>
      </section>



      {/* About Us Section */}
      {data?.template?.aboutUs && (
        <section style={{ background: '#f6fafd', padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            
            {/* Image */}
            {data.template.aboutUs.image && (
              <div>
                <img
                  src={data.template.aboutUs.image}
                  alt="About Us"
                  style={{
                    width: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                color: 'rgb(46, 125, 50)', // Dark blue primary
                fontWeight: 700,
                marginBottom: '1rem'
              }}>
                {data.template.aboutUs.heading}
              </h2>

              <p style={{
                fontSize: '1.1rem',
                color: '#37474f',
                lineHeight: '1.8',
                marginBottom: '2rem'
              }}>
                {data.template.aboutUs.description}
              </p>

              {/* Contact Card */}
              {data.clinic && (
                <div style={{
                  background: '#ffffff',
                  borderLeft: '5px solid rgb(46, 125, 50)', // Blue border for accent
                  borderRadius: '12px',
                  padding: '1.5rem 2rem',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                }}>
                  <h3 style={{ color: '#1976d2', fontWeight: '600', marginBottom: '1rem' }}>
                    {t('common.contactInformation')}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem', lineHeight: '1.8' }}>
                    <li><strong style={{ color: 'black' }}>📞 {t('common.phone')}:</strong> {data.clinic.phone}</li>
                    <li><strong style={{ color: 'black' }}>✉️ {t('common.email')}:</strong> {data.clinic.email}</li>
                    <li><strong style={{ color: 'black' }}>📍 {t('common.address')}:</strong> {data.clinic.address}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}



      {/* Featured Doctors Section */}
      {doctors.length > 0 && (
        <section className="section" style={{ padding: '4rem 0', backgroundColor: '#f0fdf4' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ color: '#2e7d32', textAlign: 'center' }}>{t('home.ourExpertDoctors')}</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '8rem'
            }}>
            {doctors.slice(0, 3).map(doctor => {
              const cleanDescription = doctor.description
                ? doctor.description
                    .replace(/<\/?p>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\\r\\n/g, '')
                    .replace(/\\"/g, '')
                    .trim()
                : t('home.experiencedDescription');

              return (
                <div key={doctor.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  paddingTop: '4.5rem',
                  paddingBottom: '2rem',
                  paddingInline: '1.5rem',
                  position: 'relative',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                }}>
                  {/* Circular Avatar */}
                  <div style={{
                    position: 'absolute',
                    top: '-70px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '5px solid white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    backgroundColor: '#e0f2f1'
                  }}>
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name || `${t('for_all.doctor')} ${doctor.teamMemberId}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#2e7d32'
                      }}>
                        {(doctor.name || t('for_all.doctor')).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <h3 style={{ color: '#1b4332', marginTop: '1rem' }}>{doctor.name || `${t('for_all.doctor')} ${doctor.teamMemberId}`}</h3>
                  <p style={{ color: '#4e6e58', margin: '0.5rem 0' }}>{cleanDescription}</p>
                  {doctor.teamMemberId && (
                    <p style={{ color: 'rgb(76, 175, 80)', fontWeight: 'bold' }}>{t('home.teamId')}: {doctor.teamMemberId}</p>
                  )}
                  <Link to={createUserLink(`/doctors/${doctor.id}`)} style={{
                    backgroundColor: 'rgb(76, 175, 80)',
                    color: 'rgb(255, 255, 255)',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '25px',
                    marginTop: '1rem',
                    display: 'inline-block',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}>
                    {t('common.viewProfile')}
                  </Link>
                </div>
              );
            })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to={createUserLink('/doctors')} className="btn" style={{
                backgroundColor: '#a5d6a7',
                color: '#1b5e20',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px'
              }}>{t('home.viewAllDoctors')}</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{ backgroundColor: '#e3f2e1', padding: '5rem 0' }}>
        <div style={{
          backgroundColor: '#f1fdf1',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
          borderRadius: '20px',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '3rem 2rem'
        }}>
          <h2 style={{
            color: '#2e7d32', // Deep green for heading
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            {t('home.ctaHeading')}
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#4e6e58',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {t('home.ctaDescription')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to={createUserLink('/find-doctor')}
              style={{
                backgroundColor: '#43a047',
                color: '#fff',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(67, 160, 71, 0.3)',
                textDecoration: 'none',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(67, 160, 71, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(67, 160, 71, 0.3)';
              }}
            >
              {t('home.findDoctor')}
            </Link>

            <Link
              to={createUserLink('/appointment')}
              style={{
                backgroundColor: '#dcedc8',
                color: '#2e7d32',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(200, 230, 201, 0.5)',
                textDecoration: 'none',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(200, 230, 201, 0.7)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 230, 201, 0.5)';
              }}
            >
              {t('clinics.bookAppointment')}
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
