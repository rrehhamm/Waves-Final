import API from '../axios';

export const submitContactForm = async (formData) => {
    const response = await API.post('/contact-us', formData);
    return response.data;
};