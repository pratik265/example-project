import React from 'react';
import { Link, useNavigate, Routes, Route, useLocation, useMatch } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext'; // Corrected import path
import { useAuth } from './contexts/AuthContext';
import Second_template_Header from './components/template2/Header';
import Second_template_Footer from './components/template2/Footer';
import Second_Home_page from './pages/template2/Home';
import Doctors from './pages/template2/Doctors';
import DoctorDetail from './pages/template2/DoctorDetail';
import Clinics from './pages/template2/Clinics';
import ClinicDetail from './pages/template2/ClinicDetail';
import Treatments from './pages/template2/Treatments';
import TreatmentDetails from './pages/template2/TreatmentDetails';
import TreatmentBooking from './pages/template2/TreatmentBooking';
import Contact from './pages/template2/Contact';
import Login from './pages/template2/Login';
import NotFound from './pages/template2/NotFound';
//import './Second_template_App.css';



const SecondTemplate = () => {

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

    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f9fbfc', color: '#0a2a43' }}>
    {/* HEADER */}
    <Second_template_Header />
    {/* <header style={{ background: 'linear-gradient(90deg, #308bca 0%, #2cc2a0 100%)', color: 'white', padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        <div>1985 Kerry Way, Whittier, CA, USA</div>
        <div>+1 562-789-1935</div>
      </div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <h1>DentalPro</h1>
        <div>
          <a href="#" style={{ color: 'white', margin: '0 0.75rem', textDecoration: 'none' }}>About Us</a>
          <a href="#" style={{ color: 'white', margin: '0 0.75rem', textDecoration: 'none' }}>Treatments</a>
          <a href="#" style={{ color: 'white', margin: '0 0.75rem', textDecoration: 'none' }}>Testimonials</a>
          <a href="#" style={{ color: 'white', margin: '0 0.75rem', textDecoration: 'none' }}>Blog</a>
          <a href="#" style={{ color: 'white', margin: '0 0.75rem', textDecoration: 'none' }}>Contact</a>
        </div>
        <button style={{ backgroundColor: 'white', color: '#008080', padding: '0.5rem 1rem', borderRadius: 4, border: 'none', cursor: 'pointer' }}>
          Book Appointment
        </button>
      </nav>
    </header> */}

    {/* CUSTOM CONTENT */}
    

    <main className="main-content">
      <Routes>
        {/* Default content for the first template (e.g., the original template's content) */}
        <Route index element={
            <Second_Home_page />
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
    {/* <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>Welcome to Template 1!</h1>
      <p>This is the content for template ID 1.</p>
      <img src="/template1-image.png" alt="Template 1 Specific" style={{ maxWidth: '100%', height: 'auto', marginTop: '2rem' }} />
    </section> */}

    {/* FEATURES */}
    {/* <section style={{ padding: '4rem 2rem', maxWidth: 1200, margin: 'auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem' }}>
        {['Teeth Whitening', 'Oral Surgery', 'Painless Dentistry', 'Periodontics'].map((title, i) => (
          <div key={i} style={{
            flex: '1 1 22%',
            background: 'white',
            padding: '1.5rem',
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h4>{title}</h4>
            <p>Let us show you how our experience.</p>
          </div>
        ))}
      </div>
    </section> */}

    {/* FOOTER */}
    <Second_template_Footer />
    {/* <footer style={{ background: 'linear-gradient(90deg, #308bca 0%, #2cc2a0 100%)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h4>DentalPro</h4>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div style={{ display: 'flex' }}>
            <input type="email" placeholder="Your Email" style={{ padding: '0.5rem', border: 'none', borderRadius: '4px 0 0 4px', width: '60%' }} />
            <button style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0 4px 4px 0', backgroundColor: 'white', color: '#005f73' }}>Subscribe</button>
          </div>
        </div>
        <div>
          <h4>Treatments</h4>
          <p>General Dentistry</p>
          <p>Cosmetic Dentistry</p>
          <p>Oral Health</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>1985 Kerry Way, Whittier, CA, USA</p>
          <p>Mon - Fri: 9.00 - 18.00</p>
          <p>+1-562-789-1935</p>
          <p>Dentalpro@example.com</p>
        </div>
        <div>
          <h4>We're Social</h4>
          <p>Facebook | Twitter | YouTube</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        © 2024 DentalPro. All Rights Reserved.
      </div>
    </footer> */}
  </div>
  );
};

export default SecondTemplate; 