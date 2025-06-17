import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { getDoctors } from '../../services/api';

const Doctors = () => {
  const { t } = useLanguage();
  const { currentUser, loading: userLoading } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAttemptRef = useRef(0);

  useEffect(() => {
    if (userLoading || !currentUser) return;

    const abortController = new AbortController();
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        if (fetchAttemptRef.current === 0) {
          setLoading(true);
        }

        const data = await getDoctors(abortController.signal);
        if (isMounted) {
          setDoctors(data.filter((doctor) => doctor.status === '1'));
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;

        if (err.message === 'Server not ready' && fetchAttemptRef.current === 0) {
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
  }, [currentUser, userLoading]);

  const createUserLink = (path) => `/${currentUser}${path}`;

  if (userLoading || loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctors-page" style={{ backgroundColor: '#f4fdf7' }}>
      <section className="section">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ textAlign: 'center', color: '#2f684e', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t('doctors.title')}
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#6b8f7a', marginBottom: '3rem' }}>
            {t('doctors.description')}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {doctors.map((doctor) => {
              const cleanDescription = doctor.description
                ? doctor.description.replace(/<\/?p>/g, '').replace(/&nbsp;/g, ' ').replace(/\\r\\n/g, '').trim()
                : 'Experienced medical professional dedicated to providing quality healthcare.';

              return (
                <div
                  key={doctor.id}
                  style={{
                    display: 'flex',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2f0e9',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#4cc58c',
                      background: 'linear-gradient(135deg,rgb(106, 221, 168), #f4fff9)',
                      width: '140px',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '10%',
                        overflow: 'hidden',
                        border: '3px solid #fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                    >
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            background: '#6fcf97',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '2rem',
                          }}
                        >
                          {doctor.name?.trim().charAt(0).toUpperCase() || 'D'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2f684e', marginBottom: '0.5rem' }}>
                      {doctor.name}
                    </h3>
                    <p style={{ color: '#6b8f7a', fontSize: '0.95rem', marginBottom: '1rem' }}>
                      {cleanDescription}
                    </p>
                    <Link
                      to={createUserLink(`/doctors/${doctor.id}`)}
                      style={{
                        backgroundColor: '#4cc58c',
                        color: '#fff',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'background 0.3s ease',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#3bbf7b')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = '#4cc58c')}
                    >
                      {t('common.viewProfile')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {doctors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b8f7a' }}>
              <p>{t('doctors.noDoctorsFound')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Doctors;
