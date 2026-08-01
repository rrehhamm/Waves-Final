import axios from 'axios';

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

adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const hadToken = !!error.config?.headers?.Authorization;
        const onLoginPage = window.location.pathname.startsWith('/admin/login');

        if (error.response?.status === 401 && hadToken && !onLoginPage) {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login?expired=1';
        }
        return Promise.reject(error);
    }
);

export default adminApi;
