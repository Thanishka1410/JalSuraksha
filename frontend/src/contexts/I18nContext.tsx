import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en, { Translations } from '../i18n/en';
import te from '../i18n/te';
import hi from '../i18n/hi';

export type Language = 'en' | 'te' | 'hi';

const translations: Record<Language, Translations> = { en, te, hi };

interface I18nContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  t: en,
  setLanguage: () => {},
});

const STORAGE_KEY = 'JalSuraksha_lang';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    return saved && ['en', 'te', 'hi'].includes(saved) ? saved : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update document lang attribute for accessibility
    document.documentElement.lang = lang;
  }, []);

  return (
    <I18nContext.Provider value={{ language, t: translations[language], setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

export default I18nContext;
