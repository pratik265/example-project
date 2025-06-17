import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import UserProfile from './UserProfile';

export default function Header() {
  const { t, language, switchLanguage } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const { currentUser, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(createUserLink('/login'));
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    switchLanguage(newLang);
  };

  const createUserLink = (path) => `/${currentUser}${path}`;

  if (loading || !currentUser) {
    return (
      <header style={headerStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Left: Brand + Profile */}
        <div style={leftSection}>
          <UserProfile size="48px" />
          <div style={brandStyle}>WellNest+</div>
        </div>

        {/* Navigation */}
        <nav style={navStyle}>
          <Link to={createUserLink('/')} style={navLink}>🏠 {t('nav.home')}</Link>
          <Link to={createUserLink('/doctors')} style={navLink}>👨‍⚕️ {t('nav.doctors')}</Link>
          <Link to={createUserLink('/treatments')} style={navLink}>💊 {t('nav.treatments')}</Link>
          <Link to={createUserLink('/clinics')} style={navLink}>🏥 {t('nav.clinics')}</Link>
          <Link to={createUserLink('/contact')} style={navLink}>📞 {t('nav.contact')}</Link>
        </nav>

        {/* Right: Language + Auth */}
        <div style={rightSection}>
          <button onClick={handleLanguageToggle} style={langButton}>
            {language === 'en' ? 'עב' : 'EN'}
          </button>

          {isLoggedIn ? (
            <button onClick={handleLogout} style={logoutButton}>
              {t('auth.logout')}
            </button>
          ) : (
            <Link to={createUserLink('/login')} style={loginButton}>
              {t('auth.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// === Nature Wellness Theme: Glassmorphism Style ===

const headerStyle = {
  backdropFilter: 'blur(12px)',
  background: 'rgba(236, 253, 245, 0.75)',
  borderBottom: '5px solid rgb(138 193 157)',
  borderRadius: '0 0 50px 50px',
  padding: '1rem 0',
  margin: '0 auto',
  width: '95%',
  top: '0px',
  left: 0,
  right: 0,
  position: 'fixed',
  zIndex: 1000,
  boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
};

const containerStyle = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const loadingStyle = {
  color: '#065f46',
  fontWeight: 500,
};

const leftSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const brandStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#065f46',
  fontFamily: 'Segoe UI, sans-serif',
};

const navStyle = {
  display: 'flex',
  gap: '1.2rem',
};

const navLink = {
  textDecoration: 'none',
  color: '#064e3b',
  fontWeight: '600',
  padding: '6px 12px',
  borderRadius: '8px',
  transition: 'all 0.3s',
  fontSize: '1rem',
  backgroundColor: 'transparent',
};

const rightSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const langButton = {
  padding: '6px 12px',
  borderRadius: '6px',
  background: '#d1fae5',
  border: '1px solid #a7f3d0',
  color: '#065f46',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.3s',
};

const loginButton = {
  padding: '8px 16px',
  borderRadius: '9999px',
  background: '#34d399',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: '600',
  boxShadow: '0 2px 6px rgba(52, 211, 153, 0.3)',
  transition: 'all 0.3s ease',
};

const logoutButton = {
  ...langButton,
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  color: '#064e3b',
};
