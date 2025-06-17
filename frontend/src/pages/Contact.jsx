import { useState } from 'react';
// import { submitContactForm } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Contact = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await submitContactForm(formData);
  //     setSuccess(true);
  //     setFormData({
  //       name: '',
  //       email: '',
  //       phone: '',
  //       service: '',
  //       message: ''
  //     });
  //   } catch (err) {
  //     setError('Failed to submit form. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="contact-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('contact.title')}</h1>
          <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#6c757d', marginBottom: '3rem'}}>
            {t('contact.description')}
          </p>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem'}}>
            {/* Contact Form */}
            <div>
              <h2 style={{color: '#2c3e50', marginBottom: '1.5rem'}}>{t('contact.sendMessage')}</h2>
              
              {success && (
                <div className="success"> 
                  {t('contact.success.message')}
                </div>
              )}
              
              {error && (
                <div className="error">{error}</div>
              )}

              <form /*</div>onSubmit={handleSubmit}*/ className="form">
                <div className="form-group">
                  <label htmlFor="name">{t('contact.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('contact.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t('contact.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* <div className="form-group">
                  <label htmlFor="service">{t('contact.service')}</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                  >
                    <option value="">{t('contact.selectService')}</option>
                    <option value="general">{t('contact.generalConsultation')}</option>
                    <option value="cardiology">{t('contact.cardiology')}</option>
                    <option value="dermatology">{t('contact.dermatology')}</option>
                    <option value="pediatrics">{t('contact.pediatrics')}</option>
                    <option value="orthopedics">{t('contact.orthopedics')}</option>
                    <option value="emergency">{t('contact.emergencyCare')}</option>
                  </select>
                </div> */}

                <div className="form-group">
                  <label htmlFor="message">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{width: '100%'}}
                >
                  {loading ? t('contact.sending') : t('contact.sendMessage')}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 style={{color: '#2c3e50', marginBottom: '1.5rem'}}>{t('contact.getInTouch')}</h2>
              
              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', marginBottom: '2rem'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>📞 {t('contact.phone')}</h3>
                <p><strong>{t('contact.mainLine')}:</strong> <a href="tel:+15551234567" style={{color: '#667eea'}}>(555) 123-4567</a></p>
                <p><strong>{t('contact.emergency')}:</strong> <a href="tel:911" style={{color: '#e74c3c'}}>911</a></p>
                <p><strong>{t('contact.afterHours')}:</strong> <a href="tel:+15559990000" style={{color: '#667eea'}}>(555) 999-0000</a></p>
              </div>

              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', marginBottom: '2rem'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>✉️ Email</h3>
                <p><strong>General Inquiries:</strong> <a href="mailto:info@medicareplus.com" style={{color: '#667eea'}}>info@medicareplus.com</a></p>
                <p><strong>{t('contact.appointments')}:</strong> <a href="mailto:appointments@medicareplus.com" style={{color: '#667eea'}}>appointments@medicareplus.com</a></p>
                <p><strong>{t('contact.billing')}:</strong> <a href="mailto:billing@medicareplus.com" style={{color: '#667eea'}}>billing@medicareplus.com</a></p>
              </div>

              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', marginBottom: '2rem'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>🕒 Hours</h3>
                <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 9:00 AM - 3:00 PM</p>
                <p><strong>Sunday:</strong> Emergency Only</p>
                <p style={{color: '#e74c3c', marginTop: '1rem'}}><strong>Emergency services available 24/7</strong></p>
              </div>

              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>{t('contact.mainLocation')}</h3>
                <p>123 Healthcare Blvd<br />Medical City, MC 12345</p>
                <button 
                  onClick={() => window.open('https://maps.google.com/?q=123+Healthcare+Blvd+Medical+City', '_blank')}
                  className="btn btn-secondary"
                  style={{marginTop: '1rem'}}
                >
                  {t('contact.getDirections')}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div style={{marginTop: '3rem'}}>
            <h2 style={{textAlign: 'center', color: '#2c3e50', marginBottom: '2rem'}}>
              Frequently Asked Questions
            </h2>
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem'
            }}>
              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>How do I schedule an appointment?</h3>
                <p>You can schedule an appointment by calling our main line, using this contact form, or visiting any of our clinic locations during business hours.</p>
              </div>
              
              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>Do you accept insurance?</h3>
                <p>We accept most major insurance plans. Please contact us with your insurance information to verify coverage before your appointment.</p>
              </div>
              
              <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
                <h3 style={{color: '#667eea', marginBottom: '1rem'}}>What should I bring to my appointment?</h3>
                <p>Please bring a valid ID, insurance card, list of current medications, and any relevant medical records or test results.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 