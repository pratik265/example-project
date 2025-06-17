import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const LanguageToggler = () => {
  const { language, switchLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    switchLanguage(newLanguage);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="language-toggler"
      title={language === 'en' ? t('language.switchToHebrew') : t('language.switchToEnglish')}
    >
      {language === 'en' ? t('language.hebrew') : t('language.english')}
    </button>
  );
};

export default LanguageToggler; 