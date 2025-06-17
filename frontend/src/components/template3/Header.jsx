import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import UserProfile from './UserProfile';

export default function Header() {
  const { t, language, switchLanguage, isRTL } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const { currentUser, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(createUserLink('/login'));
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    switchLanguage(newLanguage);
  };

  // Helper function to create user-aware links
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  // Show loading state if user context is not ready
  if (loading || !currentUser) {
    return (
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
              Loading...
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
        <UserProfile size="60px"/>
          
          <nav className="nav">
            <Link to={createUserLink('/')}>{t('nav.home')}</Link>
            <Link to={createUserLink('/doctors')}>{t('nav.doctors')}</Link>
            <Link to={createUserLink('/treatments')}>{t('nav.treatments')}</Link>
            <Link to={createUserLink('/clinics')}>{t('nav.clinics')}</Link>
            <Link to={createUserLink('/contact')}>{t('nav.contact')}</Link>
          </nav>

          <div className="header-actions" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Language Toggler */}
            <button 
              onClick={handleLanguageToggle}
              className="language-toggler"
              title={`Switch to ${language === 'en' ? 'Hebrew' : 'English'}`}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                minWidth: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {language === 'en' ? 'עב' : 'EN'}
            </button>

            {/* User Profile or Login */}
            {isLoggedIn ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {/* <UserProfile size={60} /> */}
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('auth.logout')}
                </button>
              </div>
            ) : (
              <Link 
                to={createUserLink('/login')}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 