import API from '../axios';

export const fetchCategories = async () => {
    const response = await API.get('/categories');
    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const fetchCategoryById = async (id) => {
    const response = await API.get(`/categories/${id}`);
    return response.data?.data || response.data;
};