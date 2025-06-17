import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { sendOTP, verifyOTP, debugTokenStatus } from '../../services/api';

// Country data with flags and codes
const countries = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: 'https://flagcdn.com/w40/in.png' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: 'https://flagcdn.com/w40/il.png' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: 'https://flagcdn.com/w40/ae.png' }
];

const Login = () => {
  const { language,t } = useLanguage();
  const { login } = useAuth();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  let righttttt, leftttt;
  if(language == 'en')
  {
    righttttt = 'marginRight';
    leftttt = 'marginLeft';
  }
  else
  {
    righttttt = 'marginLeft';
    leftttt = 'marginRight';
  }

  // Helper function to create user-aware links
  const createUserLink = (path = '') => {
    return `/${currentUser}${path}`;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
  };

  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    if (value && !/^\d+$/.test(value)) return; // Only allow numbers

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      
      // Focus the last input
      const lastInput = document.querySelector(`input[name=otp-5]`);
      if (lastInput) lastInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) {
        prevInput.focus();
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index - 1] = '';
        setOtpDigits(newOtpDigits);
      }
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    // Debug token status before sending OTP
    await debugTokenStatus();
    
    setLoading(true);
    setError(null);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dialCode.replace('+', '')}${phone}`;
      const response = await sendOTP(fullPhoneNumber);
      
      if (response.success) {
        setShowOTP(true);
        setError(null);
        setNotification({
          show: true,
          message: response.message,
          type: 'success'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
      } else {
        setError('Failed to send verification code');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setOtpDigits(['', '', '', '', '', '']); // Clear previous OTP
    await handleSendOTP({ preventDefault: () => {} });
    setTimeout(() => {
      setIsResending(false);
    }, 1000);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const fullPhoneNumber = `${selectedCountry.dialCode.replace('+', '')}${phone}`;
      
      // Use API verification instead of local comparison
      const response = await verifyOTP(fullPhoneNumber, enteredOtp);
      
      if (response.success) {
        setNotification({
          show: true,
          message: response.message || 'Login successful!',
          type: 'success'
        });
        
        // Use the login function from AuthContext to set all localStorage items properly
        login(response.customerId, fullPhoneNumber);
        
        // Add a small delay to show the success message
        setTimeout(() => {
          // Redirect to home page with current user
          navigate(createUserLink('/'));
        }, 1500);
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
        setNotification({
          show: true,
          message: response.message || 'Invalid OTP. Please try again.',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setNotification({
        show: true,
        message: 'Verification failed. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowOTP(false);
    setOtpDigits(['', '', '', '', '', '']);
    setError(null);
  };

  // Notification component
  const Notification = ({ message, type }) => (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      background: type === 'success' ? '#28a745' : '#ff4757',
      color: 'white',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '500',
      maxWidth: '450px',
      lineHeight: '1.4'
    }}>
      {type === 'success' ? '✅' : '⚠️'} {message}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8)), url('https://st4.depositphotos.com/3441621/28233/i/450/depositphotos_282336788-stock-photo-smiling-medical-doctor-woman-with.jpg')`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      {notification.show && (
        <Notification message={notification.message} type={notification.type} />
      )}

      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '30px'
        }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
          </svg>
          <h1 style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: '600',
            margin: 0
          }}>
            Login with WhatsApp
          </h1>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 243, 205, 0.3)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            backdropFilter: 'blur(4px)'
          }}>
            {error}
          </div>
        )}

        {!showOTP ? (
          <form onSubmit={handleSendOTP}>
            <div style={{ 
              marginBottom: '20px',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '8px'
              }}>
                <div style={{
                  position: 'relative',
                  minWidth: '100px'
                }}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      color: 'white',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <img 
                      src={selectedCountry.flag} 
                      alt={selectedCountry.code}
                      style={{
                        width: '20px',
                        height: '15px',
                        objectFit: 'cover',
                        borderRadius: '2px'
                      }}
                    />
                    <span>{selectedCountry.dialCode}</span>
                    <span style={{
                      marginLeft: 'auto',
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid white'
                    }} />
                  </button>

                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      width: '200px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '10px',
                      marginTop: '4px',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                            color: 'white',
                            ':hover': {
                              background: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <img 
                            src={country.flag} 
                            alt={country.code}
                            style={{
                              width: '20px',
                              height: '15px',
                              objectFit: 'cover',
                              borderRadius: '2px'
                            }}
                          />
                          <span>{country.name}</span>
                          <span style={{ [leftttt] : 'auto', color: 'rgba(255, 255, 255, 0.8)' }}>
                            {country.dialCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="9999999999"
                  style={{
                    flex: 1,
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                    '::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: loading || phone.length < 10 ? 0.7 : 1,
                transition: 'opacity 0.3s',
                backdropFilter: 'blur(4px)'
              }}
            >
              {loading ? 'Sending...' : 'SEND OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p style={{
              marginBottom: '20px',
              color: 'white',
              fontSize: '14px'
            }}>
              We've sent a 6-digit verification code to {selectedCountry.dialCode}{phone}
            </p>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  name={`otp-${index}`}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  style={{
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    fontSize: '18px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: isResending ? '2px solid #ff4757' : '2px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                    backgroundColor: isResending ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255, 255, 255, 0.15)'
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '20px',
                padding: '8px 16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.3s ease',
                textDecoration: 'underline'
              }}
            >
              {loading ? 'Sending...' : 'RESEND OTP'}
            </button>

            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  opacity: loading || otpDigits.join('').length !== 6 ? 0.7 : 1,
                  transition: 'opacity 0.3s',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;