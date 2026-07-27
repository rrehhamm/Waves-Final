import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Laravel backend Base URL
    headers: {
        // Deliberately NOT setting a default Content-Type here: axios auto-picks
        // "application/json" for plain objects and "multipart/form-data" (with the right
        // boundary) for FormData bodies. Forcing "application/json" globally used to break
        // the profile picture upload (POST /profile, multipart/form-data).
        'Accept': 'application/json',
    },
});

// Interceptor to inject Token and Language dynamically
API.interceptors.request.use((config) => {
    // Use customer token for public/customer routes, admin token for admin routes.
    // Remember Me controls whether the customer token lives in localStorage (persists across
    // browser restarts) or sessionStorage (cleared when the tab/browser closes) - check both.
    const token =
        localStorage.getItem('customer_token') ||
        sessionStorage.getItem('customer_token') ||
        localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; //
    }

    // Language header (ar or en)
    const lang = localStorage.getItem('lang') || 'en';
    config.headers['Accept-Language'] = lang; //

    return config;
});

export default API;