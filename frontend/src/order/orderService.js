import { io } from 'socket.io-client';
import { createJWT } from '../utils/appwrite';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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

    getUserProfile: async (userId) => {
        const headers = await getHeaders(userId);
        const response = await fetch(`${API_BASE_URL}/orders/user/profile`, {
            headers: headers
        });
        return response.json();
    },

    createOrder: async (orderData) => {
        const headers = await getHeaders(orderData.user_id);
        const response = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(orderData),
        });
        return await response.json();
    },

    createPaymentOrder: async (orderId, userId) => {
        const headers = await getHeaders(userId);
        const response = await fetch(`${API_BASE_URL}/orders/payment/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ orderId }),
        });
        return response.json();
    },

    getSocket: async (userId) => {
        const jwt = await createJWT();
        return io(SOCKET_URL, {
            auth: {
                token: jwt,
                userId: userId
            },
            transports: ['websocket']
        });
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
