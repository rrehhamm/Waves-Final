import API from '../axios';

export const fetchGallery = async () => {
    const response = await API.get('/gallery');
    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const fetchGalleryItemById = async (id) => {
    const response = await API.get(`/gallery/${id}`);
    return response.data?.data || response.data;
};