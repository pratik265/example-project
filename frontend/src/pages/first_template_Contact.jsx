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
    <div className="ft-contact-page">
      <section className="ft-section">
        <div className="ft-container">
          <h1 className="ft-section-title">{t('contact.title')}</h1>
          <p className="ft-section-description">
            {t('contact.description')}
          </p>

          <div className="ft-contact-grid">
            {/* Contact Form */}
            <div>
              <h2 className="ft-form-title">{t('contact.sendMessage')}</h2>
              
              {success && (
                <div className="ft-success"> 
                  {t('contact.success.message')}
                </div>
              )}
              
              {error && (
                <div className="ft-error">{error}</div>
              )}

              <form /*</div>onSubmit={handleSubmit}*/ className="ft-form">
                <div className="ft-form-group">
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

                <div className="ft-form-group">
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

                <div className="ft-form-group">
                  <label htmlFor="phone">{t('contact.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* <div className="ft-form-group">
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

                <div className="ft-form-group">
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
                  className="ft-btn ft-btn-primary ft-btn-block"
                  disabled={loading}
                >
                  {loading ? t('contact.sending') : t('contact.sendMessage')}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="ft-info-title">{t('contact.getInTouch')}</h2>
              
              <div className="ft-info-card">
                <h3 className="ft-info-card-title">📞 {t('contact.phone')}</h3>
                <p><strong>{t('contact.mainLine')}:</strong> <a href="tel:+15551234567" className="ft-info-link">(555) 123-4567</a></p>
                <p><strong>{t('contact.emergency_only')}:</strong> <a href="tel:911" className="ft-info-link ft-emergency-link">911</a></p>
                <p><strong>{t('contact.afterHours')}:</strong> <a href="tel:+15559990000" className="ft-info-link">(555) 999-0000</a></p>
              </div>

              <div className="ft-info-card">
                <h3 className="ft-info-card-title">✉️ {t('contact.email')}</h3>
                <p><strong>{t('contact.general_inquiries')}:</strong> <a href="mailto:info@medicareplus.com" className="ft-info-link">info@medicareplus.com</a></p>
                <p><strong>{t('contact.appointments')}:</strong> <a href="mailto:appointments@medicareplus.com" className="ft-info-link">appointments@medicareplus.com</a></p>
                <p><strong>{t('contact.billing')}:</strong> <a href="mailto:billing@medicareplus.com" className="ft-info-link">billing@medicareplus.com</a></p>
              </div>

              <div className="ft-info-card">
                <h3 className="ft-info-card-title">🕒 {t('contact.Hours')}</h3>
                <p><strong>{t('contact.Monday')} - {t('contact.Friday')}:</strong> 8:00 AM - 6:00 PM</p>
                <p><strong>{t('contact.Saturday')}:</strong> 9:00 AM - 3:00 PM</p>
                <p><strong>{t('contact.Sunday')}:</strong> {t('contact.emergency_only')}</p>
                <p className="ft-emergency-hours"><strong>{t('contact.Emergency_services_available')}</strong></p>
              </div>

              <div className="ft-info-card">
                <h3 className="ft-info-card-title">{t('contact.mainLocation')}</h3>
                <p>{t('contact.Healthcare_Blvd')}<br />{t('contact.Medical_City_MC')}</p>
                <button 
                  onClick={() => window.open('https://maps.google.com/?q=123+Healthcare+Blvd+Medical+City', '_blank')}
                  className="ft-btn ft-btn-secondary ft-mt-1"
                >
                  {t('contact.getDirections')}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="ft-faq-section">
            <h2 className="ft-faq-title">
            {t('contact.frequently_asked_questions')}
            </h2>
            <div className="ft-faq-grid">
              <div className="ft-info-card">
                <h3 className="ft-info-card-title">{t('contact.question_one')}</h3>
                <p>{t('contact.answer_one')}</p>
              </div>
              
              <div className="ft-info-card">
                <h3 className="ft-info-card-title">{t('contact.question_two')}</h3>
                <p>{t('contact.answer_two')}</p>
              </div>
              
              <div className="ft-info-card">
                <h3 className="ft-info-card-title">{t('contact.question_three')}</h3>
                <p>{t('contact.answer_three')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 