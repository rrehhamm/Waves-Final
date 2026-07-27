import API from '../axios';

/**
 * Submit / Create a new order
 * @param {Object} orderData Order details (items, shipping_address, payment_method, etc.)
 */
export const createOrder = async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
};

/**
 * Fetch past orders for the authenticated user (Profile page order history)
 * Matches backend GET /my-orders (auth:user) - NOT /orders (that's admin-only)
 */
export const fetchUserOrders = async () => {
    const response = await API.get('/my-orders');
    return Array.isArray(response.data?.data) ? response.data.data : [];
};