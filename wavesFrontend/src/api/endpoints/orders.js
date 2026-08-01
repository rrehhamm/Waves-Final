import API from '../axios';

export const createOrder = async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
};

export const fetchUserOrders = async () => {
    const response = await API.get('/my-orders');
    return Array.isArray(response.data?.data) ? response.data.data : [];
};