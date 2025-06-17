import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { sendOTP, verifyOTP, debugTokenStatus } from '../../services/api';
import './second_third_App.css';

// Country data with flags and codes
const countries = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: 'https://flagcdn.com/w40/in.png' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: 'https://flagcdn.com/w40/il.png' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: 'https://flagcdn.com/w40/ae.png' }
];

const Login = () => {
  const { language, t } = useLanguage();
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
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      
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
    setOtpDigits(['', '', '', '', '', '']);
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
      const response = await verifyOTP(fullPhoneNumber, enteredOtp);
      
      if (response.success) {
        setNotification({
          show: true,
          message: response.message || 'Login successful!',
          type: 'success'
        });
        
        login(response.customerId, fullPhoneNumber);
        
        setTimeout(() => {
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

  return (
    <div className="login-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
        </div>
      )}

      <div className="login-card">
        <div className="login-image-container">
          <img 
            src="https://img.icons8.com/color/144/000000/doctor-male--v1.png" 
            alt="Doctor Illustration"
            className="login-image"
          />
        </div>

        <div className="login-form-container">
          <h1 className="login-title">
            Login with WhatsApp
          </h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!showOTP ? (
            <form onSubmit={handleSendOTP} style={{ width: '100%' }}>
              <div className="phone-input-container">
                <div className="phone-input-wrapper">
                  <div className="country-select">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="country-select-button"
                    >
                      <img 
                        src={selectedCountry.flag} 
                        alt={selectedCountry.code}
                        className="country-flag"
                      />
                      <span>{selectedCountry.dialCode}</span>
                      <span className="country-dropdown-arrow" />
                    </button>

                    {isDropdownOpen && (
                      <div className="country-dropdown">
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="country-option"
                          >
                            <img 
                              src={country.flag} 
                              alt={country.code}
                              className="country-flag"
                            />
                            <span>{country.name}</span>
                            <span style={{ marginLeft: 'auto', color: '#888' }}>
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
                    className="phone-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="submit-button"
              >
                {loading ? 'Sending...' : 'SEND OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={{ width: '100%' }}>
              <p className="otp-message">
                We've sent a 6-digit verification code to {selectedCountry.dialCode}{phone}
              </p>

              <div className="otp-inputs-container">
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
                    className={`otp-input ${isResending ? 'resending' : ''}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="resend-otp-button"
              >
                {loading ? 'Sending...' : 'RESEND OTP'}
              </button>

              <div className="action-buttons">
                <button
                  type="button"
                  onClick={handleBack}
                  className="back-button"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="submit-button"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </div>
            </form>
          )}

          <div className="social-login-divider">
            <span className="social-login-text">
              — or sign in with —
            </span>
            <div className="social-login-line" />
          </div>

          <div className="social-login-icons">
            <a href="#" style={{ textDecoration: 'none' }}>
              <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" className="social-icon" />
            </a>
            <a href="#" style={{ textDecoration: 'none' }}>
              <img src="https://img.icons8.com/color/48/000000/twitter--v1.png" alt="Twitter" className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;