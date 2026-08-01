import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LoadingComponent = () => {
    const { t } = useLanguage();

    return (
        <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.loading')}</p>
        </div>
    );
};

export default LoadingComponent;