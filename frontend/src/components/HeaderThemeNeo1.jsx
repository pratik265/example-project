import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

export default function UserSwitcher() {
  const { currentUser, availableUsers, switchUser, loading } = useUser();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleUserSwitch = (userKey) => {
    if (userKey !== currentUser) {
      switchUser(userKey);
    }
    setIsOpen(false);
  };

  // Don't render if loading or no users available
  if (loading || !availableUsers || availableUsers.length <= 1) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: '600',
          textTransform: 'capitalize',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '120px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <span>{currentUser}</span>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          fontSize: '0.7rem'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {availableUsers.map((userKey) => (
              <button
                key={userKey}
                onClick={() => handleUserSwitch(userKey)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: currentUser === userKey ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: currentUser === userKey ? '#1e40af' : '#374151',
                  fontSize: '0.9rem',
                  fontWeight: currentUser === userKey ? '600' : '500',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  if (currentUser !== userKey) {
                    e.target.style.background = 'rgba(59, 130, 246, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentUser !== userKey) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{userKey}</span>
                {currentUser === userKey && (
                  <span style={{
                    color: '#10b981',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 