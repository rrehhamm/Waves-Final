import axios from 'axios';

// Separate axios instance for the admin dashboard - deliberately NOT shared with the
// customer-facing `src/api/axios.js` instance, because admin and customer sessions use
// two different Sanctum guards/tokens (admin_token vs customer_token) and must never mix.
const adminApi = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/admin',
    headers: {
        Accept: 'application/json',
    },
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = localStorage.getItem('lang') || 'en';
    config.headers['Accept-Language'] = lang;

    return config;
});

// If the admin token is missing/expired, bounce back to the admin login screen automatically
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.startsWith('/admin/login')) {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default adminApi;
