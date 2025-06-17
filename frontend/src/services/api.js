import axios from 'axios';

// API Base URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Token Management - Will be set by UserContext
let currentUserContext = null;

// Cache for context waiting to avoid multiple simultaneous waits
let contextWaitPromise = null;

// Function to set user context (called by UserContext)
export const setUserContext = (userContext) => {
  currentUserContext = userContext;
  // Clear any pending context wait when context is set
  contextWaitPromise = null;
};

// Function to get current user token from context
export const getCurrentUserToken = async (shouldWait = true) => {
  // If we should wait and don't have context, wait for it
  if (shouldWait && (!currentUserContext || !currentUserContext.getCurrentUserToken)) {
    await waitForUserContext();
  }
  
  if (currentUserContext && currentUserContext.getCurrentUserToken) {
    const token = currentUserContext.getCurrentUserToken();
    if (token && typeof token === 'string' && token.length > 0) {
      return token;
    }
    // If getCurrentUserToken returns null (invalid user), return null
    if (token === null) {
      return null;
    }
  }
};

// Function to ensure we have a valid token (always waits for context)
const ensureToken = async () => {
  const token = await getCurrentUserToken(true); // Always wait for context
  
  // If token is null, it means invalid user - throw error instead of fallback
  if (token === null) {
    throw new Error('Invalid user - no token available');
  }
  
  return token;
};

// Debug function to check current token status
export const debugTokenStatus = async () => {
  if (currentUserContext?.getCurrentUserToken) {
  }
};

// Helper function to wait for user context to be ready - OPTIMIZED
const waitForUserContext = (maxWaitTime = 2000) => {
  // If we already have a context, return immediately
  if (currentUserContext && currentUserContext.currentUser && currentUserContext.getCurrentUserToken) {
    const token = currentUserContext.getCurrentUserToken();
    if (token && typeof token === 'string' && token.length > 0) {
      return Promise.resolve(true);
    }
  }
  
  // If there's already a pending wait, return the same promise
  if (contextWaitPromise) {
    return contextWaitPromise;
  }
  
  // Create new wait promise
  contextWaitPromise = new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = maxWaitTime / 50; // Check every 50ms instead of 100ms for faster response
    
    const checkContext = () => {
      if (currentUserContext && currentUserContext.currentUser && currentUserContext.getCurrentUserToken) {
        const token = currentUserContext.getCurrentUserToken();
        if (token && typeof token === 'string' && token.length > 0) {
          contextWaitPromise = null; // Clear the promise
          resolve(true);
          return;
        }
      }
      
      if (attempts >= maxAttempts) {
        contextWaitPromise = null; // Clear the promise
        resolve(false);
      } else {
        attempts++;
        setTimeout(checkContext, 50);
      }
    };
    
    checkContext();
  });
  
  return contextWaitPromise;
};

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get user template language - NOW USING BACKEND PROXY
export const getUserTemplateLanguage = async () => {
  try {
    // Updated to match backend endpoint change
    const response = await api.get('/api/get_template', {
      // params: {
      //   template_id: 1
      // }
    });

    if (response.data.success === 1 && response.data.user_template && response.data.user_template.lang) {
      return response.data.user_template.lang;
    } else {
      throw new Error('Language not found in user template');
    }
  } catch (error) {
    throw error;
  }
};

// Treatments API
export const getTreatments = async (signal, branchId = null) => {
  try {
    // Reduced delay for better performance
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const response = await api.get('/api/treatments', { signal });
    let treatments = response.data;

    // Filter by branch if branchId is provided
    if (branchId) {
      treatments = treatments.filter(treatment => {
        try {
          // Parse the branch string to get array of branch IDs
          const branchIds = JSON.parse(treatment.branch || '[]');
          // Check if the branchId exists in the array
          return branchIds.includes(branchId);
        } catch (err) {
          return false;
        }
      });
    }

    return treatments;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    if (!error.response || error.response.status === 0) {
      // Network error or server not ready, throw specific error
      throw new Error('Server not ready');
    }
    throw error;
  }
};

// Doctors API
export const getDoctors = async (signal) => {
  try {
    // Reduced delay for better performance
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const response = await api.get('/api/doctors', { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    if (!error.response || error.response.status === 0) {
      // Network error or server not ready, throw specific error
      throw new Error('Server not ready');
    }
    throw error;
  }
};

export const getDoctorById = async (id) => {
  try {
    const response = await api.get(`/api/doctors/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clinics API
export const getClinics = async () => {
  try {
    const response = await api.get('/api/clinics');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClinicById = async (id) => {
  try {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTreatmentById = async (id) => {
  try {
    const response = await api.get(`/api/treatments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const getTreatmentsBySpecialty = async (specialty) => {
//   try {
//     const response = await api.get(`/treatments/specialty/${specialty}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Contact API
// export const submitContactForm = async (formData) => {
//   try {
//     const response = await api.post('/api/contact', formData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Appointments API
// export const bookAppointment = async (appointmentData) => {
//   try {
//     const response = await api.post('/api/appointments', appointmentData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Get available slots - NOW USING BACKEND PROXY
export const getAvailableSlots = async (treatmentId, date, branchId, appointmentType) => {
  try {
    // Format date to YYYY-MM-DD if it's a Date object
    let formattedDate = date;
    if (date instanceof Date) {
      formattedDate = date.toISOString().split('T')[0];
    }

    const response = await api.get('/api/bull36/get_available_time', {
      params: {
        data_time: '5',
        template_id: 1,
        branch: branchId,
        appointment_type: appointmentType || treatmentId,
        date: formattedDate
      }
    });

    if (response.data.success === 1 && response.data.time_slots) {
      return response.data.time_slots.map(time => ({
        time: time,
        available: true
      }));
    }

    return [];
  } catch (error) {
    return [];
  }
};

// Send OTP - NOW USING BACKEND PROXY
export const sendOTP = async (phone) => {
  try {
    const response = await api.post('/api/bull36/send_otp', {
      phone: phone
    });

    if (response.data.success === 1) {
      // Store customer ID if provided for later use
      if (response.data.customer_id) {
        localStorage.setItem('customer_id', response.data.customer_id);
      }
      
      return {
        success: true,
        message: response.data.message || 'OTP sent successfully to your WhatsApp',
        customer_id: response.data.customer_id || null
      };
    } else {
      throw new Error(response.data.message || 'Failed to send OTP');
    }
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to send OTP');
    }
    throw error;
  }
};

// Verify OTP - NOW USING BACKEND PROXY
export const verifyOTP = async (phone, otp) => {
  try {
    const response = await api.post('/api/bull36/verify_otp', {
      phone: phone,
      otp: otp
    });

    if (response.data.success === 1) {
      // Store customer ID for appointment booking
      if (response.data.cust_id) {
        localStorage.setItem('customer_id', response.data.cust_id);
      }
      
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully',
        customerId: response.data.cust_id,
        customerData: response.data.customer_data,
        // Return a verification token for frontend use
        verificationToken: `verified_${Date.now()}_${response.data.cust_id}`
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Invalid OTP. Please try again.'
      };
    }
  } catch (error) {
    if (error.response && error.response.data) {
      return {
        success: false,
        message: error.response.data.message || 'Invalid OTP. Please try again.'
      };
    }
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};

// Book treatment - NOW USING BACKEND PROXY
// export const bookTreatment = async (bookingData) => {
//   try {
//     const response = await api.post('/api/bull36/create_appointment', bookingData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Get template data (banner, about us, contact)
// export const getTemplateData = async () => {
//   try {
//     const response = await api.get('/api/template');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Get clinic info from user_template
// export const getClinicInfo = async () => {
//   try {
//     const response = await api.get('/api/clinic-info');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Cache keys for localStorage
const INITIAL_DATA_CACHE_KEY = 'medicare_initial_data';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

// Get initial data (template, user info, doctors) - NOW USING BACKEND PROXY
export const getInitialData = async (signal) => {
  try {
    // Check if we have valid cached data FIRST before waiting for context
    const cachedData = localStorage.getItem(INITIAL_DATA_CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;
      
      if (!isExpired) {
        return data;
      }
    }
  

    // Updated to match backend endpoint change
    const response = await api.get('/api/get_template', {
        // params: {
        //   template_id: 1
        // },
      signal
    });

    if (response.data.success === 1) {
      const { template_data, user_template, doctor } = response.data;
      
      const formattedData = {
        template: {
          banner: {
            images: JSON.parse(template_data.banner_images || '[]'),
            headings: JSON.parse(template_data.banner_main_heading || '[]'),
            descriptions: JSON.parse(template_data.banner_discription || '[]')
          },
          aboutUs: {
            heading: template_data.aboutus_main_heading,
            description: template_data.aboutus_discription,
            image: template_data.aboutus_image
          },
          contact: {
            phone: template_data.contactus_phone,
            email: template_data.contactus_email,
            address: template_data.contactus_address
          }
        },
        clinic: {
          name: user_template.name,
          email: user_template.email,
          phone: user_template.phone,
          address: user_template.address
        },
        userTemplate: {
          userId: user_template.user_id,
          ownerId: user_template.owner_id,
          doctorTemplateId: user_template.doctor_template_id,
          name: user_template.name,
          email: user_template.email,
          phone: user_template.phone,
          address: user_template.address,
          profileImage: user_template.profile_image ? `${user_template.profile_image}` : null,
          language: user_template.lang
        },
        doctors: doctor ? doctor.map(doc => ({
          id: doc.team_member_id || doc.id,
          name: doc.doctor_name || doc.display_name || `Doctor ${doc.team_member_id}`,
          image: doc.image ? `${doc.image}` : null,
          description: doc.discription || '',
          workingDays: doc.branch_working_day ? JSON.parse(doc.branch_working_day) : [],
          color: doc.color || '#000000',
          status: doc.status,
          displayName: doc.display_name,
          teamMemberId: doc.team_member_id,
          branchWorkingDay: doc.branch_working_day ? JSON.parse(doc.branch_working_day) : [],
          blockAppointment: doc.block_appointment,
          branchBlockAppointment: doc.branch_block_appointment
        })) : []
      };

      // Cache the formatted data with timestamp
      localStorage.setItem(INITIAL_DATA_CACHE_KEY, JSON.stringify({
        data: formattedData,
        timestamp: Date.now()
      }));
      return formattedData;
    } else {
      throw new Error('Failed to fetch initial data');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    throw error;
  }
};

// Create appointment - NOW USING BACKEND PROXY
export const createAppointment = async (appointmentData) => {
  try {
    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      throw new Error('Customer ID not found. Please login again.');
    }

    const response = await api.post('/api/bull36/create_appointment', {
      ...appointmentData,
      cust_id: customerId
    });
    
    if (response.data.success === 1) {
      return {
        success: true,
        message: response.data.message,
        data: response.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to create appointment');
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Something went wrong',
      error: error
    };
  }
};

// Cache key for template and branches data
const TEMPLATE_BRANCHES_CACHE_KEY = 'medicare_template_branches';

// Get template and branch data - NOW USING BACKEND PROXY
export const getTemplateAndBranches = async (signal) => {
  try {
    // Check if we have valid cached data FIRST before waiting for context
    const cachedData = localStorage.getItem(TEMPLATE_BRANCHES_CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;
      
      if (!isExpired) {
        return data;
      }
    }
    

    // Updated to match backend endpoint change
    const response = await api.get('/api/get_template', {
      // params: {
      //   template_id: 1
      // },
      signal
    });

    if (response.data.success === 1) {
      const formattedData = {
        template: response.data.template_data,
        userTemplate: response.data.user_template,
        doctors: response.data.doctor || [],
        branches: response.data.branch || [],
        appointmentTypes: response.data.appointment_type || []
      };

      // Cache the formatted data with timestamp
      localStorage.setItem(TEMPLATE_BRANCHES_CACHE_KEY, JSON.stringify({
        data: formattedData,
        timestamp: Date.now()
      }));

      return formattedData;
    } else {
      throw new Error('Failed to fetch template and branches data');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    throw error;
  }
};

// Get branch name by ID
export const getBranchName = async (branchId) => {
  try {
    const templateData = await getTemplateAndBranches();
    
    const branch = templateData.branches.find(b => b.id === branchId.toString());
    
    return branch ? branch.branch_name : `Branch ${branchId}`;
  } catch (error) {
    return `Branch ${branchId}`;
  }
};

export default api; 