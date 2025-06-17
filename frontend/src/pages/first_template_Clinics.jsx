import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { getClinics } from '../services/api';
// import First_template_Header from '../components/first_template_Header';
// import First_template_Footer from '../components/first_template_Footer';

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
        <div className="ft-clinic-image-container">
          <img 
            src={branch.image} 
            alt={branch.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="ft-branch-letter-avatar">${branch.name.charAt(0)}</div>`;
            }}
          />
        </div>
      );
    }
    return (
      <div className="ft-clinic-image-container">
        <div className="ft-branch-letter-avatar">
          {branch.name.charAt(0)}
        </div>
      </div>
    );
  };

  if (userLoading || loading) {
    return (
      <div className="ft-loading-container">
        <div className="ft-loading-spinner"></div>
        <p>Loading clinics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ft-error-container">
        <div className="ft-error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="ft-btn ft-btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="ft-clinics-page">
      
      <section className="ft-section">
        <div className="ft-container">
          <h1 className="ft-section-title">{t('navigation.clinics')}</h1>
          <p className="ft-section-subtitle">
            {t('clinics.description')}
          </p>

          <div className="ft-cards-grid">
            {clinics.map((branch) => (
              <div key={branch.id} className="ft-clinic-card">
                {renderBranchImage(branch)}
                <div className="ft-clinic-content">
                  <h3 className="ft-clinic-name">{branch.name}</h3>
                  
                  <div className="ft-info-section">
                    {/* Address */}
                    <div className="ft-info-row">
                      {branch.address ? (
                        <>
                          <FaMapMarkerAlt className="ft-info-icon" />
                          <span>{branch.address}</span>
                        </>
                      ) : <span></span>}
                    </div>
                    
                    {/* Divider */}
                    <div className="ft-divider"></div>
                    
                    {/* Description */}
                    <div 
                      className="ft-clinic-description"
                      dangerouslySetInnerHTML={{ 
                        __html: branch.description || '' 
                      }}
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="ft-clinic-hours-info">
                    <div className="ft-info-header">
                      <FaClock className="ft-info-icon" />
                      <h4>{t('for_all.workingHours')}</h4>
                    </div>
                    <div className="ft-working-hours">
                      {sortDaysByOrder(branch.schedule).map((day, index) => (
                        <div key={index} className="ft-working-day">
                          <strong>{capitalizeDayName(day.day_name)}</strong>
                          <span>{day.time_ranges}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ft-card-actions">
                    <Link 
                      to={createUserLink(`/treatments?branch=${branch.id}`)} 
                      className="ft-btn ft-btn-primary"
                    >
                      <FaCalendarAlt className="ft-btn-icon" />
                      {t('clinics.bookAppointment')}
                    </Link>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ft-btn ft-btn-secondary"
                    >
                      <FaMapMarkerAlt className="ft-btn-icon" />
                      {t('clinics.getDirections')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ft-contact-section">
            <h2 className="ft-section-title">{t('for_all.needhelptofindlocation')}</h2>
            <p>{t('clinics.help_finding')}</p>
            <div className="ft-contact-actions">
              <Link to={createUserLink('/contact')} className="ft-btn ft-btn-primary">
                <FaEnvelope className="ft-btn-icon" /> {t('contact.title')}
              </Link>
              <a href={`tel:+15551234567`} className="ft-btn ft-btn-secondary">
                <FaPhone className="ft-btn-icon" /> (555) 123-4567
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

    </div>
  );
};

export default Clinics; 