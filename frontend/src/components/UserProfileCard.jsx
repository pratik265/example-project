import React, { useState, useEffect } from 'react';
import { getInitialData } from '../services/api';

const UserProfileCard = ({ isVisible, onClose }) => {
  const [userTemplate, setUserTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try 
      {
        setLoading(true);
        const data = await getInitialData();
        setUserTemplate(data.userTemplate);
      } 
      catch (err)
      {
        setError(err.message);
      } 
      finally 
      {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchUserData();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const cardStyle = {
    position: 'absolute',
    top: '60px',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    minWidth: '280px',
    zIndex: 1000,
    border: '1px solid rgba(0, 0, 0, 0.1)'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999
  };

  if (loading) {
    return (
      <>
        <div style={overlayStyle} onClick={onClose} />
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div>Loading user data...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !userTemplate) {
    return (
      <>
        <div style={overlayStyle} onClick={onClose} />
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <div>Unable to load user data</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          {/* Profile Image */}
          <div style={{ position: 'relative' }}>
            {userTemplate.profileImage ? (
              <img
                src={userTemplate.profileImage}
                alt={`${userTemplate.name} profile`}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #4CAF50'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback avatar */}
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                display: userTemplate.profileImage ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                border: '3px solid #4CAF50'
              }}
            >
              {userTemplate.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* User Information */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'black !important', fontSize: '18px' }}>
              {userTemplate.name}
            </h3>
            
            <div style={{ color: 'black !important', fontSize: '14px', marginBottom: '8px' }}>
              📧 {userTemplate.email}
            </div>
            
            <div style={{ color: 'black !important', fontSize: '14px', marginBottom: '8px' }}>
              📞 {userTemplate.phone}
            </div>
            
            <div style={{ color: 'black !important', fontSize: '14px', marginBottom: '15px' }}>
              📍 {userTemplate.address}
            </div>

            {/* User ID Badge */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              ID: {userTemplate.userId}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileCard; 