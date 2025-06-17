import React from 'react';
import { Link, useNavigate, Routes, Route, useLocation, useMatch } from 'react-router-dom';
//import { useTranslation } from 'react-i18next'; // Assuming you're using i18next for translations
import { useLanguage } from './contexts/LanguageContext'; // Corrected import path
//import UserProfile from './components/UserProfile'; // Corrected import path
import { useAuth } from './contexts/AuthContext';
// import myImage from './assets/first.png';
// import corona from './assets/corona.png';
// import cases1 from './assets/cases1.png';
// import cases2 from './assets/cases2.png';
// import cases3 from './assets/cases3.png';
// import doctor1 from './assets/doctor_1.png.webp';
// import doctor2 from './assets/doctor_2.png';
// import doctor3 from './assets/doctor_3.png';
// import abilityImg from './assets/ability_img.png.webp';
// import doctoe1 from './assets/doctor_1.png.webp';
// import doctoe2 from './assets/doctor_2.png';
//import doctoe3 from './assets/doctor_3.png';

import First_template_Header from './components/first_template_Header';
import First_template_Footer from './components/first_template_Footer';
import Home_page from './pages/first_template_Home';
import Doctors from './pages/first_template_Doctors';
import DoctorDetail from './pages/first_template_DoctorDetail';
import Clinics from './pages/first_template_Clinics';
import ClinicDetail from './pages/first_template_ClinicDetail';
import Treatments from './pages/first_template_Treatments';
import TreatmentDetails from './pages/first_template_TreatmentDetails';
import TreatmentBooking from './pages/first_template_TreatmentBooking';
import Contact from './pages/first_template_Contact';
import Login from './pages/first_template_Login';
import NotFound from './pages/first_template_NotFound';
import './first_template_App.css';

const FirstTemplate = () => {
  const navigate = useNavigate();
  const { t, language, switchLanguage, isRTL } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const currentUser = localStorage.getItem('currentUser') || 'guest';
  const location = useLocation();
  const userKeyMatch = useMatch('/:userKey/*'); // Match the parent route in App.jsx

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    logout();
    navigate(createUserLink('/login'));
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    switchLanguage(newLanguage);
  };
  
  const createUserLink = (path) => {
    // Ensure paths are relative to the userKey base for internal navigation
    return userKeyMatch ? `${userKeyMatch.pathnameBase}${path}` : path;
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150';
  };

  // Check if the current path is the base path for this template (e.g., /drnoagrados/)
  const isBasePath = location.pathname === `/${currentUser}/`;

  return (
    <div className="ft-main-container" style={{ fontFamily: 'Segoe UI, sans-serif', color: '#333', background: '#fff' }}>
      {/* Header */}
      <First_template_Header />

      <main className="ft-main-content">
        <Routes>
          {/* Default content for the first template (e.g., the original template's content) */}
          <Route index element={
            <Home_page />
          } />
          {/* Define routes for pages within this template */}
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="clinics" element={<Clinics />} />
          <Route path="clinics/:id" element={<ClinicDetail />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="treatments/:id" element={<TreatmentDetails />} />
          <Route path="treatments/:treatmentId/book" element={<TreatmentBooking />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <First_template_Footer />
    </div>
  );
};

export default FirstTemplate;
