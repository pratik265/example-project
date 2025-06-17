import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { getClinics } from '../../services/api';

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, language } = useLanguage();
  const { currentUser, loading: userLoading } = useUser();

  // Helper function to create user-aware links
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  useEffect(() => {
    // Don't fetch data until user context is ready
    if (userLoading || !currentUser) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getClinics();
        
        if (isMounted) {
          setClinics(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError('Failed to load clinics. Please try again later.');
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [currentUser, userLoading]);

  const formatTime = (time) => {
    return time?.padStart(5, '0') || '';
  };

  // Function to sort days in proper order (Sunday to Saturday) and group duplicate days
  const sortDaysByOrder = (schedule) => {
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Handle undefined or empty schedule
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return dayOrder.map(dayName => ({
        day_name: dayName,
        time_ranges: '-'
      }));
    }
    
    // Group by day name and combine time ranges
    const groupedByDay = schedule.reduce((acc, day) => {
      if (day && day.day_name) {
        const dayName = day.day_name.toLowerCase();
        if (!acc[dayName]) {
          acc[dayName] = [];
        }
        acc[dayName].push(`${formatTime(day.start_time)} - ${formatTime(day.end_time)}`);
      }
      return acc;
    }, {});
    
    // Create array with all 7 days, showing "-" for days without working hours
    const allDays = dayOrder.map(dayName => ({
      day_name: dayName,
      time_ranges: groupedByDay[dayName] ? groupedByDay[dayName].join(' | ') : '-'
    }));
    
    return allDays;
  };

  // Function to capitalize day names properly
  const capitalizeDayName = (dayName) => {
    return dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
  };

  const renderBranchImage = (branch) => {
    if (branch.image) {
      return (
        <div className="clinic-image-container">
          <img 
            src={branch.image} 
            alt={branch.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="branch-letter-avatar">${branch.name.charAt(0)}</div>`;
            }}
          />
        </div>
      );
    }
    return (
      <div className="clinic-image-container">
        <div className="branch-letter-avatar">
          {branch.name.charAt(0)}
        </div>
      </div>
    );
  };

  if (userLoading || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading clinics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="clinics-page">
      
      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('navigation.clinics')}</h1>
          <p className="section-subtitle">
            {t('clinics.description')}
          </p>

          <div className="cards-grid">
            {clinics.map((branch) => (
              <div key={branch.id} className="clinic-card">
                {renderBranchImage(branch)}
                <div className="clinic-content">
                  <h3 className="clinic-name">{branch.name}</h3>
                  
                  <div className="info-section">
                    {/* Address */}
                    <div className="info-row">
                      {branch.address ? (
                        <>
                          <FaMapMarkerAlt className="info-icon" />
                          <span>{branch.address}</span>
                        </>
                      ) : <span></span>}
                    </div>
                    
                    {/* Divider */}
                    <div className="divider"></div>
                    
                    {/* Description */}
                    <div 
                      className="clinic-description"
                      dangerouslySetInnerHTML={{ 
                        __html: branch.description || '' 
                      }}
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="clinic-info">
                    <div className="info-header">
                      <FaClock className="info-icon" />
                      <h4>{t('for_all.workingHours')}</h4>
                    </div>
                    <div className="working-hours">
                      {sortDaysByOrder(branch.schedule).map((day, index) => (
                        <div key={index} className="working-day">
                          <strong>{capitalizeDayName(day.day_name)}</strong>
                          <span>{day.time_ranges}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card-actions">
                    <Link 
                      to={createUserLink(`/treatments?branch=${branch.id}`)} 
                      className="btn btn-primary"
                    >
                      <FaCalendarAlt className="btn-icon" />
                      {t('clinics.bookAppointment')}
                    </Link>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                    >
                      <FaMapMarkerAlt className="btn-icon" />
                      {t('clinics.getDirections')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-section">
            <h2>{t('for_all.needhelptofindlocation')}</h2>
            <p>Our patient services team is here to help you choose the most convenient clinic for your needs.</p>
            <div className="contact-actions">
              <Link to={createUserLink('/contact')} className="btn btn-primary">
                <FaEnvelope className="btn-icon" /> Contact Us
              </Link>
              <a href={`tel:+15551234567`} className="btn btn-secondary">
                <FaPhone className="btn-icon" /> (555) 123-4567
              </a>
            </div>
          </div>

          {/* Book Appointment Section */}
          {/* <div className="book-appointment-section">
            <h2>{t('clinics.bookAppointmentTitle') || 'Book Your Appointment Today'}</h2>
            <p>{t('clinics.bookAppointmentDescription') || 'Choose from our range of treatments and book at your preferred clinic location.'}</p>
            <div className="appointment-buttons">
              <Link to={createUserLink('/treatments')} className="btn btn-primary">
                <FaCalendarAlt className="btn-icon" />
                {t('clinics.viewAllTreatments') || 'View All Treatments'}
              </Link>
              <Link to={createUserLink('/doctors')} className="btn btn-secondary">
                {t('clinics.viewDoctors') || 'View Our Doctors'}
              </Link>
            </div>
          </div> */}
        </div>
      </section>

      <style jsx="">{`
        .clinic-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .clinic-image-container {
          width: 100%;
          height: 200px;
          position: relative;
          overflow: hidden;
        }

        .clinic-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .branch-letter-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #667eea;
          color: white;
          font-size: 3rem;
          font-weight: 600;
        }

        .clinic-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 450px;
        }

        .clinic-name {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
          height: 2rem;
        }

        .info-section {
          min-height: 80px;
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #4a5568;
          min-height: 20px;
        }

        .info-icon {
          margin-top: 4px;
          flex-shrink: 0;
          color: #667eea;
        }

        .clinic-description {
          color: #4a5568;
          margin-bottom: 0.5rem;
          line-height: 1.5;
          min-height: 20px;
        }

        .clinic-description p {
          margin: 0.5rem 0;
        }

        .clinic-description span {
          display: inline;
        }

        .clinic-description p:first-child {
          margin-top: 0;
        }

        .clinic-description p:last-child {
          margin-bottom: 0;
        }

        .clinic-info {
          background: #f7fafc;
          padding: 1.25rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .info-header h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .working-hours {
          display: grid;
          gap: 0.5rem;
        }

        .working-day {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0.75rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .working-day strong {
          color: #2d3748;
          font-weight: 500;
          min-width: 100px;
        }

        .working-day span {
          color: #4a5568;
        }

        .card-actions {
          margin-top: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding-top: 1.5rem;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .btn-primary {
          background: #667eea;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #5a67d8;
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 1px solid #667eea;
        }

        .btn-secondary:hover {
          background: #f7fafc;
        }

        .contact-section {
          margin-top: 4rem;
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .contact-section h2 {
          color: #2d3748;
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }

        .contact-section p {
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .contact-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0.5rem 0;
          width: 100%;
        }

        .book-appointment-section {
          margin-top: 4rem;
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .book-appointment-section h2 {
          color: #2d3748;
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }

        .book-appointment-section p {
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .appointment-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            grid-template-columns: 1fr;
          }

          .contact-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Clinics; 