import React from 'react';
import product1 from './assets/product_01.png';
import product2 from './assets/product_02.png';
import product3 from './assets/product_03.png';
import UserProfile from './components/UserProfile';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { Link, useNavigate, useMatch, useLocation } from 'react-router-dom';
import './for_template_App.css';

const ForTemplate = () => {
  const { t, language, switchLanguage, isRTL } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const currentUser = localStorage.getItem('currentUser') || 'guest';
  const navigate = useNavigate();
  const location = useLocation();
  const userKeyMatch = useMatch('/:userKey/*');

  const createUserLink = (path) => {
    return userKeyMatch ? `${userKeyMatch.pathnameBase}${path}` : path;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    logout();
    navigate(createUserLink('/login'));
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    switchLanguage(newLanguage);
  };

  return (
    <div className={`main-container ${isRTL ? 'rtl' : ''}`}>
  
      {/* Hero Section */}
      <header className="header-section">
        <nav className="navbar container">
          <div className="navbar-left">
            <div className="user_logo"> <UserProfile size="48px" /></div>
          </div>
          <div className='nav_bar_text_and_btn'>
            <div className="navbar-right">       
                <Link to={createUserLink('/')} className='navbar'>{t('nav.home')}</Link>
                <Link to={createUserLink('/doctors')} className='navbar'>{t('nav.doctors')}</Link>
                <Link to={createUserLink('/treatments')} className='navbar'>{t('nav.treatments')}</Link>
                <Link to={createUserLink('/clinics')} className='navbar'>{t('nav.clinics')}</Link>
                <Link to={createUserLink('/contact')} className='navbar'>{t('nav.contact')}</Link>
            </div>
            <div className='lang_and_login_btn'>
              <button className='lang_btn'>en</button>
              <button className='login_btn'>log in</button>
            </div>
          </div>
        </nav>

        <div className="hero_cont_div">
          <div className="hero-text">
            <h1>Achieve clarity<br />every moment</h1>
            <p>We support individuals, couples, parents, and professionals<br /> in their journey toward emotional well-being.</p>
            <div className="hero-buttons">
              <Link to="#" className="btn-primary">Speak to a clinician</Link>
              <div className="app-badges">
                <img src="/assets/appstore.svg" alt="App Store" />
                <img src="/assets/googleplay.svg" alt="Google Play" />
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img src={product1} alt="Therapy Session" className="hero-img" />
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <div className="testimonial-logo">Trustcare</div>
            </div>
          </div>
        </div>
      </header>
  
      {/* Info Section */}
      <section className="info">
        <div className="info-pic">
          <img src={product2} alt="Therapy session" />
        </div>
        <div className="info-text">
          <h2>A safe space for mental wellness</h2>
          <p>Our clinicians create an environment of trust, reassurance, and healing.</p>
          <Link to="#" className="btn-secondary">Get in touch</Link>
        </div>
      </section>
  
      {/* Services Section */}
      <section className="services">
        <h2>Personalized therapy that works for you</h2>
        <div className="service-grid">
          <div className="card"><h3>Individual Therapy</h3><p>One‑on‑one sessions tailored to your needs.</p></div>
          <div className="card"><h3>Couples Therapy</h3><p>Navigate relationships with experienced guidance.</p></div>
          <div className="card"><h3>Family Therapy</h3><p>Support for family dynamics and communication.</p></div>
          <div className="card"><h3>Child Therapy</h3><p>Helping children cope, grow, and heal.</p></div>
          <div className="card"><h3>Anxiety Solutions</h3><p>Strategies to reduce stress and improve calm.</p></div>
          <div className="card"><h3>Depression Care</h3><p>Structured support for brighter days.</p></div>
        </div>
      </section>
  
      {/* Team Section */}
      <section className="team">
        <h2>Meet the team behind your care</h2>
        <div className="team-grid">
          <div className="member">
            <img src={product3} alt="Therapist A" />
            <h3>Dr. Anna Morales</h3>
            <p>PsyD</p>
          </div>
          <div className="member">
            <img src={product2} alt="Therapist B" />
            <h3>James Roth, PhD</h3>
            <p>Clinical Psychologist</p>
          </div>
          <div className="member">
            <img src={product1} alt="Therapist C" />
            <h3>Sofia Nguyen, LCSW</h3>
            <p>Licensed Social Worker</p>
          </div>
        </div>
      </section>
  
      {/* Testimonials */}
      <section className="testimonials">
        <h2>Hear from our satisfied clients</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">“Amazing support…”</div>
          <div className="testimonial-card">“Truly life-changing…”</div>
          <div className="testimonial-card">“Professional and caring…”</div>
        </div>
      </section>
  
      {/* FAQ Section */}
      <section className="faq">
        <h2>We’re here to answer all your questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <button>What is therapy like?</button>
            <div className="answer">Our sessions are safe and confidential…</div>
          </div>
          <div className="faq-item">
            <button>Who are your counselors?</button>
            <div className="answer">We vet each provider with care…</div>
          </div>
        </div>
      </section>
  
      {/* CTA */}
      <section className="cta">
        <h2>Find clarity, support, and direction today</h2>
        <Link to="#" className="btn-primary">Get Started</Link>
      </section>
  
      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="#">About</Link>
          <Link to="#">Resources</Link>
          <Link to="#">Social</Link>
          <Link to="#">Business</Link>
        </div>
        <p>&copy; 2025 Your Company</p>
      </footer>
    </div>
  );
  
};

export default ForTemplate;
