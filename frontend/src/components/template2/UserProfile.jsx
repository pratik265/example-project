import React, { useState, useEffect } from 'react';
import { getInitialData } from '../../services/api';
import UserProfileCard from './UserProfileCard';

const UserProfile = ({ className = '', size = '40px' }) => {
  const [userTemplate, setUserTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);

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

    fetchUserData();
  }, []);

  const handleProfileClick = () => {
    setShowProfileCard(!showProfileCard);
  };

  if (loading) {
    return (
      <div 
        className={`user-profile-placeholder ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666'
        }}
      >
        ...
      </div>
    );
  }

  if (error || !userTemplate) {
    return (
      <div 
        className={`user-profile-placeholder ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#666'
        }}
      >
        {userTemplate?.name?.charAt(0) || 'U'}
      </div>
    );
  }

  return (
    <div className={`user-profile ${className}`} style={{ position: 'relative' }}>
      <div 
        onClick={handleProfileClick}
        style={{
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          borderRadius: '50%',
          ':hover': {
            transform: 'scale(1.05)'
          }
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        {userTemplate.profileImage ? (
          <img
            src={userTemplate.profileImage}
            alt={`${userTemplate.name} profile`}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback avatar with user's initial */}
        <div 
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            display: userTemplate.profileImage ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {userTemplate.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* Profile Card Dropdown */}
      <UserProfileCard 
        isVisible={showProfileCard} 
        onClose={() => setShowProfileCard(false)} 
      />
    </div>
  );
};

export default UserProfile; 