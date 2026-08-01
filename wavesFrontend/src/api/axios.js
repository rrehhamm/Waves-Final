import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json',
    },
});

API.interceptors.request.use((config) => {
    const token =
        localStorage.getItem('customer_token') ||
        sessionStorage.getItem('customer_token') ||
        localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = localStorage.getItem('lang') || 'en';
    config.headers['Accept-Language'] = lang;

    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const hadToken = !!error.config?.headers?.Authorization;
        const onAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/signup');

        if (error.response?.status === 401 && hadToken && !onAuthPage) {
            localStorage.removeItem('customer_token');
            sessionStorage.removeItem('customer_token');
            window.location.href = '/login?expired=1';
        }

        return Promise.reject(error);
    }
);

export default API;