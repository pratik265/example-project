import { useTheme } from '../contexts/ThemeContext';

export const useThemeStyles = () => {
  const { theme } = useTheme();
  
  return {
    // Main Colors
    primaryColor: theme.primary,
    secondaryColor: theme.secondary,
    backgroundColor: theme.background,
    textColor: theme.text,
    accentColor: theme.accent,
    
    // Status Colors
    errorColor: theme.error,
    successColor: theme.success,
    warningColor: theme.warning,
    infoColor: theme.info,
    
    // UI Elements
    headerBg: theme.headerBg,
    footerBg: theme.footerBg,
    cardBg: theme.cardBg,
    sidebarBg: theme.sidebarBg,
    buttonBg: theme.buttonBg,
    buttonText: theme.buttonText,
    inputBg: theme.inputBg,
    inputBorder: theme.inputBorder,
    
    // Typography
    headingColor: theme.headingColor,
    linkColor: theme.linkColor,
    mutedText: theme.mutedText,
    
    // Shadows
    cardShadow: theme.cardShadow,
    headerShadow: theme.headerShadow,
    
    // Borders
    borderColor: theme.borderColor,
    borderRadius: theme.borderRadius
  };
};

export const applyThemeToElement = (element, theme) => {
  if (!element) return;
  
  // Main Colors
  element.style.setProperty('--primary-color', theme.primary);
  element.style.setProperty('--secondary-color', theme.secondary);
  element.style.setProperty('--background-color', theme.background);
  element.style.setProperty('--text-color', theme.text);
  element.style.setProperty('--accent-color', theme.accent);
  
  // Status Colors
  element.style.setProperty('--error-color', theme.error);
  element.style.setProperty('--success-color', theme.success);
  element.style.setProperty('--warning-color', theme.warning);
  element.style.setProperty('--info-color', theme.info);
  
  // UI Elements
  element.style.setProperty('--header-bg', theme.headerBg);
  element.style.setProperty('--footer-bg', theme.footerBg);
  element.style.setProperty('--card-bg', theme.cardBg);
  element.style.setProperty('--sidebar-bg', theme.sidebarBg);
  element.style.setProperty('--button-bg', theme.buttonBg);
  element.style.setProperty('--button-text', theme.buttonText);
  element.style.setProperty('--input-bg', theme.inputBg);
  element.style.setProperty('--input-border', theme.inputBorder);
  
  // Typography
  element.style.setProperty('--heading-color', theme.headingColor);
  element.style.setProperty('--link-color', theme.linkColor);
  element.style.setProperty('--muted-text', theme.mutedText);
  
  // Shadows
  element.style.setProperty('--card-shadow', theme.cardShadow);
  element.style.setProperty('--header-shadow', theme.headerShadow);
  
  // Borders
  element.style.setProperty('--border-color', theme.borderColor);
  element.style.setProperty('--border-radius', theme.borderRadius);
}; 