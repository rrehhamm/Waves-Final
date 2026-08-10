import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../../i18n/translations';

const AdminLanguageContext = createContext();

export const useAdminLanguage = () => useContext(AdminLanguageContext);

const dirFor = (lang) => (lang === 'en' ? 'ltr' : 'rtl');

export const AdminLanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => localStorage.getItem('admin_lang') || 'en');

    useEffect(() => {
        localStorage.setItem('admin_lang', language);
    }, [language]);

    const setLanguage = (lang) => {
        if (translations[lang]?.admin) setLanguageState(lang);
    };

    const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

    const t = (path, vars) => {
        const lookup = (dict) =>
            path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
        // Look inside translations[language].admin first (admin-only strings),
        // then fall back to the shared/site-wide tree in the same language
        // (e.g. orderStatus, which lives outside the admin branch), then repeat
        // both lookups in English as a last resort.
        const value =
            lookup(translations[language]?.admin) ??
            lookup(translations[language]) ??
            lookup(translations.en?.admin) ??
            lookup(translations.en) ??
            path;
        if (typeof value === 'string' && vars) {
            return Object.keys(vars).reduce((str, key) => str.replaceAll(`{{${key}}}`, vars[key]), value);
        }
        return value;
    };

    return (
        <AdminLanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, dir: dirFor(language) }}>
            {children}
        </AdminLanguageContext.Provider>
    );
};
