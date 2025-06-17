import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import { useLanguage } from './contexts/LanguageContext';

const FiveTemplate = () => {
  const { currentUser } = useUser();
  const { t } = useLanguage();

  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
      <header style={{ backgroundColor: '#005f73', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>User</div>
        <nav className="nav">
            <Link to={createUserLink('/')}>{t('nav.home')}</Link>
            <Link to={createUserLink('/doctors')}>{t('nav.doctors')}</Link>
            <Link to={createUserLink('/treatments')}>{t('nav.treatments')}</Link>
            <Link to={createUserLink('/clinics')}>{t('nav.clinics')}</Link>
            <Link to={createUserLink('/contact')}>{t('nav.contact')}</Link>
          </nav>
        <button style={{ backgroundColor: '#94d2bd', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Login</button>
      </header>

      <section style={{ backgroundColor: '#0a9396', color: 'white', textAlign: 'center', padding: '4rem 2rem' }}>
        <h1>User</h1>
        <p>
          It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <button style={{ margin: '0 1rem', padding: '0.75rem 1.5rem', backgroundColor: '#ee9b00', color: 'white', border: 'none', borderRadius: '5px' }}>Find a Doctor</button>
          <button style={{ margin: '0 1rem', padding: '0.75rem 1.5rem', backgroundColor: '#ee9b00', color: 'white', border: 'none', borderRadius: '5px' }}>Book Appointment</button>
        </div>
      </section>

      <footer style={{ backgroundColor: '#003845', color: 'white', padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', margin: '1rem' }}>
            <h4>MediCare+</h4>
            <p>Providing quality medical care with compassion and expertise.</p>
          </div>
          <div style={{ flex: '1 1 150px', margin: '1rem' }}>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>Doctors</li>
              <li>Clinics</li>
              <li>Treatments</li>
              <li>Contact</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 200px', margin: '1rem' }}>
            <h4>Contact Info</h4>
            <p>Email: info@medicare.com</p>
            <p>Phone: (555) 123-4567</p>
            <p>Address: 123 Healthcare Blvd, Medical City</p>
          </div>
          <div style={{ flex: '1 1 200px', margin: '1rem' }}>
            <h4>Emergency</h4>
            <p>Emergency: 911</p>
            <p>After Hours: (555) 999-0000</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          &copy; 2024 MediCare+. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FiveTemplate; 