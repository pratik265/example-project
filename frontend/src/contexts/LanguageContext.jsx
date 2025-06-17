import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next'; // Import the i18n instance
import { en } from '../locales/en';
import { he } from '../locales/he';
import { getUserTemplateLanguage } from '../services/api';

const translations = {
  en,
  he
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English initially
  const [isInitialized, setIsInitialized] = useState(false);

  const isRTL = language === 'he';

  useEffect(() => {
    const initializeLanguage = async () => {
      // Check localStorage first
      const savedLanguage = localStorage.getItem('language');
      
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'he')) {
        // User has a saved preference, use it
        setLanguage(savedLanguage);
        setIsInitialized(true);
      } else {
        // No saved preference, fetch from API
        try {
          const apiLanguage = await getUserTemplateLanguage();
          
          if (apiLanguage && (apiLanguage === 'en' || apiLanguage === 'he')) {
            setLanguage(apiLanguage);
            localStorage.setItem('language', apiLanguage);
          }
        } catch (error) {
          // Keep default 'en' if API fails
          localStorage.setItem('language', 'en');
        }
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    // Save language preference to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add RTL class to body for additional styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language, isRTL, isInitialized]);

  const switchLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage); // Update the global i18n instance
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return key;
      }
    }
    
    return value;
  };

  const value = {
    language,
    isRTL,
    switchLanguage,
    t,
    translations: translations[language],
    isInitialized
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 