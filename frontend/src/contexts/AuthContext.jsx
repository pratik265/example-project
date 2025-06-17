import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [userPhone, setUserPhone] = useState(null);

  useEffect(() => {
    // Check localStorage for auth data on mount
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedCustomerId = localStorage.getItem('customer_id');
    const storedUserPhone = localStorage.getItem('userPhone');

    setIsLoggedIn(storedIsLoggedIn);
    setCustomerId(storedCustomerId);
    setUserPhone(storedUserPhone);
  }, []);

  const login = (customer_id, phone) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('customer_id', customer_id);
    localStorage.setItem('userPhone', phone);
    
    setIsLoggedIn(true);
    setCustomerId(customer_id);
    setUserPhone(phone);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('userPhone');
    
    setIsLoggedIn(false);
    setCustomerId(null);
    setUserPhone(null);
  };

  const value = {
    isLoggedIn,
    customerId,
    userPhone,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 