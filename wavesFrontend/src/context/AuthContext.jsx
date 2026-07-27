import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios'; // Adjust path if your axios file is in a different folder

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Remember Me: a "remembered" session's token lives in localStorage (survives browser
    // restarts); an "unremembered" one lives in sessionStorage (cleared when the tab/browser
    // closes). Check both on load - whichever one has it wins.
    const [token, setToken] = useState(
        () => localStorage.getItem('customer_token') || sessionStorage.getItem('customer_token') || null
    );
    const [loading, setLoading] = useState(true);
    // Whether this customer still qualifies for the automatic 20% first-order discount
    // (from GET /me's top-level `first_order_discount_eligible` field - defaults true for
    // guests/not-yet-loaded so the UI doesn't flash "no discount" before the real check resolves)
    const [firstOrderDiscountEligible, setFirstOrderDiscountEligible] = useState(true);

    // Fetch user details if a token exists on app load
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
                    // Clear invalid token if request fails with 401
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        fetchCustomerProfile();
    }, [token]);

    // Handle Login - rememberMe decides which storage keeps the token
    const login = async (email, password, rememberMe = false) => {
        const response = await API.post('/login', { email, password });
        const resData = response.data;

        // Extract token from backend response
        const authToken = resData.data?.token || resData.token;
        const userData = resData.data?.user || resData.data;

        if (authToken) {
            // Always clear both first so switching Remember Me on/off between logins never
            // leaves a stale token sitting in the other storage
            localStorage.removeItem('customer_token');
            sessionStorage.removeItem('customer_token');
            (rememberMe ? localStorage : sessionStorage).setItem('customer_token', authToken);
            setToken(authToken);
            setUser(userData);
        }
        return resData;
    };

    // Handle Registration - new accounts are remembered by default (persisted in localStorage)
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

    // Handle Logout
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

    // Update the current customer's profile (name/email/phone/address_line/city/profile_picture)
    // via POST /profile (multipart/form-data, so an image file can ride along - the route is
    // registered as POST directly on the backend, no _method spoofing needed here)
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