import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getClinicById, getDoctors } from '../../services/api';

const ClinicDetail = () => {
  const { id } = useParams();
  const { currentUser, loading: userLoading } = useUser();
  const [clinic, setClinic] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to create user-aware links
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };

  useEffect(() => {
    // Don't fetch data until user context is ready
    if (userLoading || !currentUser) {
      return;
    }

    const fetchClinicData = async () => {
      try {
        setLoading(true);
        const [clinicData, doctorsData] = await Promise.all([
          getClinicById(id),
          getDoctors()
        ]);
        
        setClinic(clinicData);
        
        // Filter doctors who work at this clinic
        const clinicDoctorsList = doctorsData.filter(doctor => 
          doctor.clinicIds.includes(parseInt(id))
        );
        setClinicDoctors(clinicDoctorsList);
      } catch (err) {
        setError('Failed to load clinic information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [id, currentUser, userLoading]);

  if (userLoading || loading) return <div className="loading">Loading clinic information...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!clinic) return <div className="error">Clinic not found.</div>;

  return (
    <div className="detail-page">
      <div className="container">
        <div className="detail-header">
          <img src={clinic.image} alt={clinic.name} className="detail-image" style={{borderRadius: '12px'}} />
          <div className="detail-info">
            <h1>{clinic.name}</h1>
            
            <div className="clinic-info">
              <p><strong>📍 Address:</strong></p>
              <p style={{marginLeft: '1rem', fontSize: '1.1rem'}}>{clinic.address}</p>
              
              <p><strong>📞 Phone:</strong></p>
              <p style={{marginLeft: '1rem', fontSize: '1.1rem'}}>
                <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} style={{color: '#667eea', textDecoration: 'none'}}>
                  {clinic.phone}
                </a>
              </p>
              
              <p><strong>✉️ Email:</strong></p>
              <p style={{marginLeft: '1rem', fontSize: '1.1rem'}}>
                <a href={`mailto:${clinic.email}`} style={{color: '#667eea', textDecoration: 'none'}}>
                  {clinic.email}
                </a>
              </p>
              
              <p><strong>🕒 Operating Hours:</strong></p>
              <p style={{marginLeft: '1rem', fontSize: '1.1rem'}}>{clinic.hours}</p>
            </div>

            <div style={{marginTop: '1.5rem'}}>
              <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} className="btn btn-primary" style={{marginRight: '1rem'}}>
                Call Now
              </a>
              <Link to={createUserLink('/contact')} className="btn btn-secondary">
                Book Appointment
              </Link>
            </div>
          </div>
          <div style={{clear: 'both'}}></div>
        </div>

        {/* Services Available */}
        <div style={{marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
          <h2 style={{color: '#2c3e50', marginBottom: '1rem'}}>Services Available</h2>
          <div className="services-list">
            {clinic.services.map(service => (
              <span key={service} className="service-tag" style={{fontSize: '1rem', padding: '8px 16px'}}>
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Doctors at this location */}
        {clinicDoctors.length > 0 && (
          <div style={{marginTop: '2rem'}}>
            <h2 style={{color: '#2c3e50', marginBottom: '1rem'}}>Our Doctors at This Location</h2>
            <div className="cards-grid">
              {clinicDoctors.map(doctor => (
                <div key={doctor.id} className="card doctor-card">
                  <img src={doctor.image} alt={doctor.name} />
                  <div className="specialty">{doctor.specialty}</div>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.bio}</p>
                  <div style={{marginBottom: '1rem'}}>
                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                    <p><strong>Education:</strong> {doctor.education}</p>
                  </div>
                  <Link to={createUserLink(`/doctors/${doctor.id}`)} className="btn btn-primary">
                    {t('common.viewProfile')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directions and Additional Info */}
        <div style={{
          marginTop: '2rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem'
        }}>
          <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{color: '#667eea', marginBottom: '1rem'}}>🚗 Getting Here</h3>
            <p>Our clinic is conveniently located with ample parking available. Public transportation options are also nearby.</p>
            <p style={{marginTop: '1rem'}}>
              <strong>Address:</strong><br />
              {clinic.address}
            </p>
            <button 
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(clinic.address)}`, '_blank')}
              className="btn btn-secondary"
              style={{marginTop: '1rem'}}
            >
              Get Directions
            </button>
          </div>

          <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{color: '#667eea', marginBottom: '1rem'}}>⏰ Hours & Availability</h3>
            <p><strong>Operating Hours:</strong></p>
            <p>{clinic.hours}</p>
            <p style={{marginTop: '1rem', color: '#e74c3c'}}>
              <strong>Emergency Services:</strong><br />
              24/7 emergency care available - Call 911 for emergencies
            </p>
          </div>

          <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{color: '#667eea', marginBottom: '1rem'}}>📞 Contact Information</h3>
            <p><strong>Phone:</strong> <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} style={{color: '#667eea'}}>{clinic.phone}</a></p>
            <p><strong>Email:</strong> <a href={`mailto:${clinic.email}`} style={{color: '#667eea'}}>{clinic.email}</a></p>
            <p style={{marginTop: '1rem'}}>
              For appointments, please call during business hours or use our online contact form.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{textAlign: 'center', marginTop: '2rem', padding: '2rem', background: '#f8f9fa', borderRadius: '12px'}}>
          <h3>Ready to Schedule Your Visit?</h3>
          <p style={{color: '#6c757d', marginBottom: '1rem'}}>
            Contact {clinic.name} today to book your appointment
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} className="btn btn-primary">
              Call {clinic.phone}
            </a>
            <Link to={createUserLink('/contact')} className="btn btn-secondary">Online Contact Form</Link>
            <Link to={createUserLink('/clinics')} className="btn btn-secondary">View Other Locations</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDetail; 