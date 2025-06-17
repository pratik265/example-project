import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import UserProfile from './UserProfile';

export default function HeaderTheme2() {
  const { t, language, switchLanguage } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(createUserLink('/login'));
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    switchLanguage(newLanguage);
  };

  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  const navLinkStyle = {
    color: '#e0aaff',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #6a00f4, #9333ea)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.5)',
    transition: 'all 0.3s ease'
  };

  return (
    <header
      className="header"
      style={{
        background: 'rgba(40, 0, 60, 0.8)',
        borderBottom: '3px solid #9333ea',
        padding: '1rem 0',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 4px 20px rgba(147, 51, 234, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="header-content"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <UserProfile size="60px" />

          <nav
            className="nav"
            style={{
              display: 'flex',
              gap: '1.5rem'
            }}
          >
            <Link to={createUserLink('/')} style={navLinkStyle}>{t('nav.home')}</Link>
            <Link to={createUserLink('/doctors')} style={navLinkStyle}>{t('nav.doctors')}</Link>
            <Link to={createUserLink('/treatments')} style={navLinkStyle}>{t('nav.treatments')}</Link>
            <Link to={createUserLink('/clinics')} style={navLinkStyle}>{t('nav.clinics')}</Link>
            <Link to={createUserLink('/contact')} style={navLinkStyle}>{t('nav.contact')}</Link>
          </nav>

          <div
            className="header-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <button
              onClick={handleLanguageToggle}
              title={`Switch to ${language === 'en' ? 'Hebrew' : 'English'}`}
              style={buttonStyle}
            >
              {language === 'en' ? 'עב' : 'EN'}
            </button>

            {isLoggedIn ? (
              <button onClick={handleLogout} style={buttonStyle}>
                {t('auth.logout')}
              </button>
            ) : (
              <Link
                to={createUserLink('/login')}
                style={{
                  ...buttonStyle,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
