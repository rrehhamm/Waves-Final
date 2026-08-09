import React from 'react';
import { useAdminLanguage } from '../context/AdminLanguageContext';

const AdminLanguageToggle = () => {
    const { language, toggleLanguage } = useAdminLanguage();

    return (
        <button onClick={toggleLanguage} title="Toggle admin language">
            {language === 'en' ? 'العربية' : 'English'}
        </button>
    );
};

export default AdminLanguageToggle;
