import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية (فصحى)' },
    { code: 'ar-eg', label: 'العربية المصرية' },
];

// Both Arabic variants use RTL layout and both map to the backend's "ar" locale
// (the backend's SetLocale middleware / lang files only know "ar" or "en" - the dialect
// choice is purely a frontend static-text concern, see src/i18n/translations.js)
const backendLocaleFor = (lang) => (lang === 'en' ? 'en' : 'ar');
const dirFor = (lang) => (lang === 'en' ? 'ltr' : 'rtl');

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => localStorage.getItem('site_lang') || 'en');

    // Keep the axios instance's Accept-Language header (stored under the "lang" key, see
    // src/api/axios.js) in sync with the selected site language whenever it changes.
    useEffect(() => {
        localStorage.setItem('site_lang', language);
        localStorage.setItem('lang', backendLocaleFor(language));
        document.documentElement.dir = dirFor(language);
        document.documentElement.lang = backendLocaleFor(language);
    }, [language]);

    const setLanguage = (lang) => {
        if (translations[lang]) setLanguageState(lang);
    };

    // Looks up a dot-path (e.g. "nav.home") in the current language's dictionary,
    // falling back to English and finally to the key itself if nothing is found.
    const t = (path) => {
        const lookup = (dict) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
        return lookup(translations[language]) ?? lookup(translations.en) ?? path;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir: dirFor(language), languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
};
