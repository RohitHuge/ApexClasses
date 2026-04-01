import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as OrderModel from './order.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, 'products.json');
const getProductsConfig = () => JSON.parse(fs.readFileSync(productsPath, 'utf8'));

export const getAllProducts = async (req, res) => {
    try {
        const products = getProductsConfig();
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};



export const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await OrderModel.getOrdersByUserId(userId);
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Order History Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Order Details Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await OrderModel.getUserById(userId);
        if (!user) {
            // Create user if they exist in Appwrite but not locally
            const localUser = await OrderModel.getOrCreateUser({
                id: userId,
                name: req.user.name,
                email: req.user.email
            });
            return res.status(200).json({ success: true, user: localUser });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('User Profile Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { product_type, mode, metadata, user_id, productId } = req.body;
        
        // Secure Price Lookup
        const products = getProductsConfig();
        const productKey = productId || product_type; // productId preferred, fallback to type
        const product = products[productKey];

        if (!product) {
            return res.status(400).json({ success: false, error: 'Invalid product' });
        }

        const amount = product.price;

        // Sync phone from metadata if present
        if (user_id && metadata?.phone) {
            await OrderModel.updateUserPhone(user_id, metadata.phone);
        }
        
        const order = await OrderModel.createOrder({
            user_id: user_id || 'guest',
            product_type: product.type,
            mode: product.mode,
            amount: amount,
            metadata
        });

        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
