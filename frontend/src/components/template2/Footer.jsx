import { useLanguage } from "../../contexts/LanguageContext";
import {
  Mail, Phone, MapPin, Clock, AlertTriangle, PhoneCall, Stethoscope, Hospital, Syringe, Contact
} from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <>
      <footer className="footer">
        <div className="footer-card">
          <div className="footer-section">
            <h3>{t('navigation.logo')}</h3>
            <p>{t('footer.providingQualityDescription')}</p>
            <p>{t('footer.excellenceInHealthcare')}</p>
          </div>

          <div className="footer-section">
            <h3>{t('footer.quickLinks')}</h3>
            <a href="/doctors"><Stethoscope size={14} /> {t('navigation.doctors')}</a>
            <a href="/clinics"><Hospital size={14} /> {t('navigation.clinics')}</a>
            <a href="/treatments"><Syringe size={14} /> {t('navigation.treatments')}</a>
            <a href="/contact"><PhoneCall size={14} /> {t('navigation.contact')}</a>
          </div>

          <div className="footer-section">
            <h3>{t('footer.contactInfo')}</h3>
            <p><Mail size={14} /> info@medicareplus.com</p>
            <p><Phone size={14} /> (555) 123-4567</p>
            <p><MapPin size={14} /> 123 Healthcare Blvd, Medical City</p>
            <p><Clock size={14} /> {t('contact.mondayFriday')}</p>
          </div>

          <div className="footer-section">
            <h3>{t('footer.emergency')}</h3>
            <p><AlertTriangle size={14} color="#ef5350" /> <span className="emergency-number">{t('footer.emergencyNumber')}</span></p>
            <p><PhoneCall size={14} /> {t('footer.afterHours')}</p>
            <p>24/7 {t('footer.emergencyAvailable')}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 {t('navigation.logo')}. {t('footer.allRightsReserved')}</p>
        </div>
      </footer>

      <style>
        {`
          .footer {
            background-color: #1b3b2f;
            padding: 60px 20px 30px;
            font-family: 'Segoe UI', sans-serif;
            color: #e8f5e9;
          }

          .footer-card {
            background-color: #264c3b;
            border-radius: 30px;
            padding: 40px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }

          .footer-section h3 {
            font-size: 1.1rem;
            margin-bottom: 20px;
            color: #a5d6a7;
          }

          .footer-section a, .footer-section p {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #d0e9dc;
            font-size: 0.95rem;
            margin-bottom: 10px;
            text-decoration: none;
          }

          .footer-section a:hover {
            color: #b2dfdb;
          }

          .emergency-number {
            font-weight: bold;
            color: #ef5350;
          }

          .footer-bottom {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            font-size: 0.9rem;
            color: #c8e6c9;
            background-color: #264c3b;
            border-radius: 10px;
          }

          @media (max-width: 600px) {
            .footer-card {
              grid-template-columns: 1fr;
              padding: 30px;
            }
          }
        `}
      </style>
    </>
  );
};

export default Footer;
