// Authentication utility functions

export const isLoggedIn = () => {
  const customerId = localStorage.getItem('customer_id');
  return !!customerId; // Returns true if customerId exists, false if null/undefined
};

export const getCustomerId = () => {
  return localStorage.getItem('customer_id');
};

export const clearSession = () => {
  localStorage.removeItem('customer_id');
};

export const setCustomerId = (id) => {
  localStorage.setItem('customer_id', id);
};

// Function to check if the stored customer_id is valid (not expired or malformed)
export const validateCustomerId = () => {
  const customerId = getCustomerId();
  if (!customerId) return false;
  
  // Add any additional validation logic here
  // For example, check if it's a valid format
  return !isNaN(customerId) && customerId.length > 0;
}; 