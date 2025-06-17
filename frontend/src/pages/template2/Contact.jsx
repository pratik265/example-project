import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ backgroundColor: '#f0fdf7',marginTop: '30px' }}>
      {/* Header */}
      <header style={{
        padding: '4rem 1rem 3rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #e6f9f0, #f4fff9)',
        borderBottom: '1px solid #c7f0e2'
      }}>
        <h1 style={{ fontSize: '2.75rem', color: '#1d7c5a' }}>{t('contact.title')}</h1>
        <p style={{ maxWidth: '700px', margin: '1rem auto', fontSize: '1.1rem', color: '#555' }}>
          {t('contact.description')}
        </p>
      </header>

      {/* Main Section */}
      <main style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '3rem',
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Contact Info Sidebar */}
        <aside style={{
          flex: '1',
          minWidth: '300px',
          background: '#ffffff',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
        }}>
          <InfoBlock title={`📞 ${t('contact.phone')}`} items={[
            { label: t('contact.mainLine'), value: '(555) 123-4567' },
            { label: t('footer.emergency'), value: '911' }
          ]} />
          <InfoBlock title={`✉️ ${t('contact.email')}`} items={[
            { label: t('contact.support'), value: 'info@clinic.com' },
            { label: t('contact.appointments'), value: 'appointments@clinic.com' }
          ]} />
          <InfoBlock title={`📍${t('contact.location')}`} items={[
            { label: t('contact.main_branch'), value: t('contact.add_medical_city') }
          ]} />
          <InfoBlock title={`🕒 ${t('clinics.hours')}`} items={[
            { label: `${t('contact.Monday')} - ${t('contact.Friday')}`, value: '8 AM - 6 PM' },
            { label: t('contact.Saturday'), value: '9 AM - 3 PM' },
            { label: t('footer.emergency'), value: '24/7' }
          ]} />
        </aside>

        {/* Contact Form */}
        <section style={{
          flex: '2',
          minWidth: '350px',
          background: '#ffffff',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ color: '#1d7c5a', marginBottom: '1.5rem' }}>{t('contact.sendMessage')}</h2>

          {success && <p style={{ color: '#28a745' }}>{t('contact.success.message')}</p>}

          <form>
            {['name', 'email', 'phone'].map((field) => (
              <div key={field} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444' }}>
                  {t(`contact.${field}`)}
                </label>
                <input
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444' }}>
                {t('contact.message')}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              ></textarea>
            </div>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? t('contact.sending') : t('contact.sendMessage')}
            </button>
          </form>
        </section>
      </main>

      {/* FAQ Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
        marginTop: '4rem'
      }}>
        <h2 style={{ textAlign: 'center', color: '#1d7c5a', marginBottom: '2rem' }}>FAQs</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <FAQCard
            question={t('contact.secont_cont_que_one')}
            answer={t('contact.secont_cont_ans_one')}
          />
          <FAQCard
            question={t('contact.secont_cont_que_two')}
            answer={t('contact.secont_cont_ans_two')}
          />
          <FAQCard
            question={t('contact.secont_cont_que_three')}
            answer={t('contact.secont_cont_ans_three')}
          />
        </div>
      </section>
    </div>
  );
};

// Info Block
const InfoBlock = ({ title, items }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h3 style={{ color: '#1d7c5a', marginBottom: '0.5rem' }}>{title}</h3>
    {items.map((item, i) => (
      <p key={i} style={{ margin: '0.2rem 0', color: '#333' }}>
        <strong>{item.label}:</strong> {item.value}
      </p>
    ))}
  </div>
);

// FAQ Card
const FAQCard = ({ question, answer }) => (
  <div style={{
    background: '#f8fefa',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)'
  }}>
    <h4 style={{ color: '#1d7c5a', marginBottom: '0.5rem' }}>{question}</h4>
    <p style={{ color: '#555' }}>{answer}</p>
  </div>
);

// Styles
const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #c2e9db',
  background: '#f9fefc',
  fontSize: '1rem'
};

const buttonStyle = {
  width: '100%',
  background: '#27a37a',
  color: '#fff',
  padding: '0.75rem',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.3s ease'
};

export default Contact;
