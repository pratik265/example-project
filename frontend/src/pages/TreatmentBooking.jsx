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
    let steps = [];

    // Step 1: Date & Time (always first for all cases)
    steps.push({ num: 1, label: t('booking.stepLabels.dateTime'), icon: '📅' });

    if (!isUserLoggedIn) {
      // Case 1 & 2: Not logged in - add phone and verification steps
      steps.push(
        { num: 2, label: t('booking.stepLabels.phoneNumber'), icon: '📱' },
        { num: 3, label: t('booking.stepLabels.verification'), icon: '🔒' }
      );
      
      // Case 1: Not logged in + Payment required
      if (treatment.force_pay === "1") {
        steps.push({ num: 4, label: t('booking.stepLabels.payment'), icon: '💳' });
      }
    } else {
      // Case 3: Logged in + Payment required
      if (treatment.force_pay === "1") {
        steps.push({ num: 2, label: t('booking.stepLabels.payment'), icon: '💳' });
      }
    }

    // Add Confirmation as last step for all cases
    steps.push({ 
      num: steps.length + 1,
      label: t('booking.stepLabels.confirmation'), 
      icon: '✅' 
    });

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        paddingBottom: '1rem'
      }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '1.5rem',
          ...languageStyles.leftStyle('3rem'),
          ...languageStyles.rightStyle('3rem'),
          height: '2px',
          background: '#e2e8f0',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          top: '1.5rem',
          ...languageStyles.leftStyle('3rem'),
          height: '2px',
          background: '#667eea',
          zIndex: 1,
          width: `${((step - 1) / (steps.length - 1)) * (100 - (6 * 16))}%`,
          transition: 'width 0.3s ease'
        }}></div>

        {steps.map((stepItem) => (
          <div 
            key={stepItem.num}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: '1'
            }}
          >
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: step >= stepItem.num ? '#667eea' : 'white',
              border: `2px solid ${step >= stepItem.num ? '#667eea' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              transition: 'all 0.3s ease',
              fontSize: '1.25rem'
            }}>
              {step > stepItem.num ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              ) : (
                <span style={{
                  color: step >= stepItem.num ? 'white' : '#718096',
                }}>
                  {stepItem.icon}
                </span>
              )}
            </div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: step === stepItem.num ? '600' : '500',
              color: step >= stepItem.num ? '#2d3748' : '#718096',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              {stepItem.label}
            </div>
          </div>
        ))}
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

  if (!treatment) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="treatment-booking">
      {/* Add notification */}
      {notification.show && notification.message && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
        />
      )}

      <div className="container" style={{
        paddingTop: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '2rem 1rem'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white',
              fontWeight: '600'
            }}>
              {treatment.images && treatment.images.length > 0 && (
                <img
                  src={`${treatment.images[0]}`}
                  alt={treatment.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`;
                    e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: bold;">${treatment.name.charAt(0).toUpperCase()}</div>`;
                  }}
                />
              )}
              {/* {treatment.name ? treatment.name[0].toUpperCase() : 'R'} */}
            </div>
            <div style={{flex: 1}}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '0.25rem'
              }}>
                {treatment.name}
              </h2>
              
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                {branchName && (
                  <span style={{
                    fontSize: '1rem',
                    color: '#667eea',
                    // marginBottom: '0.75rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {branchName}
                  </span>
                )}
                <span style={{
                  background: '#ebf4ff',
                  color: '#4299e1',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  {treatment.time} {t('booking.minutes')}
                </span>
                <span style={{
                  background: '#fff5f5',
                  color: '#f56565',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  {treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                    Number(treatment.minForcePaymentPrice) : 
                    Number(treatment.price)
                  }
                </span>
                <span style={{
                  background: treatment.force_pay === "1" ? '#fed7d7' : '#c6f6d5',
                  color: treatment.force_pay === "1" ? '#e53e3e' : '#38a169',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem'
                }}>
                  {treatment.force_pay === "1" ? t('booking.paymentRequired') : t('booking.paymentNotRequired')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem',
          width: '100%'
        }}>
          {renderStepIndicators()}
        </div>

        {/* Step Content */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Step 1: Date and Time Selection */}
          {step === 1 && (
            <div className="booking-layout" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.5fr)',
              gap: '2rem',
              width: '100%'
            }}>
              <div className="calendar-section">
                <h3 style={{color: '#2c3e50', marginBottom: '1.5rem'}}>{t('booking.chooseDate')}</h3>
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  inline
                  calendarClassName="custom-calendar"
                />
              </div>

              <div className="time-slots-section">
                <h3 style={{color: '#2c3e50', marginBottom: '1.5rem'}}>{t('booking.selectTime')}</h3>
                <p style={{color: '#6c757d', marginBottom: '1rem'}}>
                  {t('booking.treatmentDuration')}: {treatment.time || 5} {t('booking.minutes')} ({Math.ceil((treatment.time || 5) / 5)} {t('booking.slotsNeeded')})
                </p>
                
                {!selectedDate && (
                  <div style={{
                    padding: '2rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    <p style={{fontSize: '1.1rem'}}>{t('booking.selectDateFirst')}</p>
                  </div>
                )}
                
                {selectedDate && loadingSlots && (
                  <div style={{
                    padding: '2rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#667eea'
                  }}>
                    <p style={{fontSize: '1.1rem'}}>{t('booking.loadingTimeSlots')}</p>
                  </div>
                )}
                
                {selectedDate && !loadingSlots && availableSlots.length === 0 && (
                  <div style={{
                    padding: '2rem',
                    background: '#fff3cd',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#856404'
                  }}>
                    <p style={{fontSize: '1.1rem'}}>{t('booking.chooseAnotherDate')}</p>
                  </div>
                )}
                
                {selectedDate && !loadingSlots && availableSlots.length > 0 && (
                  <div className="time-slots-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    marginTop: '1rem'
                  }}>
                    {availableSlots.map((slot) => {
                      const isInRange = isInSelectedTimeRange(slot.time);
                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSelection(slot.time)}
                          style={{
                            padding: '12px 16px',
                            background: isInRange ? '#667eea' : '#ffffff',
                            color: isInRange ? '#ffffff' : '#495057',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (!isInRange) {
                              e.target.style.borderColor = '#667eea';
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 10px rgba(102, 126, 234, 0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isInRange) {
                              e.target.style.borderColor = '#e9ecef';
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
                  <Link 
                    // to="/treatments" 
                    to={createUserLink(`/treatments/`)} 
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#667eea',
                      border: '1px solid #667eea',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {t('booking.backToTreatments')}
                  </Link>
                  <button 
                    onClick={handleDateTimeNext}
                    disabled={!selectedTime || isProcessing}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      background: selectedTime && !isProcessing ? '#667eea' : '#e2e8f0',
                      color: selectedTime && !isProcessing ? 'white' : '#a0aec0',
                      border: 'none',
                      cursor: selectedTime && !isProcessing ? 'pointer' : 'not-allowed',
                      opacity: selectedTime && !isProcessing ? 1 : 0.7,
                      transition: 'all 0.3s ease',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {isProcessing ? t('booking.processing') : (isUserLoggedIn && treatment.force_pay !== "1" ? t('booking.confirmBookingBtn') : isUserLoggedIn ? t('booking.proceedToPayment') : t('booking.next'))}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Phone Number Input */}
          {!isUserLoggedIn && step === 2 && (
            <div className="booking-layout" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <h3 style={{
                  color: '#2d3748',
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {t('booking.phoneStep.enterPhoneNumber')}
                </h3>
                
                <p style={{
                  color: '#718096',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  {t('booking.phoneStep.whatsappMessage')}
                </p>

                <div style={{marginBottom: '1.5rem'}}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '1rem'
                  }}>
                    {/* Country Code Selector */}
                    <select
                      value={selectedCountry.dial_code}
                      onChange={(e) => {
                        const country = countries.find(c => c.dial_code === e.target.value);
                        setSelectedCountry(country);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        minWidth: '100px'
                      }}
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.dial_code}>
                          {country.dial_code} {country.code}
                        </option>
                      ))}
                    </select>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPhone(value);
                      }}
                      placeholder={t('booking.phoneStep.enterYourPhoneNumber')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                  justifyContent: 'space-between'
                }}>
                  <button 
                    onClick={() => setStep(1)}
                    style={{
                      padding: '10px 24px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#333',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {t('booking.back')}
                  </button>
                  <button 
                    onClick={handlePhoneNext}
                    disabled={!phone || phone.length < 9 || loading}
                    style={{
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      background: phone && phone.length >= 9 ? '#667eea' : '#e2e8f0',
                      color: phone && phone.length >= 9 ? 'white' : '#a0aec0',
                      fontSize: '14px',
                      cursor: phone && phone.length >= 9 && !loading ? 'pointer' : 'not-allowed',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? t('booking.phoneStep.sendingCode') : t('booking.phoneStep.sendVerificationCode')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {!isUserLoggedIn && step === 3 && (
            <div className="booking-layout" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <h3 style={{
                  color: '#2d3748',
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {t('booking.otpStep.enterVerificationCode')}
                </h3>
                
                <p style={{
                  color: '#718096',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  {t('booking.otpStep.sentCodeTo')} {selectedCountry.dial_code} {phone}
                </p>
                
                <div style={{marginBottom: '1.5rem'}}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginBottom: '1rem'
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
                        onPaste={index === 0 ? handlePaste : undefined}
                        style={{
                          width: '40px',
                          height: '40px',
                          textAlign: 'center',
                          fontSize: '1.2rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{
                    textAlign: 'center',
                    marginTop: '1rem'
                  }}>
                    <button
                      onClick={handleResendCode}
                      disabled={loading || isResending}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        padding: '8px 16px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: loading || isResending ? 0.5 : 1,
                        transition: 'opacity 0.3s ease',
                        color: '#667eea'
                      }}
                    >
                      {isResending ? t('booking.otpStep.sending') : t('booking.otpStep.resendCode')}
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                  justifyContent: 'space-between'
                }}>
                  <button 
                    onClick={() => setStep(2)}
                    style={{
                      padding: '10px 24px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#333',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {t('booking.back')}
                  </button>
                  <button 
                    onClick={handleOTPVerification}
                    disabled={loading || otp.length !== 6}
                    style={{
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      background: otp.length === 6 ? '#667eea' : '#e2e8f0',
                      color: otp.length === 6 ? 'white' : '#a0aec0',
                      fontSize: '14px',
                      cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? t('booking.verifying') : t('booking.otpStep.verifyAndContinue')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment Details */}
          {((isUserLoggedIn && step === 2 && treatment.force_pay === "1") || 
            (!isUserLoggedIn && step === 4 && treatment.force_pay === "1")) && (
            <div style={{width: '100%'}}>
              <h3 style={{color: '#2c3e50', marginBottom: '1.5rem'}}>Payment</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)',
                gap: '2rem',
                width: '100%'
              }}>
                {/* Left side - Appointment Summary */}
                <div>
                  <h4 style={{color: '#2c3e50', marginBottom: '1rem'}}>Appointment Summary</h4>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{display: 'grid', gap: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef', paddingBottom: '0.5rem'}}>
                        <span style={{color: '#6c757d'}}>Branch:</span>
                        <span style={{fontWeight: '500'}}>{branchName || `Branch ${branchId}`}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef', paddingBottom: '0.5rem'}}>
                        <span style={{color: '#6c757d'}}>Appointment Type:</span>
                        <span style={{fontWeight: '500'}}>{treatment.name}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef', paddingBottom: '0.5rem'}}>
                        <span style={{color: '#6c757d'}}>Date & Time:</span>
                        <span style={{fontWeight: '500'}}>
                          {formatDate(selectedDate, language)} | {selectedTime} - {(() => {
                            const startDate = new Date(`2000-01-01 ${selectedTime}`);
                            const endDate = new Date(startDate.getTime() + (treatment.time * 60000));
                            return endDate.toTimeString().substring(0, 5);
                          })()}
                        </span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef', paddingBottom: '0.5rem'}}>
                        <span style={{color: '#6c757d'}}>Duration:</span>
                        <span style={{fontWeight: '500'}}>{treatment.time} Mins</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem'}}>
                        <span style={{color: '#6c757d'}}>Total Amount:</span>
                        <span style={{
                          fontWeight: '600', 
                          color: '#2c3e50', 
                          fontSize: '1.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          {treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                            Number(treatment.minForcePaymentPrice) : 
                            Number(treatment.price)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Payment Form */}
                <div>
                  <h4 style={{color: '#2c3e50', marginBottom: '1rem'}}>Payment Detail</h4>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{display: 'grid', gap: '1.5rem'}}>
                      {/* Saved Cards Selector */}
                      <div style={{
                        background: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => handleSavedCardSelect(savedCards[0])}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#edf2ff'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            background: '#667eea',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '25px'
                          }}>
                            <span style={{color: 'white', fontSize: '0.8rem', fontWeight: '600'}}>VISA</span>
                          </div>
                          <div>
                            <div style={{fontSize: '0.9rem', fontWeight: '500', color: '#2c3e50'}}>
                              {savedCards[0].cardholderName}
                            </div>
                            <div style={{fontSize: '0.8rem', color: '#6c757d'}}>
                              Visa •••• {savedCards[0].cardNumber.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #e9ecef',
                          fontSize: '0.8rem'
                        }}>
                          <a 
                            href="#"
                            style={{
                              color: '#667eea',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              // Add manage payment methods functionality here
                            }}
                          >
                            ⚙️ Manage payment methods
                          </a>
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#495057'}}>
                          Cardholder's Name <span style={{color: '#dc3545'}}>*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardholderName}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                          placeholder="Enter Cardholder's Name"
                          autoComplete="off"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '8px',
                            fontSize: '1rem'
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#495057'}}>
                          Card Number <span style={{color: '#dc3545'}}>*</span>
                        </label>
                        <div style={{position: 'relative'}}>
                          <input
                            type="text"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 16) {
                                setPaymentDetails({...paymentDetails, cardNumber: value});
                              }
                            }}
                            placeholder="4580 0000 0000 0000"
                            autoComplete="off"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '8px',
                              fontSize: '1rem'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            ...languageStyles.rightStyle('10px'),
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6c757d'
                          }}>
                            💳
                          </span>
                        </div>
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="form-group">
                          <label style={{display: 'block', marginBottom: '0.5rem', color: '#495057'}}>
                            Expiry Month <span style={{color: '#dc3545'}}>*</span>
                          </label>
                          <select
                            value={paymentDetails.expiryMonth}
                            onChange={(e) => setPaymentDetails({...paymentDetails, expiryMonth: e.target.value})}
                            autoComplete="off"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="">Select Month</option>
                            {Array.from({length: 12}, (_, i) => {
                              const month = (i + 1).toString().padStart(2, '0');
                              return <option key={month} value={month}>{month}</option>;
                            })}
                          </select>
                        </div>

                        <div className="form-group">
                          <label style={{display: 'block', marginBottom: '0.5rem', color: '#495057'}}>
                            Expiry Year <span style={{color: '#dc3545'}}>*</span>
                          </label>
                          <select
                            value={paymentDetails.expiryYear}
                            onChange={(e) => setPaymentDetails({...paymentDetails, expiryYear: e.target.value})}
                            autoComplete="off"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="">Select Year</option>
                            {Array.from({length: 10}, (_, i) => {
                              const year = (new Date().getFullYear() + i).toString();
                              return <option key={year} value={year}>{year}</option>;
                            })}
                          </select>
                        </div>
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="form-group">
                          <label style={{display: 'block', marginBottom: '0.5rem', color: '#495057'}}>
                            CVC <span style={{color: '#dc3545'}}>*</span>
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cvc}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) {
                                setPaymentDetails({...paymentDetails, cvc: value});
                              }
                            }}
                            placeholder="123"
                            maxLength="3"
                            autoComplete="off"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '8px',
                              fontSize: '1rem'
                            }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{display: 'block', marginBottom: '0.5rem', color: '#495057'}}>
                            Card PIN
                          </label>
                          <input
                            type="password"
                            value={paymentDetails.cardPin}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                setPaymentDetails({...paymentDetails, cardPin: value});
                              }
                            }}
                            placeholder="Optional"
                            maxLength="4"
                            autoComplete="off"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '8px',
                              fontSize: '1rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                    <button 
                      onClick={() => setStep(isUserLoggedIn ? 1 : 3)}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #6c757d',
                        background: 'white',
                        color: '#6c757d'
                      }}
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePaymentSubmit}
                      disabled={loading || !paymentDetails.cardholderName || !paymentDetails.cardNumber || 
                                !paymentDetails.expiryMonth || !paymentDetails.expiryYear || !paymentDetails.cvc}
                      style={{
                        padding: '10px 32px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#ff4757',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === getConfirmationStepNumber() && (
            <div style={{
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✅</div>
              <h3 style={{color: '#28a745', marginBottom: '1rem', fontSize: '1.5rem'}}>{t('booking.appointmentConfirmed')}</h3>
              
              <div style={{
                background: '#f8f9fa',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{color: '#2d3748', marginBottom: '1.5rem', fontSize: '1.25rem'}}>{t('booking.appointmentDetails')}</h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  textAlign: languageStyles.textAlign
                }}>
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('booking.bookingReference')}:
                    </strong>
                    <span style={{
                      fontFamily: 'monospace',
                      background: '#edf2ff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      color: '#4c51bf',
                      fontSize: '1.1rem'
                    }}>
                      {bookingConfirmation ? bookingConfirmation.appointmentId : 'APT-' + Date.now()}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('booking.treatment')}:
                    </strong>
                    <span style={{fontSize: '1.1rem', color: '#2d3748'}}>
                      {treatment.name}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('booking.branch')}:
                    </strong>
                    <span style={{
                      fontSize: '1.1rem', 
                      color: '#2d3748',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {branchName || `Branch ${branchId}`}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('booking.selectDate')}:
                    </strong>
                    <span style={{fontSize: '1.1rem', color: '#2d3748'}}>
                      {formatDate(selectedDate, language)}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('booking.selectTime')}:
                    </strong>
                    <span style={{fontSize: '1.1rem', color: '#2d3748'}}>
                      {selectedTime} - {(() => {
                        const startDate = new Date(`2000-01-01 ${selectedTime}`);
                        const endDate = new Date(startDate.getTime() + (treatment.time * 60000));
                        return endDate.toTimeString().substring(0, 5);
                      })()}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('common.duration')}:
                    </strong>
                    <span style={{fontSize: '1.1rem', color: '#2d3748'}}>
                      {treatment.time} {t('common.minutes')}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                      {t('common.price')}:
                    </strong>
                    <span style={{
                      fontSize: '1.1rem', 
                      color: '#2d3748',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      {treatment.force_pay === "1" && treatment.minForcePaymentPrice ? 
                        Number(treatment.minForcePaymentPrice) : 
                        Number(treatment.price)
                      }
                    </span>
                  </div>

                  {!isUserLoggedIn && (
                    <div className="detail-item">
                      <strong style={{color: '#4a5568', display: 'block', marginBottom: '0.5rem'}}>
                        Phone Number:
                      </strong>
                      <span style={{fontSize: '1.1rem', color: '#2d3748'}}>
                        {selectedCountry.dial_code} {phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{marginBottom: '2rem'}}>
                <div style={{
                  background: '#fff3cd',
                  color: '#856404',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <strong>{t('booking.arriveEarly')}</strong>
                </div>
                <p style={{color: '#6c757d', fontSize: '0.95rem'}}>
                  {t('booking.saveAppointmentId')}
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link 
                  // to="/"
                  to={createUserLink('/')} 
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t('booking.backToHome')}
                </Link>
                <Link
                  to={createUserLink('/treatments')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t('booking.bookAnotherTreatment')}
                </Link>
                <button 
                  onClick={() => window.print()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#4a5568',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9L6 2L18 2L18 9"></path>
                    <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18"></path>
                    <path d="M18 14H6V22H18V14Z"></path>
                  </svg>
                  {t('booking.printConfirmation')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx="">{`
        .treatment-booking {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .booking-layout {
          height: 100%;
        }

        @media (max-width: 768px) {
          .booking-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
} 