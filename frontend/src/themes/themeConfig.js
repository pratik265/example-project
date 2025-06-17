export const themes = {
  default: {
    // Main Colors
    primary: '#2196F3',
    secondary: '#FFC107',
    background: '#FFFFFF',
    text: '#333333',
    accent: '#4CAF50',
    
    // Status Colors
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    
    // UI Elements
    headerBg: '#FFFFFF',
    footerBg: '#F5F5F5',
    cardBg: '#FFFFFF',
    sidebarBg: '#F5F5F5',
    buttonBg: '#2196F3',
    buttonText: '#FFFFFF',
    inputBg: '#FFFFFF',
    inputBorder: '#E0E0E0',
    
    // Typography
    headingColor: '#212121',
    linkColor: '#2196F3',
    mutedText: '#757575',
    
    // Shadows
    cardShadow: '0 2px 4px rgba(0,0,0,0.1)',
    headerShadow: '0 2px 4px rgba(0,0,0,0.1)',
    
    // Borders
    borderColor: '#E0E0E0',
    borderRadius: '4px'
  },
  
  template1: {
    // Main Colors
    primary: '#673AB7',
    secondary: '#FF4081',
    background: '#F5F5F5',
    text: '#212121',
    accent: '#00BCD4',
    
    // Status Colors
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    
    // UI Elements
    headerBg: '#007BFF',
    footerBg: '#512DA8',
    cardBg: '#FFFFFF',
    sidebarBg: '#EDE7F6',
    buttonBg: '#673AB7',
    buttonText: '#FFFFFF',
    inputBg: '#FFFFFF',
    inputBorder: '#D1C4E9',
    
    // Typography
    headingColor: '#311B92',
    linkColor: '#673AB7',
    mutedText: '#7E57C2',
    
    // Shadows
    cardShadow: '0 4px 6px rgba(103,58,183,0.1)',
    headerShadow: '0 2px 4px rgba(0,150,136,0.2)',
    
    // Borders
    borderColor: '#D1C4E9',
    borderRadius: '8px'
  },
  
  template2: {
    // Main Colors
    primary: '#009688',
    secondary: '#FF5722',
    background: '#FAFAFA',
    text: '#424242',
    accent: '#FFEB3B',
    
    // Status Colors
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    
    // UI Elements
    headerBg: '#009688',
    footerBg: '#00796B',
    cardBg: '#FFFFFF',
    sidebarBg: '#E0F2F1',
    buttonBg: '#009688',
    buttonText: '#FFFFFF',
    inputBg: '#FFFFFF',
    inputBorder: '#B2DFDB',
    
    // Typography
    headingColor: '#004D40',
    linkColor: '#009688',
    mutedText: '#26A69A',
    
    // Shadows
    cardShadow: '0 4px 6px rgba(0,150,136,0.1)',
    headerShadow: '0 2px 4px rgba(0,150,136,0.2)',
    
    // Borders
    borderColor: '#B2DFDB',
    borderRadius: '12px'
  },
  
  template3: {
    // Main Colors
    primary: '#3F51B5',
    secondary: '#E91E63',
    background: '#FFFFFF',
    text: '#212121',
    accent: '#8BC34A',
    
    // Status Colors
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    
    // UI Elements
    headerBg: '#3F51B5',
    footerBg: '#303F9F',
    cardBg: '#FFFFFF',
    sidebarBg: '#E8EAF6',
    buttonBg: '#3F51B5',
    buttonText: '#FFFFFF',
    inputBg: '#FFFFFF',
    inputBorder: '#C5CAE9',
    
    // Typography
    headingColor: '#1A237E',
    linkColor: '#3F51B5',
    mutedText: '#5C6BC0',
    
    // Shadows
    cardShadow: '0 4px 6px rgba(63,81,181,0.1)',
    headerShadow: '0 2px 4px rgba(63,81,181,0.2)',
    
    // Borders
    borderColor: '#C5CAE9',
    borderRadius: '6px'
  }
};

export const getThemeByTemplateId = (templateId) => {
  return themes[templateId] || themes.default;
}; 