import { io } from 'socket.io-client';
import { apiFetch, getStoredToken } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const orderService = {
    getProducts: async () => {
        const res = await fetch(`${API_BASE}/orders/products`);
        return res.json();
    },

    getUserProfile: async () => {
        const res = await apiFetch(`${API_BASE}/orders/user/profile`);
        return res.json();
    },

    createOrder: async (orderData) => {
        const res = await apiFetch(`${API_BASE}/orders/create`, {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
        return res.json();
    },

    createPaymentOrder: async (orderId) => {
        const res = await apiFetch(`${API_BASE}/orders/payment/create`, {
            method: 'POST',
            body: JSON.stringify({ orderId }),
        });
        return res.json();
    },

    getSocket: () => {
        const token = getStoredToken();
        return io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });
    },

    getOrderHistory: async () => {
        const res = await apiFetch(`${API_BASE}/orders`);
        return res.json();
    },

    getOrderDetails: async (orderId) => {
        const res = await apiFetch(`${API_BASE}/orders/${orderId}`);
        return res.json();
    },

    getOrderTracking: async (orderId) => {
        const res = await apiFetch(`${API_BASE}/orders/${orderId}/tracking`);
        return res.json();
    },

    verifyPaymentStatus: async (orderId) => {
        const res = await apiFetch(`${API_BASE}/orders/${orderId}/verify-payment`, {
            method: 'POST',
        });
        return res.json();
    },

    getAvailableSlots: async (productId) => {
        const res = await apiFetch(`${API_BASE}/slots?productId=${productId}`);
        return res.json();
    },

    // ADMIN
    getAdminStats: async () => {
        const res = await apiFetch(`${API_BASE}/orders/admin/stats`);
        return res.json();
    },

    getAdminOrders: async (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        const res = await apiFetch(`${API_BASE}/orders/admin/all-orders?${qs}`);
        return res.json();
    },

    updateDeliveryStatus: async (orderId, status, trackingInfo) => {
        const res = await apiFetch(`${API_BASE}/orders/admin/update-delivery`, {
            method: 'PATCH',
            body: JSON.stringify({ orderId, status, trackingInfo }),
        });
        return res.json();
    },

    getAdminUsers: async () => {
        const res = await apiFetch(`${API_BASE}/orders/admin/users`);
        return res.json();
    },

    updateUserRole: async (userId, role) => {
        const res = await apiFetch(`${API_BASE}/orders/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
        return res.json();
    },

    sendMigrationEmails: async () => {
        const res = await apiFetch(`${API_BASE}/orders/admin/send-migration-emails`, {
            method: 'POST',
        });
        return res.json();
    },

    getAdminSlots: async (productId) => {
        const qs = productId ? `?productId=${productId}` : '';
        const res = await apiFetch(`${API_BASE}/slots/admin${qs}`);
        return res.json();
    },

    createSlot: async (slotData) => {
        const res = await apiFetch(`${API_BASE}/slots/admin`, {
            method: 'POST',
            body: JSON.stringify(slotData),
        });
        return res.json();
    },

    updateSlot: async (slotId, data) => {
        const res = await apiFetch(`${API_BASE}/slots/admin/${slotId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteSlot: async (slotId) => {
        const res = await apiFetch(`${API_BASE}/slots/admin/${slotId}`, {
            method: 'DELETE',
        });
        return res.json();
    },
};
