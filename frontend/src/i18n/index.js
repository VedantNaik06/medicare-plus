import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import mr from './mr.json';

export const LANG_KEY = 'medicare_lang';
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
];

// Before login the choice is remembered in localStorage. After login it is saved on the user's profile.
function initialLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'mr' ? 'mr' : 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, mr: { translation: mr } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
});

// Keep <html lang="..."> correct (helps screen readers and the Devanagari font rules).
const applyLang = (lng) => { document.documentElement.lang = lng; };
applyLang(i18n.language);
i18n.on('languageChanged', applyLang);

export default i18n;
