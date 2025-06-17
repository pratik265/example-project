import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile'; // Adjust the import path based on your file structure

const navLinkStyle = {
  color: '#00f2ff',
  textDecoration: 'none',
  fontSize: '1.1rem',
  fontWeight: '600',
  transition: 'color 0.3s ease'
};

const buttonStyle = {
  background: 'linear-gradient(45deg, #00f2ff, #00a1ff)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '25px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(0, 242, 255, 0.4)',
  transition: 'all 0.3s ease'
};

const NewHeaderTheme1 = ({ isLoggedIn, language, t, handleLogout, handleLanguageToggle, createUserLink }) => {
  return (
    <header
      className="header"
      style={{
        background: 'rgba(30, 30, 60, 0.85)',
        borderBottom: '3px solid #00f2ff',
        padding: '1rem 0',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 242, 255, 0.2)',
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
};

export default NewHeaderTheme1;
