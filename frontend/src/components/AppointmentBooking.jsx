import React, { useState, useEffect } from 'react';
import { createAppointment } from '../services/api';
import { isLoggedIn, getCustomerId, validateCustomerId } from '../utils/auth';

const AppointmentBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    // Check both if customer_id exists and is valid
    const checkLoginStatus = () => {
      const loggedIn = isLoggedIn() && validateCustomerId();
      setIsUserLoggedIn(loggedIn);
      
      if (!loggedIn && getCustomerId()) {
        // If we have an invalid customer_id, show error
        setError('Your session has expired. Please login again.');
      }
    };

    checkLoginStatus();
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleAppointmentSubmit = async (paymentResult) => {
    // Recheck login status before proceeding
    if (!isLoggedIn() || !validateCustomerId()) {
      setError('Please login first to book an appointment');
      setIsUserLoggedIn(false);
      return;
    }

    // Only proceed if payment was successful
    if (!paymentResult.success) {
      setError('Payment failed. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        branch: '38', // You can make this dynamic based on your needs
        startTime: '06:50', // These should come from your form/time selection
        endTime: '07:00',
        date: '2025-05-31', // This should come from your date picker
        appointmentTypeId: '699' // This should be based on the type of appointment selected
      };

      const response = await createAppointment(appointmentData);

      if (response.success) {
        setSuccess(true);
        // Handle successful booking (e.g., show confirmation, redirect, etc.)
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingContent = () => {
    if (!isUserLoggedIn) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ marginBottom: '15px', color: '#fff' }}>
            Please login first to book an appointment
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '5px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      );
    }

    return (
      <>
        {error && (
          <div style={{ 
            color: '#ff4757', 
            marginBottom: '10px',
            padding: '10px',
            background: 'rgba(255, 71, 87, 0.1)',
            borderRadius: '5px'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ 
            color: '#28a745',
            marginBottom: '10px',
            padding: '10px',
            background: 'rgba(40, 167, 69, 0.1)',
            borderRadius: '5px'
          }}>
            Appointment booked successfully!
          </div>
        )}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            color: '#fff'
          }}>
            Loading...
          </div>
        )}
        
        <button 
          onClick={() => handleAppointmentSubmit({ success: true })}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </>
    );
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {renderBookingContent()}
    </div>
  );
};

export default AppointmentBooking; 