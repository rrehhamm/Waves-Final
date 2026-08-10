import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';

export default function RequireAdminAuth({ children }) {
    const { t } = useAdminLanguage();
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-3 bg-slate-50">
                <div className="w-9 h-9 rounded-full border-2 border-[#81A6C6]/25 border-t-[#81A6C6] animate-spin" />
                <span className="text-sm font-medium text-slate-400">{t('login.loadingPanel')}</span>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
