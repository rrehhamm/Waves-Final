import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null);
    const [loading, setLoading] = useState(true);

    // On app load, if an admin_token is already saved, verify it and load the admin's info
    useEffect(() => {
        const fetchAdmin = async () => {
            if (token) {
                try {
                    const res = await adminApi.get('/me');
                    setAdmin(res.data?.data || null);
                } catch (error) {
                    console.error('Failed to fetch admin:', error);
                    if (error.response?.status === 401) {
                        localStorage.removeItem('admin_token');
                        setToken(null);
                        setAdmin(null);
                    }
                }
            }
            setLoading(false);
        };

        fetchAdmin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (email, password) => {
        const response = await adminApi.post('/login', { email, password });
        const resData = response.data;

        const authToken = resData.data?.token;
        const adminData = resData.data?.admin;

        if (authToken) {
            localStorage.setItem('admin_token', authToken);
            setToken(authToken);
            setAdmin(adminData);
        }
        return resData;
    };

    const logout = async () => {
        try {
            if (token) {
                await adminApi.post('/logout');
            }
        } catch (error) {
            console.error('Admin logout error:', error);
        } finally {
            localStorage.removeItem('admin_token');
            setToken(null);
            setAdmin(null);
        }
    };

    return (
        <AdminAuthContext.Provider value={{ admin, token, isAuthenticated: !!token, loading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
