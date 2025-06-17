import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t('navigation.logo')}</h3>
          <p>{t('footer.providingQualityDescription')}</p>
          <p>{t('footer.excellenceInHealthcare')}</p>
        </div>
        
        <div className="footer-section">
          <h3>{t('footer.quickLinks')}</h3>
          <a href="/doctors">{t('navigation.doctors')}</a>
          <a href="/clinics">{t('navigation.clinics')}</a>
          <a href="/treatments">{t('navigation.treatments')}</a>
          <a href="/contact">{t('navigation.contact')}</a>
        </div>
        
        <div className="footer-section">
          <h3>{t('footer.contactInfo')}</h3>
          <p>{t('footer.email')}</p>
          <p>{t('footer.phone')}</p>
          <p>{t('footer.address')}</p>
          <p>{t('footer.hours')} {t('contact.mondayFriday')}</p>
        </div>
        
        <div className="footer-section">
          <h3>{t('footer.emergency')}</h3>
          <p style={{color: '#e74c3c', fontWeight: 'bold'}}>{t('footer.emergencyNumber')}</p>
          <p>{t('footer.afterHours')}</p>
          <p>{t('footer.emergencyAvailable')}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 {t('navigation.logo')}. {t('footer.allRightsReserved')}</p>
      </div>
    </footer>
  );
};

export default Footer; 