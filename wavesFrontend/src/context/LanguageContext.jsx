import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية (فصحى)' },
    { code: 'ar-eg', label: 'العربية المصرية' },
];

const backendLocaleFor = (lang) => (lang === 'en' ? 'en' : 'ar');
const dirFor = (lang) => (lang === 'en' ? 'ltr' : 'rtl');

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => localStorage.getItem('site_lang') || 'en');

    useEffect(() => {
        localStorage.setItem('site_lang', language);
        localStorage.setItem('lang', backendLocaleFor(language));
        document.documentElement.dir = dirFor(language);
        document.documentElement.lang = backendLocaleFor(language);
    }, [language]);

    const setLanguage = (lang) => {
        if (translations[lang]) setLanguageState(lang);
    };

    const t = (path, vars) => {
        const lookup = (dict) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
        const value = lookup(translations[language]) ?? lookup(translations.en) ?? path;
        if (typeof value === 'string' && vars) {
            return Object.keys(vars).reduce((str, key) => str.replaceAll(`{{${key}}}`, vars[key]), value);
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir: dirFor(language), languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
};
