import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDoctorById, getClinics } from '../services/api';

const DoctorDetail = () => {
  const { id } = useParams();
  const { currentUser, loading: userLoading } = useUser();
  const [doctor, setDoctor] = useState(null);
  const [doctorClinics, setDoctorClinics] = useState([]);
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

    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const [doctorData, clinicsData] = await Promise.all([
          getDoctorById(id),
          getClinics()
        ]);
        
        setDoctor(doctorData);
        
        // Filter clinics where this doctor works
        const doctorClinicsList = clinicsData.filter(clinic => 
          doctorData.clinicIds.includes(clinic.id)
        );
        setDoctorClinics(doctorClinicsList);
      } catch (err) {
        setError('Failed to load doctor information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [id, currentUser, userLoading]);

  if (userLoading || loading) return <div className="ft-loading">Loading doctor information...</div>;
  if (error) return <div className="ft-error">{error}</div>;
  if (!doctor) return <div className="ft-error">Doctor not found.</div>;

  return (
    <div className="ft-detail-page">
      <div className="ft-container">
        <div className="ft-detail-header">
          <img src={doctor.image} alt={doctor.name} className="ft-detail-image" />
          <div className="ft-detail-info">
            <div className="ft-specialty">{doctor.specialty}</div>
            <h1>{doctor.name}</h1>
            <p style={{fontSize: '1.2rem', color: '#6c757d', marginBottom: '1rem'}}>
              {doctor.bio}
            </p>
            <div style={{marginBottom: '1rem'}}>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>Education:</strong> {doctor.education}</p>
            </div>
            <Link to={createUserLink('/contact')} className="ft-btn ft-btn-primary">
              Book Appointment
            </Link>
          </div>
          <div style={{clear: 'both'}}></div>
        </div>

        {/* Clinic Locations */}
        <div style={{marginTop: '2rem'}}>
          <h2 style={{color: '#2c3e50', marginBottom: '1rem'}}>Available at These Locations</h2>
          <div className="ft-cards-grid">
            {doctorClinics.map(clinic => (
              <div key={clinic.id} className="ft-card ft-clinic-card">
                <img src={clinic.image} alt={clinic.name} />
                <h3>{clinic.name}</h3>
                <div className="ft-clinic-info">
                  <p><strong>📍 Address:</strong> {clinic.address}</p>
                  <p><strong>📞 Phone:</strong> {clinic.phone}</p>
                  <p><strong>✉️ Email:</strong> {clinic.email}</p>
                  <p><strong>🕒 Hours:</strong> {clinic.hours}</p>
                </div>
                <div className="ft-services-list">
                  <strong>Services:</strong>
                  {clinic.services.map(service => (
                    <span key={service} className="ft-service-tag">{service}</span>
                  ))}
                </div>
                <Link to={createUserLink(`/clinics/${clinic.id}`)} className="ft-btn ft-btn-secondary">
                  View Clinic Details
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="ft-section" style={{marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}>
          <h2 className="ft-section-title">About Dr. {doctor.name.split(' ').pop()}</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem'}}>
            <div>
              <h3 style={{color: '#667eea', marginBottom: '0.5rem'}}>Specialization</h3>
              <p>{doctor.specialty} specialist with {doctor.experience} years of experience in treating patients.</p>
            </div>
            <div>
              <h3 style={{color: '#667eea', marginBottom: '0.5rem'}}>Education</h3>
              <p>{doctor.education}</p>
            </div>
            <div>
              <h3 style={{color: '#667eea', marginBottom: '0.5rem'}}>Contact</h3>
              <p>To schedule an appointment with Dr. {doctor.name.split(' ').pop()}, please use our contact form or call any of the clinic locations listed above.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="ft-section" style={{textAlign: 'center', marginTop: '2rem', padding: '2rem', background: '#f8f9fa', borderRadius: '12px'}}>
          <h3 className="ft-section-title">Ready to Schedule Your Appointment?</h3>
          <p style={{color: '#6c757d', marginBottom: '1rem'}}>
            Contact us today to book a consultation with Dr. {doctor.name.split(' ').pop()}
          </p>
          <div className="ft-cta-buttons" style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to={createUserLink('/contact')} className="ft-btn ft-btn-primary">Book Appointment</Link>
            <Link to={createUserLink('/doctors')} className="ft-btn ft-btn-secondary">View Other Doctors</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail; 