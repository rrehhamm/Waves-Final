import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const EmptyStateComponent = ({ message }) => {
    const { t } = useLanguage();

    return (
        <div className="w-full border border-dashed border-gray-300 rounded-2xl py-16 px-4 text-center bg-gray-50 flex flex-col items-center justify-center">
            <FiInbox className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700">{message || t('common.emptyDefault')}</p>
        </div>
    );
};

export default EmptyStateComponent;