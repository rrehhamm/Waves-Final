import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

// Guards every /admin/* screen except /admin/login itself.
export default function RequireAdminAuth({ children }) {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
