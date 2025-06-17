import React, { createContext, useContext, useState, useEffect } from 'react';
import { useContext as useReactContext } from 'react';
import { UserContext } from './UserContext';
import Template1 from '../templates/Template1';
import Template2 from '../templates/Template2';
import { getThemeByTemplateId } from '../themes/themeConfig';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const templateMap = {
  '1': Template1,
  '2': Template2
  // Add more as needed
};

export function TemplateSwitcher({ templateId, children }) {
  const TemplateComponent = templateMap[templateId] || Template1;
  return <TemplateComponent>{children}</TemplateComponent>;
}

export const ThemeProvider = ({ children }) => {
  const [currentTemplateId, setCurrentTemplateId] = useState('default');
  const [theme, setTheme] = useState(getThemeByTemplateId('default'));

  useEffect(() => {
    setTheme(getThemeByTemplateId(currentTemplateId));
  }, [currentTemplateId]);

  const changeTemplate = (templateId) => {
    setCurrentTemplateId(templateId);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTemplateId, changeTemplate }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { UserContext }; 