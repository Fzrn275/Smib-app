// src/context/LanguageContext.js
// Persists the user's language preference (EN / BM) via AsyncStorage.

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = 'smib_language';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(v => { if (v) setLang(v); });
  }, []);

  function toggleLanguage() {
    const next = lang === 'en' ? 'bm' : 'en';
    setLang(next);
    AsyncStorage.setItem(LANG_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
