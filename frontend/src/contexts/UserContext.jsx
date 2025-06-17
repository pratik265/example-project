import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { setUserContext } from '../services/api';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState(['user', 'drnoagrados', 'eli']);
  const [loading, setLoading] = useState(true);
  const { userKey } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [templateId, setTemplateId] = useState(null);
  
  
  // Add refs to track API calls and prevent duplicates
  const lastSwitchedUser = useRef(null);
  const switchingInProgress = useRef(false);
  const switchCallCache = useRef(new Map());
  // Add more aggressive deduplication
  const pendingRequests = useRef(new Map());
  const effectRunCount = useRef(0);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const templateResponse = await axios.get('http://localhost:3001/api/get_template');
        if (templateResponse.data.success === 1 && templateResponse.data.template_data) {
          const templateId = templateResponse.data.template_data.template_id;
          
          // Only proceed if templateId is between 1 and 5
          if (['1', '2', '3', '4', '5'].includes(templateId)) {
            // Clear any existing template data
            localStorage.removeItem('template_id');
            
            // Set new template data
            localStorage.setItem('template_id', templateId);
            //console.log("templateId====>", templateId);
            
            // Set CSS variables based on template ID
            // switch(templateId) {
            //   case '1':
            //     document.documentElement.style.setProperty('--main-color', '#0540f2');
            //     document.documentElement.style.setProperty('--secondary-color', '#032b9e');
            //     document.documentElement.style.setProperty('--accent-color', '#4d6fff');
            //     break;
            //   case '2':
            //     document.documentElement.style.setProperty('--main-color', '#007bff');
            //     document.documentElement.style.setProperty('--secondary-color', '#0056b3');
            //     document.documentElement.style.setProperty('--accent-color', '#00bfff');
            //     break;
            //   case '3':
            //     document.documentElement.style.setProperty('--main-color', '#764ba2');
            //     document.documentElement.style.setProperty('--secondary-color', '#5c3d8a');
            //     document.documentElement.style.setProperty('--accent-color', '#9b6bdf');
            //     break;
            //   case '4':
            //     document.documentElement.style.setProperty('--main-color', '#28a745');
            //     document.documentElement.style.setProperty('--secondary-color', '#1e7e34');
            //     document.documentElement.style.setProperty('--accent-color', '#34ce57');
            //     break;
            //   case '5':
            //     document.documentElement.style.setProperty('--main-color', '#dc3545');
            //     document.documentElement.style.setProperty('--secondary-color', '#a71d2a');
            //     document.documentElement.style.setProperty('--accent-color', '#ff4d5e');
            //     break;
            // }
            
            setTemplateId(templateId);
          }
        }
      } catch (error) {
        console.error('Error fetching template data on initial load:', error);
      }
    };

    // Clear any existing template data before fetching
    localStorage.removeItem('template_id');
    fetchTemplate();
  }, []); // Empty dependency array means this effect runs once on mount

  // Get current user token
  const getCurrentUserToken = () => {
    const tokens = {
      user: 'GRCRRAIEG7YBSUA2JK',
      drnoagrados: '9RDE4YUR25XOFBC25389',
      eli: 'GC8RUZ98QWERT'
    };
    
    const token = tokens[currentUser];
    if (!token) {
      // Redirect to 404 page if user token not found      
      navigate('/404', { replace: true });
      return null;
    }
    
    return token;
  };

  // Switch user in backend when URL changes - optimized with aggressive caching
  const switchUserInBackend = async (userKey) => {
    // Check if we already switched to this user recently
    if (lastSwitchedUser.current === userKey) {
      return true;
    }
    
    // Check if switching is already in progress for this user
    if (switchingInProgress.current) {
      return false;
    }
    
    // Check if there's already a pending request for this user
    if (pendingRequests.current.has(userKey)) {
      try {
        return await pendingRequests.current.get(userKey);
      } catch (error) {
        pendingRequests.current.delete(userKey);
        return false;
      }
    }
    
    // Check cache for recent successful calls (within last 10 seconds)
    const cacheKey = userKey;
    const cachedResult = switchCallCache.current.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < 10000) {
      lastSwitchedUser.current = userKey;
      return cachedResult.success;
    }
    
    // Create a promise for this request to prevent duplicates
    const requestPromise = (async () => {
      try {
        switchingInProgress.current = true;
        
        const response = await axios.post('http://localhost:3001/api/switch-user', {
          userKey: userKey
        });
        
        const success = response.data.success;
        
        // Handle logout if requested by backend
        if (success && response.data.logout) {
          logout();
        }
        
        // Cache the result for longer (10 seconds)
        switchCallCache.current.set(cacheKey, {
          success,
          timestamp: Date.now()
        });
        
        if (success) {
          lastSwitchedUser.current = userKey;
          // Clear all template-related data from localStorage
          localStorage.removeItem('medicare_initial_data');
          localStorage.removeItem('medicare_template_branches');
          localStorage.removeItem('template_id');
          
          return true;
        }
      } catch (error) {
        // Cache failed result for a shorter time (2 seconds)
        switchCallCache.current.set(cacheKey, {
          success: false,
          timestamp: Date.now() - 8000 // Make it expire faster for retries
        });
      } finally {
        switchingInProgress.current = false;
        pendingRequests.current.delete(userKey);
      }
      return false;
    })();
    
    // Store the promise to prevent duplicate requests
    pendingRequests.current.set(userKey, requestPromise);
    
    return await requestPromise;
  };

  // Effect to handle user switching based on URL - optimized dependencies
  useEffect(() => {
    effectRunCount.current += 1;
    const currentRun = effectRunCount.current;
    
    const handleUserFromUrl = async () => {
      // Prevent multiple rapid executions
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Check if this effect run is still the latest
      if (currentRun !== effectRunCount.current) {
        return;
      }
      
      // Skip if no userKey or same as current user and not initial load
      if (!userKey || (currentUser === userKey && !loading)) {
        if (!userKey) {
          setLoading(true);
          const pathWithoutUser = location.pathname;
          navigate(`/drnoagrados${pathWithoutUser}`, { replace: true });
        }
        return;
      }
      
      setLoading(true);

      // Validate user exists
      if (!availableUsers.includes(userKey)) {
        navigate('/404', { replace: true });
        return;
      }

      // Switch user if different from current or if it's the initial load
      if (currentUser !== userKey) {
        setCurrentUser(userKey);
        
        // Only call backend API if user actually changed
        const switched = await switchUserInBackend(userKey);
        
        if (switched) {
          // Clear caches when user changes successfully
          localStorage.removeItem('medicare_initial_data');
          localStorage.removeItem('medicare_template_branches');
        }
      }
      
      setLoading(false);
    };

    handleUserFromUrl();
  }, [userKey, currentUser, availableUsers]); // Removed navigate and location.pathname to prevent excessive re-runs

  // Create context value
  const contextValue = {
    currentUser,
    availableUsers,
    loading,
    getCurrentUserToken,
    switchUser: (newUserKey) => {
      // Only navigate if actually switching to a different user
      if (newUserKey !== currentUser) {
        const currentPath = location.pathname.replace(`/${currentUser}`, '');
        
        // Check if current path is a booking page and redirect to treatments instead
        if (currentPath.includes('/treatments/') && currentPath.includes('/book')) {
          navigate(`/${newUserKey}/treatments`);
        } else {
          navigate(`/${newUserKey}${currentPath}`);
        }
      }
    },
    templateId,
  };

  // Register this context with the API service whenever currentUser or loading changes
  useEffect(() => {
    if (currentUser && !loading) {
      setUserContext(contextValue);
    }
  }, [currentUser, loading]);

  // Cleanup cache periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of switchCallCache.current.entries()) {
        if (now - value.timestamp > 15000) { // Remove entries older than 15 seconds
          switchCallCache.current.delete(key);
        }
      }
    }, 15000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext }; 