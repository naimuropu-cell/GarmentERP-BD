import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, toBengaliNumber } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  formatNumber: (val: string | number) => string;
  toBengaliNumber: (val: string | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('garment_language') as Language;
    return saved === 'bn' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('garment_language', lang);
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
  }, [language]);

  const t = useCallback((key: string, defaultText?: string): string => {
    const dict = translations[language] || translations.en;
    if (dict[key]) {
      return dict[key];
    }
    // Fallback to English if key missing in Bangla
    if (language !== 'en' && translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  }, [language]);

  const formatNumber = useCallback((val: string | number): string => {
    if (language === 'bn') {
      return toBengaliNumber(val);
    }
    return String(val);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, formatNumber, toBengaliNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

