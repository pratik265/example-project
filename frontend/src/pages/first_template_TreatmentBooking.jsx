import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useLanguage } from '../contexts/LanguageContext';
import { getTreatmentById, getAvailableSlots, sendOTP, verifyOTP, getBranchName, createAppointment } from '../services/api';
import { isLoggedIn, getCustomerId } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';
import { useLanguageStyles, formatDate } from '../utils/languageUtils';
import { useUser } from '../contexts/UserContext';
const countries = [
  { code: 'IL', dial_code: '+972', name: 'Israel' },
  { code: 'IN', dial_code: '+91', name: 'India' },
  { code: 'US', dial_code: '+1', name: 'United States' },
  { code: 'GB', dial_code: '+44', name: 'United Kingdom' }
];



export default function TreatmentBooking() {
  const { t, language, isRTL } = useLanguage();
  const languageStyles = useLanguageStyles();
  const { treatmentId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const createUserLink = (path) => {
    return `/${currentUser}${path}`;
  };
  
  // Check if branch parameter exists, if not redirect
  useEffect(() => {
    const branchParam = searchParams.get('branch');
    if (!branchParam) {
      // Redirect to treatments page to select a branch first
      navigate(`/treatments/${treatmentId}`);
      return;
    }
  }, [searchParams, treatmentId, navigate]);
  
  const branchId = searchParams.get('branch') || '38';
  const { login } = useAuth();
  const [treatment, setTreatment] = useState(null);
  const [branchName, setBranchName] = useState('');
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Phone, 3: OTP, 4: Payment, 5: Confirmation
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  // Step 1: Date and Time selection
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Step 2: Phone number
  const [phone, setPhone] = useState('');
  
  // Step 3: OTP
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOTP, setReceivedOTP] = useState('');
  
  // Step 4: Payment
  const [paymentDetails, setPaymentDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardPin: ''
  });
  
  // Step 5: Confirmation
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Add new state for resend animation
  const [isResending, setIsResending] = useState(false);

  // Add saved cards data
  const savedCards = [
    {
      id: 1,
      cardholderName: 'John Smith',
      cardNumber: '4242424242424242',
      expiryMonth: '01',
      expiryYear: '2025',
      cvc: '123',
      cardPin: '1234'
    }
  ];

  // Add new state for individual OTP digits
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Add new state for country selection
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryList, setShowCountryList] = useState(false);

  // Add new state for storing the generated OTP
  const [generatedOTP, setGeneratedOTP] = useState('');

  // Add loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = isLoggedIn();
      setIsUserLoggedIn(loggedIn);
    };

    checkLoginStatus();
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Load treatment data
  useEffect(() => {
    let isSubscribed = true;

    const fetchTreatment = async () => {
      try {
        const treatmentData = await getTreatmentById(treatmentId);
        if (isSubscribed) {
          setTreatment(treatmentData);
        }
      } catch (err) {
        if (isSubscribed) {
          setError('Failed to load treatment information');
        }
      }
    };

    if (treatmentId) {
      fetchTreatment();
    }

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [treatmentId]); // Only depend on treatmentId

  // Load available slots when date changes
  useEffect(() => {
    let isSubscribed = true;

    const fetchAvailableSlots = async () => {
      if (!selectedDate || !treatment) return;

      setLoadingSlots(true);
      setSelectedTime('');
      try {
        
        
        
        
        // Use the dynamic API service function instead of direct fetch
        const slotsData = await getAvailableSlots(treatmentId, selectedDate, branchId, treatmentId);
        
        if (isSubscribed) {
          if (slotsData && Array.isArray(slotsData) && slotsData.length > 0) {
            setAvailableSlots(slotsData);
            setError(null);
          } else {
            setAvailableSlots([]);
            setError('No available time slots found for this date');
          }
        }
      } catch (err) {
        
        if (isSubscribed) {
          setAvailableSlots([]);
          setError(err.message || 'Failed to load available time slots');
        }
      } finally {
        if (isSubscribed) {
          setLoadingSlots(false);
        }
      }
    };

    // Only fetch if user context is ready
    if (!userLoading && currentUser) {
      fetchAvailableSlots();
    }

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [selectedDate, treatment, branchId, treatmentId, currentUser, userLoading]); // Add user context dependencies

  // Add useEffect for fetching branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      try {
        const name = await getBranchName(branchId);
        
        // Don't convert to lowercase - keep original formatting for display
        setBranchName(name || `Branch ${branchId}`);
      } catch (error) {
        
        // Try using the hardcoded branch names mapping as fallback
        setBranchName(branchNames[branchId] || `Branch ${branchId}`);
      }
    };

    if (branchId) {
      fetchBranchName();
    }
  }, [branchId]);

  // Handle time slot selection
  const handleTimeSelection = (time) => {
    const duration = treatment.time || 5;
    const requiredSlots = Math.ceil(duration / 5);
    
    const startIndex = availableSlots.findIndex(slot => slot.time === time);
    if (startIndex === -1) return;

    // Check if we have enough consecutive slots available
    for (let i = 0; i < requiredSlots; i++) {
      const currentSlot = availableSlots[startIndex + i];
      
      // Check if slot exists and is available
      if (!currentSlot || !currentSlot.available) {
        setNotification({
          show: true,
          message: `Please select a time with ${requiredSlots} consecutive available slots`,
          type: 'warning'
        });
        return;
      }

      // For slots after the first one, verify they are consecutive (5 minutes apart)
      if (i > 0) {
        const prevTime = new Date(`2000-01-01 ${availableSlots[startIndex + i - 1].time}`);
        const currTime = new Date(`2000-01-01 ${currentSlot.time}`);
        const diffMinutes = (currTime - prevTime) / (1000 * 60);
        
        if (diffMinutes !== 5) {
          setNotification({
            show: true,
            message: `Please select a time with ${requiredSlots} consecutive available slots`,
            type: 'warning'
          });
          return;
        }
      }
    }

    // If we have enough consecutive slots, set the selected time
    setSelectedTime(time);
    setNotification({ show: false, message: '', type: '' });
  };

  // Check if a slot is within the selected time range
  const isInSelectedTimeRange = (slotTime) => {
    if (!selectedTime) return false;
    const duration = treatment.time || 5;
    const requiredSlots = Math.ceil(duration / 5);
    
    const startIndex = availableSlots.findIndex(slot => slot.time === selectedTime);
    if (startIndex === -1) return false;

    const slotIndex = availableSlots.findIndex(slot => slot.time === slotTime);
    if (slotIndex === -1) return false;

    // Check if this slot is within the required consecutive slots
    return slotIndex >= startIndex && slotIndex < startIndex + requiredSlots;
  };

  // Update the renderStepIndicators function to handle all cases
  const renderStepIndicators = () => {
    return (
      <div className="ft-step-indicators">
        <div className={`ft-step-indicator ${step >= 1 ? 'ft-step-active' : ''} ${step > 1 ? 'ft-step-completed' : ''}`}>
          <span className="ft-step-number">1</span>
          <span className="ft-step-label">{t('booking.dateTime')}</span>
        </div>
        <div className={`ft-step-indicator ${step >= 2 ? 'ft-step-active' : ''} ${step > 2 ? 'ft-step-completed' : ''}`}>
          <span className="ft-step-number">2</span>
          <span className="ft-step-label">{t('booking.phone')}</span>
        </div>
        <div className={`ft-step-indicator ${step >= 3 ? 'ft-step-active' : ''} ${step > 3 ? 'ft-step-completed' : ''}`}>
          <span className="ft-step-number">3</span>
          <span className="ft-step-label">{t('booking.otpVerification')}</span>
        </div>
        <div className={`ft-step-indicator ${step >= 4 ? 'ft-step-active' : ''} ${step > 4 ? 'ft-step-completed' : ''}`}>
          <span className="ft-step-number">4</span>
          <span className="ft-step-label">{t('booking.payment')}</span>
        </div>
        <div className={`ft-step-indicator ${step >= 5 ? 'ft-step-active' : ''}`}>
          <span className="ft-step-number">5</span>
          <span className="ft-step-label">{t('booking.confirmation')}</span>
        </div>
      </div>
    );
  };

  // Helper function to get next step based on current state
  const getNextStep = () => {
    if (isUserLoggedIn) {
      // Logged in cases
      if (treatment.force_pay === "1") {
        return 2; // Go to payment
      } else {
        return 2; // Go to confirmation
      }
    } else {
      // Not logged in cases
      return 2; // Always go to phone number first
    }
  };

  // Helper function to get confirmation step number
  const getConfirmationStepNumber = () => {
    if (isUserLoggedIn) {
      return treatment.force_pay === "1" ? 3 : 2; // Cases 3 & 4
    }
    return treatment.force_pay === "1" ? 5 : 4; // Cases 1 & 2
  };

  // Update handleDateTimeNext to use loading state
  const handleDateTimeNext = async () => {
    if (!selectedTime) {
      setNotification({
        show: true,
        message: 'Please select a time slot before proceeding',
        type: 'warning'
      });
      return;
    }

    if (treatment.time === 5 && !hasEnoughContinuousSlots(selectedTime)) {
      setError('Please select at least one time slot for this treatment');
      return;
    }

    // If user is logged in and no payment required, create appointment directly
    if (isUserLoggedIn && treatment.force_pay !== "1") {
      setIsProcessing(true);
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const startDate = new Date(`2000-01-01 ${selectedTime}`);
        const endDate = new Date(startDate.getTime() + (treatment.time * 60000));
        const endTime = endDate.toTimeString().substring(0, 5);        
        
        
        // Use the dynamic createAppointment function
        const result = await createAppointment({
          branch: branchId,
          start_time: selectedTime,
          end_time: endTime,
          date: formattedDate,
          appointments_type_id: treatmentId,
        });

        if (result.success) {
          setBookingConfirmation({
            success: true,
            appointmentId: result.data.insert_id || 'APT-' + Date.now(),
            treatment: treatment,
            date: formattedDate,
            time: selectedTime,
            // For logged-in users who skip phone verification, get phone from localStorage or default
            phone: localStorage.getItem('user_phone') || phone ? `${selectedCountry.dial_code}${phone}` : 'N/A'
          });
          setStep(getConfirmationStepNumber());
          setNotification({
            show: true,
            message: result.message || 'Appointment booked successfully!',
            type: 'success'
          });
        } else {
          setError(result.message || 'Failed to create appointment');
          setNotification({
            show: true,
            message: result.message || 'Failed to create appointment. Please try again.',
            type: 'error'
          });
        }
      } catch (err) {
        
        setError('Failed to create appointment');
        setNotification({
          show: true,
          message: 'Failed to process appointment. Please try again.',
          type: 'error'
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For all other cases, proceed to next step
      setStep(getNextStep());
    }
  };

  // Handle next step after phone verification
  const handlePhoneNext = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Combine country code with phone number
      const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;

      const data = await sendOTP(fullPhoneNumber);

      // const data = await response.json();
      
      if (data.success == true) {
        // Store both OTP and customer_id from API response
        // setReceivedOTP(data.otp.toString());
        localStorage.setItem('temp_customer_id', data.customer_id); // Store temporarily
        setOtpSent(true);
        setStep(3); // Go to OTP verification
        
        // Show success notification
        setNotification({
          show: true,
          message: 'OTP sent successfully via WhatsApp!',
          type: 'success'
        });
      } else {
        setError('Failed to send verification code');
      }
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPVerification = async () => {
    const enteredOtp = otpDigits.join('');
    if (!enteredOtp || enteredOtp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP locally by comparing with stored OTP
      const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;
      const data = await verifyOTP(fullPhoneNumber,enteredOtp);
      
      // if (enteredOtp === receivedOTP) {
      if(data.success == true){
        // Get the temporarily stored customer ID
        const customerId = localStorage.getItem('temp_customer_id');
        if (customerId) {
          // Use the login function from AuthContext
          // const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;
          login(customerId, fullPhoneNumber);
          localStorage.removeItem('temp_customer_id'); // Clean up temporary storage
        }

        // If payment is required, go to payment step
        if (treatment.force_pay === "1") {
          setStep(4);
          return;
        }

        // For non-payment cases, create appointment directly
        try {
          // Format date as YYYY-MM-DD
          const formattedDate = selectedDate.toISOString().split('T')[0];

          // Calculate end time
          const startDate = new Date(`2000-01-01 ${selectedTime}`);
          const endDate = new Date(startDate.getTime() + (treatment.time * 60000));
          const endTime = endDate.toTimeString().substring(0, 5);
          // Use the dynamic createAppointment function
          const result = await createAppointment({
            branch: branchId,
            cust_id: customerId,
            start_time: selectedTime,
            end_time: endTime,
            date: formattedDate,
            appointments_type_id: treatmentId,
          });

          if (result.success) {
            // Store booking confirmation
            setBookingConfirmation({
              success: true,
              appointmentId: result.data.insert_id || 'APT-' + Date.now(),
              treatment: treatment,
              date: formattedDate,
              time: selectedTime,
              phone: `${selectedCountry.dial_code}${phone}`
            });

            // Move to confirmation step
            setStep(getConfirmationStepNumber());

            // Show success notification
            setNotification({
              show: true,
              message: 'Appointment booked successfully!',
              type: 'success'
            });
          } else {
            setError(result.message || 'Failed to create appointment');
            setNotification({
              show: true,
              message: result.message || 'Failed to create appointment. Please try again.',
              type: 'error'
            });
          }
        } catch (err) {
          
          setError('Failed to create appointment');
          setNotification({
            show: true,
            message: 'Failed to process appointment. Please try again.',
            type: 'error'
          });
        }
      } else {
        setError('Invalid verification code');
        setNotification({
          show: true,
          message: 'Invalid verification code. Please try again.',
          type: 'error'
        });
      }
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    // Validate payment details
    if (!paymentDetails.cardholderName || !paymentDetails.cardNumber || 
        !paymentDetails.expiryMonth || !paymentDetails.expiryYear || !paymentDetails.cvc) {
      setError('Please fill in all required payment fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Calculate end time (add treatment duration to start time)
      const startDate = new Date(`2000-01-01 ${selectedTime}`);
      const endDate = new Date(startDate.getTime() + (treatment.time * 60000));
      const endTime = endDate.toTimeString().substring(0, 5);
      const customerId = localStorage.getItem('customer_id');      

      // Use the dynamic createAppointment function with payment details
      // Note: The createAppointment function may need to be extended to handle payment details
      const result = await createAppointment({
        branch: branchId,
        cust_id: customerId,
        start_time: selectedTime,
        end_time: endTime,
        date: formattedDate,
        appointments_type_id: treatmentId,
        // Payment details
        force_pay: 1,
        card_holder_name: paymentDetails.cardholderName,
        card_number: paymentDetails.cardNumber,
        expiry_month: paymentDetails.expiryMonth,
        expiry_year: paymentDetails.expiryYear,
        cvc: paymentDetails.cvc,
        card_pin: paymentDetails.cardPin || ''
      });

      if (result.success) {
        // Create booking confirmation
        setBookingConfirmation({
          success: true,
          appointmentId: result.data.insert_id || 'APT-' + Date.now(),
          treatment: treatment,
          date: formattedDate,
          time: selectedTime,
          phone: `${selectedCountry.dial_code}${phone}`
        });
        setStep(getConfirmationStepNumber());
        
        // Show success notification
        setNotification({
          show: true,
          message: result.message || 'Appointment booked successfully!',
          type: 'success'
        });
      } else {
        setError(result.message || 'Failed to create appointment');
        setNotification({
          show: true,
          message: result.message || 'Failed to create appointment. Please try again.',
          type: 'error'
        });
      }
    } catch (err) {
      
      setError('Failed to process appointment');
      setNotification({
        show: true,
        message: 'Failed to process appointment. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date(); // Today
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days from now

  // Add Notification component with auto-hide functionality
  const Notification = ({ message, type }) => {
    useEffect(() => {
      if (!message) return; // Don't set timer if no message

      const timer = setTimeout(() => {
        setNotification(prev => ({
          ...prev,
          show: false
        }));
      }, 3000);

      return () => clearTimeout(timer);
    }, [message]);

    if (!message) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        ...languageStyles.rightStyle('20px'),
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        background: type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#2ed573',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'slideInAndFade 3s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem',
        fontWeight: '500',
        maxWidth: '450px',
        lineHeight: '1.4'
      }}>
        {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅'} {message}
      </div>
    );
  };

  // Add new animation styles
  useEffect(() => {
    // Add the animation keyframes to the document if they don't exist
    if (!document.getElementById('notification-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'notification-animations';
      styleSheet.textContent = `
        @keyframes slideInAndFade {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          10% {
            transform: translateX(0);
            opacity: 1;
          }
          90% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Add new function to handle resend animation
  const handleResendCode = async () => {
    setIsResending(true);
    
    setLoading(true);
    setError(null);

    try {
      // Combine country code with phone number
      const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;
      const data = await sendOTP(fullPhoneNumber);

      // const data = await response.json();
      
      if (data.success === 1) {
        // Store both OTP and customer_id from API response
        setReceivedOTP(data.otp.toString());
        localStorage.setItem('temp_customer_id', data.customer_id); // Store temporarily
        
        // Show success notification
        setNotification({
          show: true,
          message: 'OTP sent successfully via WhatsApp!',
          type: 'success'
        });
      } else {
        setError('Failed to send verification code');
      }
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsResending(false);
      }, 1000);
    }
  };

  // Add auto-fill function
  const handleAutoFill = () => {
    setPaymentDetails({
      cardholderName: 'John Smith',
      cardNumber: '4580000000000000',
      expiryMonth: '12',
      expiryYear: '2025',
      cvc: '123',
      cardPin: '1234'
    });
  };

  // Handle saved card selection
  const handleSavedCardSelect = (card) => {
    setPaymentDetails({
      cardholderName: card.cardholderName,
      cardNumber: card.cardNumber,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvc: card.cvc,
      cardPin: card.cardPin
    });
  };

  // Add handlePaste function
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtpDigits = [...otpDigits];
      
      // Fill all inputs with pasted digits
      digits.forEach((digit, index) => {
        newOtpDigits[index] = digit;
      });
      
      setOtpDigits(newOtpDigits);
      setOtp(pastedData);
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index, value) => {
    // Only allow numbers and single digit
    if (value && !/^\d+$/.test(value)) return;
    if (value.length > 1) value = value[0];

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    
    // Update the complete OTP string
    const newOtp = newOtpDigits.join('');
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) {
        prevInput.focus();
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index - 1] = '';
        setOtpDigits(newOtpDigits);
        setOtp(newOtpDigits.join(''));
      }
    }
  };

  if (userLoading || loading) return <div className="ft-loading">{t('common.loading')}</div>;
  if (error) return <div className="ft-error">{error}</div>;

  return (
    <div className="ft-treatment-booking-page" style={languageStyles}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="ft-booking-container">
        <div className="ft-booking-header">
          <h1 className="ft-section-title">{t('booking.bookAppointment')}</h1>
          {treatment && (
            <p className="ft-booking-subtitle">
              {t('booking.for')}: <strong>{treatment.name}</strong> at <strong>{branchName}</strong>
            </p>
          )}
        </div>

        {renderStepIndicators()}

        <div className="ft-booking-card">
          {/* Step 1: Date and Time Selection */}
          {step === 1 && (
            <div className="ft-step-content ft-step-1">
              <h2 className="ft-section-title">{t('booking.selectDateTime')}</h2>
              
              <div className="ft-form-group ft-date-picker-container">
                <label className="ft-form-label">{t('booking.selectDate')}</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  className="ft-form-control ft-date-picker"
                />
              </div>

              {loadingSlots ? (
                <div className="ft-loading-slots">{t('booking.loadingSlots')}</div>
              ) : (
                <div className="ft-time-slots-grid">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelection(slot.time)}
                        disabled={!slot.available}
                        className={`ft-time-slot ${slot.available ? 'ft-time-slot-available' : ''} ${selectedTime === slot.time ? 'ft-time-slot-selected' : ''}`}
                      >
                        {slot.time}
                      </button>
                    ))
                  ) : (
                    <div className="ft-no-slots-message">{error || t('booking.noSlotsAvailable')}</div>
                  )}
                </div>
              )}
              
              {warningMessage && <p className="ft-warning-message">{warningMessage}</p>}

              <button onClick={handleDateTimeNext} disabled={!selectedTime} className="ft-btn ft-btn-primary ft-next-button">
                {t('common.next')}
              </button>
            </div>
          )}

          {/* Step 2: Phone Number Input */}
          {step === 2 && (
            <div className="ft-step-content ft-step-2">
              <h2 className="ft-section-title">{t('booking.enterPhone')}</h2>
              <p className="ft-phone-description">{t('booking.phoneDescription')}</p>
              <div className="ft-form-group ft-phone-input-group">
                <div className="ft-country-selector">
                  <button onClick={() => setShowCountryList(!showCountryList)} className="ft-country-selector-button">
                    {selectedCountry.dial_code} <span className="ft-country-flag"></span>
                  </button>
                  {showCountryList && (
                    <ul className="ft-country-list">
                      {countries.map(country => (
                        <li 
                          key={country.code} 
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryList(false);
                          }}
                          className="ft-country-item"
                        >
                          {country.name} ({country.dial_code})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('form.phonePlaceholder')}
                  className="ft-form-control ft-phone-input"
                />
              </div>
              <button onClick={handlePhoneNext} disabled={!phone} className="ft-btn ft-btn-primary ft-next-button">
                {t('common.next')}
              </button>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className="ft-step-content ft-step-3">
              <h2 className="ft-section-title">{t('booking.verifyPhone')}</h2>
              <p className="ft-otp-description">{t('booking.otpSentTo')} <strong>{selectedCountry.dial_code}{phone}</strong>. {t('booking.enterOtp')}</p>
              <div className="ft-form-group ft-otp-input-group">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="ft-form-control ft-otp-input"
                    ref={el => (this[`otpInput${index}`] = el)}
                  />
                ))}
              </div>
              {generatedOTP && (
                <p className="ft-generated-otp">
                  {t('booking.forTesting')} <strong>{generatedOTP}</strong>
                </p>
              )}
              <button onClick={handleOTPVerification} disabled={otpDigits.some(d => d === '')} className="ft-btn ft-btn-primary ft-next-button">
                {t('common.verify')}
              </button>
              <button 
                onClick={handleResendCode} 
                disabled={isResending} 
                className={`ft-btn ft-btn-secondary ft-resend-otp-btn ${isResending ? 'ft-resending' : ''}`}
              >
                {isResending ? t('booking.resending') : t('booking.resendCode')}
              </button>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="ft-step-content ft-step-4">
              <h2 className="ft-section-title">{t('booking.paymentDetails')}</h2>

              {treatment.force_pay === "1" && treatment.minForcePaymentPrice && (
                <p className="ft-payment-info ft-payment-required">
                  {t('booking.paymentRequiredInfo')}: <strong>{treatment.minForcePaymentPrice} {treatment.currency}</strong>
                </p>
              )}
              <p className="ft-payment-info ft-cancellation-fee">
                {t('booking.cancellationFeeInfo')}: <strong>{treatment.cancellationPrice || '0'} {treatment.currency}</strong>
              </p>

              <div className="ft-payment-section">
                {isUserLoggedIn && savedCards.length > 0 && (
                  <div className="ft-saved-cards-section">
                    <h3 className="ft-saved-cards-title">{t('booking.useSavedCard')}</h3>
                    <div className="ft-saved-cards-list">
                      {savedCards.map(card => (
                        <div key={card.id} className="ft-saved-card-item" onClick={() => handleSavedCardSelect(card)}>
                          **** **** **** {card.cardNumber.slice(-4)}
                        </div>
                      ))}
                    </div>
                    <div className="ft-divider-or">OR</div>
                  </div>
                )}
                
                <h3 className="ft-new-card-title">{t('booking.enterNewCard')}</h3>
                
                <div className="ft-form-group">
                  <label htmlFor="cardholderName" className="ft-form-label">{t('form.cardholderName')}</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={paymentDetails.cardholderName}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardholderName: e.target.value })}
                    className="ft-form-control"
                    placeholder={t('form.cardholderNamePlaceholder')}
                  />
                </div>
                
                <div className="ft-form-group">
                  <label htmlFor="cardNumber" className="ft-form-label">{t('form.cardNumber')}</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                    className="ft-form-control"
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength="16"
                  />
                </div>
                
                <div className="ft-expiry-cvc-group">
                  <div className="ft-form-group ft-expiry-month">
                    <label htmlFor="expiryMonth" className="ft-form-label">{t('form.expiryMonth')}</label>
                    <input
                      type="text"
                      id="expiryMonth"
                      name="expiryMonth"
                      value={paymentDetails.expiryMonth}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryMonth: e.target.value })}
                      className="ft-form-control"
                      placeholder="MM"
                      maxLength="2"
                    />
                  </div>
                  <div className="ft-form-group ft-expiry-year">
                    <label htmlFor="expiryYear" className="ft-form-label">{t('form.expiryYear')}</label>
                    <input
                      type="text"
                      id="expiryYear"
                      name="expiryYear"
                      value={paymentDetails.expiryYear}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryYear: e.target.value })}
                      className="ft-form-control"
                      placeholder="YYYY"
                      maxLength="4"
                    />
                  </div>
                  <div className="ft-form-group ft-cvc">
                    <label htmlFor="cvc" className="ft-form-label">{t('form.cvc')}</label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      value={paymentDetails.cvc}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cvc: e.target.value })}
                      className="ft-form-control"
                      placeholder="CVC"
                      maxLength="3"
                    />
                  </div>
                </div>
                
                <div className="ft-form-group ft-card-pin-group">
                  <label htmlFor="cardPin" className="ft-form-label">{t('form.cardPin')}</label>
                  <input
                    type="password"
                    id="cardPin"
                    name="cardPin"
                    value={paymentDetails.cardPin}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardPin: e.target.value })}
                    className="ft-form-control"
                    placeholder="****"
                    maxLength="4"
                  />
                </div>
              </div>
              
              <button 
                onClick={handlePaymentSubmit} 
                disabled={isProcessing} 
                className="ft-btn ft-btn-primary ft-submit-button"
              >
                {isProcessing ? t('common.processing') : t('booking.confirmBooking')}
              </button>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && bookingConfirmation && (
            <div className="ft-step-content ft-step-5">
              <h2 className="ft-section-title ft-confirmation-title">{t('booking.bookingConfirmed')} 🎉</h2>
              <p className="ft-confirmation-message">{t('booking.confirmationText')}</p>
              
              <div className="ft-confirmation-details">
                <div className="ft-confirmed-item">
                  <strong>{t('common.treatment')}:</strong> <span>{bookingConfirmation.treatmentName}</span>
                </div>
                <div className="ft-confirmed-item">
                  <strong>{t('common.date')}:</strong> <span>{formatDate(new Date(bookingConfirmation.date))}</span>
                </div>
                <div className="ft-confirmed-item">
                  <strong>{t('common.time')}:</strong> <span>{bookingConfirmation.time}</span>
                </div>
                <div className="ft-confirmed-item">
                  <strong>{t('common.branch')}:</strong> <span>{bookingConfirmation.branchName}</span>
                </div>
                <div className="ft-confirmed-item">
                  <strong>{t('common.phone')}:</strong> <span>{bookingConfirmation.phone}</span>
                </div>
                {bookingConfirmation.price && (
                  <div className="ft-confirmed-item">
                    <strong>{t('common.price')}:</strong> <span>{bookingConfirmation.price} {bookingConfirmation.currency}</span>
                  </div>
                )}
              </div>
              
              <Link to={createUserLink('/my-appointments')} className="ft-btn ft-btn-primary ft-view-appointments-button">
                {t('booking.viewAppointments')}
              </Link>
              <button onClick={() => navigate(createUserLink('/'))} className="ft-btn ft-btn-secondary ft-back-home-button">
                {t('common.backToHome')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 