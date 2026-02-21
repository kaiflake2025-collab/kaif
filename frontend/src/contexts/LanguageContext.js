import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext(null);

const LANG_KEY = 'kaif_lang';
const SUPPORTED_LANGS = ['ru', 'en', 'zh'];
const LANG_LABELS = { ru: 'Русский', en: 'English', zh: '中文' };

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return SUPPORTED_LANGS.includes(stored) ? stored : 'ru';
  });

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['ru'] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, SUPPORTED_LANGS, LANG_LABELS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
