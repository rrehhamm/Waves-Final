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

    // Reads from the "admin" branch only, so calls stay short: t('nav.dashboard') not t('admin.nav.dashboard')
    const t = (path, vars) => {
        const lookup = (dict) =>
            path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
        const value = lookup(translations[language]?.admin) ?? lookup(translations.en?.admin) ?? path;
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
