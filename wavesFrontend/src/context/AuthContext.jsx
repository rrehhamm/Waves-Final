import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        () => localStorage.getItem('customer_token') || sessionStorage.getItem('customer_token') || null
    );
    const [loading, setLoading] = useState(true);
    const [firstOrderDiscountEligible, setFirstOrderDiscountEligible] = useState(true);

    useEffect(() => {
        const fetchCustomerProfile = async () => {
            if (token) {
                try {
                    const response = await API.get('/me');
                    if (response.data?.success || response.data?.data) {
                        setUser(response.data.data || response.data);
                    }
                    if (typeof response.data?.first_order_discount_eligible === 'boolean') {
                        setFirstOrderDiscountEligible(response.data.first_order_discount_eligible);
                    }
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        fetchCustomerProfile();
    }, [token]);

    const login = async (email, password, rememberMe = false) => {
        const response = await API.post('/login', { email, password });
        const resData = response.data;

        const authToken = resData.data?.token || resData.token;
        const userData = resData.data?.user || resData.data;

        if (authToken) {
            localStorage.removeItem('customer_token');
            sessionStorage.removeItem('customer_token');
            (rememberMe ? localStorage : sessionStorage).setItem('customer_token', authToken);
            setToken(authToken);
            setUser(userData);
        }
        return resData;
    };

    const register = async (userData, rememberMe = true) => {
        const response = await API.post('/register', userData);
        const resData = response.data;

        const authToken = resData.data?.token || resData.token;
        const userInfo = resData.data?.user || resData.data;

        if (authToken) {
            localStorage.removeItem('customer_token');
            sessionStorage.removeItem('customer_token');
            (rememberMe ? localStorage : sessionStorage).setItem('customer_token', authToken);
            setToken(authToken);
            setUser(userInfo);
        }
        return resData;
    };

    const logout = async () => {
        try {
            if (token) {
                await API.post('/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('customer_token');
            sessionStorage.removeItem('customer_token');
            setToken(null);
            setUser(null);
            setFirstOrderDiscountEligible(true);
        }
    };

    const updateProfile = async (formData) => {
        const response = await API.post('/profile', formData);
        const resData = response.data;
        if (resData?.data) {
            setUser(resData.data);
        }
        return resData;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                loading,
                login,
                register,
                logout,
                updateProfile,
                firstOrderDiscountEligible,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};