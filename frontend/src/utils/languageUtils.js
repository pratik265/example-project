import { useLanguage } from '../contexts/LanguageContext';

// Hook for language-aware styling
export const useLanguageStyles = () => {
  const { language, isRTL } = useLanguage();

  return {
    // Text alignment based on language direction
    textAlign: isRTL ? 'right' : 'left',
    textAlignOpposite: isRTL ? 'left' : 'right',
    
    // Direction-aware positioning
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
    
    // Margin and padding helpers
    marginLeft: (value) => isRTL ? { marginRight: value } : { marginLeft: value },
    marginRight: (value) => isRTL ? { marginLeft: value } : { marginRight: value },
    paddingLeft: (value) => isRTL ? { paddingRight: value } : { paddingLeft: value },
    paddingRight: (value) => isRTL ? { paddingLeft: value } : { paddingRight: value },
    
    // CSS property object for direction-aware positioning
    leftStyle: (value) => isRTL ? { right: value } : { left: value },
    rightStyle: (value) => isRTL ? { left: value } : { right: value },
    
    // Locale for date formatting
    locale: language === 'he' ? 'he-IL' : 'en-US',
    
    // Language info
    language,
    isRTL
  };
};

// Utility function to get language-aware date formatting
export const formatDate = (date, language, options = {}) => {
  const locale = language === 'he' ? 'he-IL' : 'en-US';
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString(locale, defaultOptions);
};

// Utility function for direction-aware flex layouts
export const getFlexDirection = (isRTL, reverse = false) => {
  if (reverse) {
    return isRTL ? 'row' : 'row-reverse';
  }
  return isRTL ? 'row-reverse' : 'row';
};

// Utility function for creating language-aware styles object
export const createLanguageStyles = (isRTL) => ({
  textAlign: isRTL ? 'right' : 'left',
  direction: isRTL ? 'rtl' : 'ltr',
  left: isRTL ? 'auto' : undefined,
  right: isRTL ? undefined : 'auto'
});

export default {
  useLanguageStyles,
  formatDate,
  getFlexDirection,
  createLanguageStyles
}; 