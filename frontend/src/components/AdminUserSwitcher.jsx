import React from 'react';
import { useUser } from '../contexts/UserContext';

export default function AdminUserSwitcher() {
  const { currentUser, availableUsers, switchUser, loading } = useUser();

  const handleUserSwitch = (userKey) => {
    if (userKey !== currentUser) {
      switchUser(userKey);
    }
  };

  // Don't render if loading
  if (loading) {
    return (
      <div style={{
        padding: '16px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        margin: '16px 0'
      }}>
        <div style={{ color: '#64748b', fontSize: '14px' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      margin: '16px 0',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          🔄 User Switcher
        </h3>
        <p style={{
          margin: 0,
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px'
        }}>
          Switch between available user contexts
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {availableUsers.map((userKey) => {
          const isActive = currentUser === userKey;
          
          return (
            <button
              key={userKey}
              onClick={() => handleUserSwitch(userKey)}
              style={{
                padding: '16px 20px',
                border: 'none',
                borderRadius: '8px',
                background: isActive 
                  ? 'rgba(255, 255, 255, 1)' 
                  : 'rgba(255, 255, 255, 0.2)',
                color: isActive ? '#667eea' : 'white',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                boxShadow: isActive 
                  ? '0 4px 15px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0px)';
                }
              }}
            >
              {isActive && (
                <span style={{
                  fontSize: '14px',
                  marginRight: '4px'
                }}>
                  ✓
                </span>
              )}
              <span>{userKey}</span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  background: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center'
      }}>
        Current Active User: <strong style={{ color: 'white' }}>{currentUser}</strong>
      </div>
    </div>
  );
} 