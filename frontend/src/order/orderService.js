import { createJWT } from '../utils/appwrite';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = async (userId = null) => {
    const jwt = await createJWT();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }
    if (userId) {
        headers['x-user-id'] = userId;
    }
    return headers;
};

export const orderService = {
    getProducts: async () => {
        const response = await fetch(`${API_BASE_URL}/orders/products`);
        return await response.json();
    },

    createOrder: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        return await response.json();
    },

    createPayment: async (orderId, userId) => {
        const headers = await getHeaders(userId);
        const response = await fetch(`${API_BASE_URL}/orders/payment/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ order_id: orderId }),
        });
        return response.json();
    },

    verifyPayment: async (paymentData, userId) => {
        const headers = await getHeaders(userId);
        const response = await fetch(`${API_BASE_URL}/orders/payment/verify`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(paymentData),
        });
        return response.json();
    },

    getOrderHistory: async (userId) => {
        const headers = await getHeaders(userId);
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: headers,
        });
        return response.json();
    },

    getOrderDetails: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        return response.json();
    },

    getOrderTracking: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking`);
        return response.json();
    }
};
