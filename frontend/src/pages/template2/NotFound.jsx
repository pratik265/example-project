import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* 404 Icon */}
        <div style={{
          fontSize: '8rem',
          fontWeight: 'bold',
          color: '#e74c3c',
          marginBottom: '1rem',
          lineHeight: '1'
        }}>
          404
        </div>

        {/* Error Message */}
        <h1 style={{
          fontSize: '2.5rem',
          color: '#2c3e50',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          User Not Found
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: '#6c757d',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          The user you're trying to access doesn't exist or is not available. 
          This could be because the user has been removed or the URL is incorrect.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/drnoagrados/"
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '1.1rem',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Go to Default User
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="btn btn-secondary"
            style={{
              padding: '12px 24px',
              fontSize: '1.1rem'
            }}
          >
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{
            color: '#495057',
            marginBottom: '1rem',
            fontSize: '1.3rem'
          }}>
            Need Help?
          </h3>
          <p style={{
            color: '#6c757d',
            marginBottom: '1rem'
          }}>
            If you believe this is an error, please contact support or try one of the available users.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/drnoagrados/contact"
              className="btn btn-outline"
              style={{
                padding: '8px 16px',
                textDecoration: 'none',
                border: '1px solid #6c757d',
                color: '#6c757d',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Available Users Info */}
        <div style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#868e96'
        }}>
          <p>Available users: user, drnoagrados</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 