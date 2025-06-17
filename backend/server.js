const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

// Import configuration
const { config, getApiUrl, getActiveUserToken, switchUser, getCurrentUser, getEndpointUrl, getActiveUserId } = require('./config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get current active configuration
const API_URL = config.api_url;
const getActiveToken = () => getActiveUserToken();
const getActiveUser = () => getActiveUserId();
const getApiURL = () => getApiUrl();

// Logging middleware
app.use((req, res, next) => {
  next();
});


// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Medicare Backend API Server',
    status: 'running',
    currentUser: getCurrentUser(),
    apiUrl: API_URL
  });
});

// API endpoint to switch users
app.post('/api/switch-user', (req, res) => {
  const { userKey } = req.body;
  
  if (switchUser(userKey)) {
    const currentUser = getCurrentUser();
    res.json({
      success: true,
      message: `Successfully switched to user: ${userKey}`,
      currentUser: currentUser,
      logout: true // Signal frontend to logout customer
    });
  } else {
    res.status(400).json({
      success: false,
      message: `User ${userKey} not found`
    });
  }
});

// API endpoint to get current user
app.get('/api/current-user', (req, res) => {
  res.json({
    success: true,
    currentUser: getCurrentUser(),
    availableUsers: Object.keys(config.availableUsers)
  });
});

// API endpoint to get configuration
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    config: config
  });
  console.log(config);
  
});

// Get doctors data from Bull36 template
app.get('/api/doctors', async (req, res) => {
  try {
    const token = getActiveUserToken();
    
    
    const response = await axios.get(`${getApiURL()}api/get_template`, {
      params: {
        token: token
      },
      timeout: 30000
    });
    
    if (response.data.success === 1 && response.data.doctor) {
      const doctors = response.data.doctor.map(doctor => ({
        id: doctor.team_member_id || doctor.id,
        name: doctor.doctor_name || doctor.display_name,
        image: doctor.image ? `${doctor.image}` : null,
        description: doctor.discription || '',
        workingDays: doctor.branch_working_day ? JSON.parse(doctor.branch_working_day || '[]') : [],
        color: doctor.color || '#000000',
        status: doctor.status,
        displayName: doctor.display_name,
        teamMemberId: doctor.team_member_id,
        branchWorkingDay: doctor.branch_working_day ? JSON.parse(doctor.branch_working_day || '[]') : [],
        blockAppointment: doctor.block_appointment,
        branchBlockAppointment: doctor.branch_block_appointment
      }));
      
      res.json(doctors);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// Get individual doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = getActiveUserToken();

    // Fetch all template data, which includes doctors
    const response = await axios.get(`${getApiURL()}api/get_template`, {
      params: {
        token: token
      },
      timeout: 30000
    });

    if (response.data.success === 1 && response.data.doctor) {
      // Find the specific doctor by ID
      const doctor = response.data.doctor.find(d => d.team_member_id === id || d.id === id);

      if (doctor) {
        // Format the doctor data (similar to the /api/doctors route)
        const formattedDoctor = {
          id: doctor.team_member_id || doctor.id,
          name: doctor.doctor_name || doctor.display_name,
          image: doctor.image ? `${doctor.image}` : null,
          description: doctor.discription || '',
          workingDays: doctor.branch_working_day ? JSON.parse(doctor.branch_working_day || '[]') : [],
          color: doctor.color || '#000000',
          status: doctor.status,
          displayName: doctor.display_name,
          teamMemberId: doctor.team_member_id,
          branchWorkingDay: doctor.branch_working_day ? JSON.parse(doctor.branch_working_day || '[]') : [],
          blockAppointment: doctor.block_appointment,
          branchBlockAppointment: doctor.branch_block_appointment
        };

        res.json(formattedDoctor);
      } else {
        // Doctor not found with the given ID
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
    } else {
      // API call successful but no doctor data returned
      res.status(404).json({
        success: false,
        message: 'Doctor not found or no doctor data available'
      });
    }
  } catch (error) {
    // Handle API call errors
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
});

// Get treatments data from Bull36 template
app.get('/api/treatments', async (req, res) => {
  try {
    const token = getActiveUserToken();
    
    
    const response = await axios.get(`${getApiURL()}api/get_template`, {
      params: {
        token: token
      },
      timeout: 30000
    });
    
    if (response.data.success === 1 && response.data.appointment_type) {
      const treatments = response.data.appointment_type.map(treatment => ({
        id: treatment.id,
        name: treatment.name,
        description: treatment.discription || `${treatment.name} - Professional medical treatment`,
        price: treatment.price,
        time: treatment.time,
        force_pay: treatment.force_pay,
        cancellationPrice: treatment.cancelation_price || '0',
        minForcePaymentPrice:treatment.min_force_payment_price,
        freeCancellationPeriod: treatment.free_cancelation_period || '0',
        doctorIds: treatment.doctor_id ? JSON.parse(treatment.doctor_id || '[]') : [],
        branchDoctorIds: treatment.branch_doctor_id ? JSON.parse(treatment.branch_doctor_id || '[]') : [],
        typeOrder: treatment.type_order,
        color: treatment.appointments_type_color,
        images: treatment.images ? JSON.parse(treatment.images || '[]') : [],
        status: treatment.status,
        branch: treatment.branch || '[]'
      }));
      
      res.json(treatments);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatments',
      error: error.message
    });
  }
});

// Get individual treatment by ID
app.get('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = getActiveUserToken();
    
    
    const response = await axios.get(`${getApiURL()}api/get_template`, {
      params: {
        token: token
      },
      timeout: 30000
    });
    
    if (response.data.success === 1 && response.data.appointment_type) {
      const treatment = response.data.appointment_type.find(t => t.id === id);
      
      if (treatment) {
        const formattedTreatment = {
          id: treatment.id,
          name: treatment.name,
          description: treatment.discription || `${treatment.name} - Professional medical treatment`,
          price: treatment.price,
          time: treatment.time,
          force_pay: treatment.force_pay,
          cancellationPrice: treatment.cancelation_price || '0',
          minForcePaymentPrice:treatment.min_force_payment_price,
          freeCancellationPeriod: treatment.free_cancelation_period || '0',
          doctorIds: treatment.doctor_id ? JSON.parse(treatment.doctor_id || '[]') : [],
          branchDoctorIds: treatment.branch_doctor_id ? JSON.parse(treatment.branch_doctor_id || '[]') : [],
          typeOrder: treatment.type_order,
          color: treatment.appointments_type_color,
          images: treatment.images ? JSON.parse(treatment.images || '[]') : [],
          status: treatment.status,
          branch: treatment.branch || '[]'
        };
        
        res.json(formattedTreatment);
      } else {
        res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment',
      error: error.message
    });
  }
});

// Get clinics data from Bull36 template
app.get('/api/clinics', async (req, res) => {
  try {
    const token = getActiveUserToken();
    
    
    const response = await axios.get(`${getApiURL()}api/get_template`, {
      params: {
        token: token
      },
      timeout: 30000
    });
    
    if (response.data.success === 1) {
      const clinics = [];
      
      // Add branches as clinics
      if (response.data.branch && Array.isArray(response.data.branch)) {
        response.data.branch.forEach(branch => {
          // Parse working_day_time if it exists
          let schedule = [];
          if (branch.working_day_time) {
            try {
              schedule = JSON.parse(branch.working_day_time);
            } catch (error) {
            }
          }
          
          clinics.push({
            id: branch.id,
            name: branch.branch_name || `Branch ${branch.id}`,
            address: branch.address || '',
            phone: branch.phone || '',
            email: branch.email || '',
            hours: "Mon-Fri: 9AM-5PM, Sat: 10AM-3PM",
            schedule: schedule, // Now properly parsed
            image: branch.image ? `${branch.image}` : null,
            services: ["General Medicine", "Consultations", "Treatments"],
            description: branch.discription || ''
          });
        });
      }
      
      res.json(clinics);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinics',
      error: error.message
    });
  }
});

// Proxy endpoint for Bull36 get_template API
app.get('/api/get_template', async (req, res) => {
  try {
    const token = getActiveUserToken();
    // const templateId = req.query.template_id || 1;
    
    const response = await axios.get(`${getApiURL()}api/get_template`, {
      params: {
        token: token
      },
      timeout: 30000 // 30 second timeout
    });
    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template data',
      error: error.message
    });
  }
});

// Proxy endpoint for Bull36 get_available_time API
app.get('/api/bull36/get_available_time', async (req, res) => {
  try {
    const token = getActiveUserToken();
    const { data_time, template_id, branch, appointment_type, date } = req.query;
    
    const response = await axios.get(`${getApiURL()}api/get_available_time_of_doctor`, {
      params: {
        token: token,
        data_time: data_time || '5',
        template_id: template_id || 1,
        branch: branch,
        appointment_type: appointment_type, // Bull36 API expects this parameter name
        date: date
      },
      timeout: 30000
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available time data',
      error: error.message
    });
  }
});

// Proxy endpoint for Bull36 create_appointment API
app.post('/api/bull36/create_appointment', async (req, res) => {
  try {
    const token = getActiveUserToken();
    const appointmentData = req.body;
    
    // Build query parameters for the doctor appointment API
    const queryParams = new URLSearchParams({
      token: token,
      branch: appointmentData.branch,
      cust_id: appointmentData.cust_id,
      start_time: appointmentData.start_time,
      end_time: appointmentData.end_time,
      date: appointmentData.date,
      appointments_type_id: appointmentData.appointments_type_id
    });
    
    // Add payment data if provided
    const paymentFields = ['force_pay','card_holder_name', 'card_number', 'expiry_month', 'expiry_year', 'cvc', 'card_pin'];
    paymentFields.forEach(field => {
      if (appointmentData[field]) {
        queryParams.append(field, appointmentData[field]);
      }
    });
    
    const response = await axios.get(`${getApiURL()}api/create_doctor_appointment_by_api?${queryParams.toString()}`, {
      timeout: 30000
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor appointment',
      error: error.message
    });
  }
});

// Proxy endpoint for Bull36 send OTP API
const otpStore = {};
app.post('/api/bull36/send_otp', async (req, res) => {
  try {
    const token = getActiveUserToken();
    const user = getActiveUser();
    
    const { phone } = req.body;
    
    const response = await axios.get(`${getApiURL()}api/send_whatsapp_otp_to_customer`, {
      params: {
        token: token,
        phone: phone,
        user: user,
      },
      timeout: 30000
    });
    
    // SECURITY FIX: Never expose OTP in response
    if (response.data.success === 1) {
      const customerId = response.data.customer_id 
      
      res.json({
        success: 1,
        message: 'OTP sent successfully to your WhatsApp!',
        customer_id: customerId,
        // DO NOT include otp in response for security
      });
      otpStore[phone] = {
        otp: response.data.otp,
        timestamp: Date.now(),
        customer_id: customerId // Store customer_id for verification
      };
    } else {
      res.status(400).json({
        success: 0,
        message: response.data.message || 'Failed to send OTP',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: 0,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Proxy endpoint for Bull36 verify OTP API
app.post('/api/bull36/verify_otp', (req, res) => {
  const { phone, otp } = req.body;

  const record = otpStore[phone];

  if (!record || !record.otp) {
    return res.status(400).json({ success: false, message: 'OTP not found' });
  }

  // Optionally check for expiration (e.g., 5 mins = 300000 ms)
  const now = Date.now();
  if (now - record.timestamp > 300000) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  if (record.otp.toString() !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP', 'record': record.otp.toString(), 'otp': otp});
  }

  delete otpStore[phone]; // OTP used, remove from memory

  // Generate a customer ID (use stored one if available, or create new)
  const customerId = record.customer_id || `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: 1, // Changed to 1 to match Bull36 API format
    message: 'OTP verified successfully',
    cust_id: customerId,
    customer_data: {
      phone: phone,
      verified: true,
      verified_at: new Date().toISOString()
    }
  });
});

// Generic error handler
app.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, () => {
}); 