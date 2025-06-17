// API Configuration for Backend
const config = {
  // Base API URL
  api_url: 'https://bull36.com/',
  
  // Available Users with their tokens
  availableUsers: {
    user: 'GRCRRAIEG7YBSUA2JK',
    drnoagrados: '9RDE4YUR25XOFBC25389',
    eli : 'GC8RUZ98QWERT'
  },

  userIds: {
    user: '14',
    drnoagrados: '25389',
    eli: '47'

  },
  
  // Currently selected drnoagrados (default to 'user')
  selectedUser: 'user',
  
  // API Endpoints
  // endpoints: {
  //   get_template: 'api/get_template',
  //   get_treatments: 'api/get_treatments',
  //   get_doctors: 'api/get_doctors',
  //   get_branches: 'api/get_branches',
  //   get_available_time: 'api/get_available_time_of_doctor',
  //   send_otp: 'api/send_whatsapp_otp_to_customer',
  //   create_appointment: 'api/create_doctor_appointment_by_api'
  // },
};

// Helper function to get API URL with endpoint
const getApiUrl = (endpoint = '') => {
  return `${config.api_url}${endpoint}`;
};

// Get the current active user token
const getActiveUserToken = () => {
  return config.availableUsers[config.selectedUser];
};

const getActiveUserId = () => {
  return config.userIds[config.selectedUser];
};

// Switch to a different user
const switchUser = (userKey) => {
  if (config.availableUsers[userKey]) 
  {
    config.selectedUser = userKey;
    return true;
  }
  else 
  {
    return false;
  }
};

// Get current selected user info
const getCurrentUser = () => {
  return {
    userKey: config.selectedUser,
    token: getActiveUserToken()
  };
};

// Helper function to get user token (deprecated - use getActiveUserToken instead)
const getUserToken = (userKey) => {
  return config.availableUsers[userKey];
};

// Helper function to get full endpoint URL
const getEndpointUrl = (endpointKey) => {
  const endpoint = config.endpoints[endpointKey];
  return endpoint ? getApiUrl(endpoint) : null;
};

// Export for CommonJS (Node.js)
module.exports = {
  config,
  getApiUrl,
  getUserToken, // Keep for backward compatibility
  getActiveUserToken, // New function for current active token
  switchUser, // Function to switch users
  getCurrentUser, // Function to get current user info
  getEndpointUrl,
  getActiveUserId
}; 