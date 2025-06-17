import React from 'react';
import abilityImg from './assets/ability_img.png.webp';
import doctoe1 from './assets/doctor_1.png.webp';
import doctoe2  from './assets/doctor_2.png';
import doctoe3 from './assets/doctor_3.png';

import { Link, useNavigate, Routes, Route, useLocation, useMatch } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext'; // Corrected import path
import { useAuth } from './contexts/AuthContext';

import Third_template_Header from './components/template3/Header';
import Third_template_Footer from './components/template3/Footer';
import Home_page from './pages/template3/Home';
import Doctors from './pages/template3/Doctors';
import DoctorDetail from './pages/template3/DoctorDetail';
import Clinics from './pages/template3/Clinics';
import ClinicDetail from './pages/template3/ClinicDetail';
import Treatments from './pages/template3/Treatments';
import TreatmentDetails from './pages/template3/TreatmentDetails';
import TreatmentBooking from './pages/template3/TreatmentBooking';
import Contact from './pages/template3/Contact';
import Login from './pages/template3/Login';
import NotFound from './pages/template3/NotFound';

const ThirdTemplate = () => {
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', color: '#333', background: '#fff' }}>
      {/* Header */}
      <Third_template_Header />
      {/* <header style={{ background: '#f9f9f9', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><strong>Medisen</strong></div>
        <nav>
          <a href="#" style={{ margin: '0 1rem', textDecoration: 'none', color: '#222' }}>Home</a>
          <a href="#" style={{ margin: '0 1rem', textDecoration: 'none', color: '#222' }}>Doctors</a>
          <a href="#" style={{ margin: '0 1rem', textDecoration: 'none', color: '#222' }}>Treatments</a>
          <a href="#" style={{ margin: '0 1rem', textDecoration: 'none', color: '#222' }}>Blog</a>
          <a href="#" style={{ margin: '0 1rem', textDecoration: 'none', color: '#222' }}>Contact</a>
        </nav>
      </header> */}

      {/* Hero */}

      <main className="main-content">
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
      {/* <section style={{ background: '#e6f0ff', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Template 1!</h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: 'auto' }}>
          This is the content for template ID 1. Bringing the future of healthcare with quality service and expert doctors.
        </p>
        <img
          src={abilityImg}
          alt="Template 1 Specific Image"
          style={{ marginTop: '2rem', maxWidth: '400px', width: '100%' }}
        />
        <div>
          <a href="#" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.6rem 1.2rem', background: '#0540f2', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>Book Appointment</a>
        </div>
      </section> */}

      {/* Services */}
      {/* <section style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#0540f2' }}>Our Services</h2>
        <p style={{ maxWidth: '600px', margin: 'auto' }}>
          We offer Emergency Care, Dental Checkups, Surgery, Diagnostics and more with expert staff and modern technology.
        </p>
      </section> */}

      {/* Doctors */}
      {/* <section style={{ padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', color: '#0540f2', marginBottom: '2rem' }}>Experienced Doctors</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[doctoe1, doctoe2, doctoe3].map((docSrc, index) => (
            <div key={index} style={{ background: '#fff', padding: '1rem', margin: '1rem', boxShadow: '0 0 15px rgba(0,0,0,0.05)', borderRadius: '8px', flex: '1 1 220px', textAlign: 'center' }}>
              <img src={docSrc} alt={`Doctor ${index + 1}`} style={{ width: '100%', borderRadius: '4px' }} />
              <h3 style={{ marginTop: '0.8rem' }}>{`Dr. ${['Adam Hillford', 'Emily Rhodes', 'James Vick'][index]}`}</h3>
              <p>{['Heart Specialist', 'Neurologist', 'Orthopedic'][index]}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Contact */}
      {/* <section style={{ background: '#f1f6ff', textAlign: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#0540f2', marginBottom: '1rem' }}>Contact Us</h2>
        <p>Need help? Call us: +1 (800) 555-1234</p>
        <a href="#" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.6rem 1.2rem', background: '#0540f2', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>Make an Appointment</a>
      </section> */}

      {/* Footer */}
      <Third_template_Footer />
      {/* <footer style={{ background: '#0d1830', color: 'white', textAlign: 'center', padding: '2rem 1rem' }}>
        <p>&copy; 2025 Medisen. All rights reserved.</p>
      </footer> */}
    </div>
  );
};

export default ThirdTemplate;
