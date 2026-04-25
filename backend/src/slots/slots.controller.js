import * as SlotsModel from './slots.model.js';

export const getAvailableSlots = async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) return res.status(400).json({ error: 'productId is required' });
        const slots = await SlotsModel.getAvailableSlots(productId);
        res.json({ success: true, slots });
    } catch (err) {
        console.error('Get slots error:', err.message);
        res.status(500).json({ error: 'Failed to fetch slots' });
    }
};

export const adminGetAllSlots = async (req, res) => {
    try {
        const { productId } = req.query;
        const slots = await SlotsModel.getAllSlotsAdmin(productId);
        res.json({ success: true, slots });
    } catch (err) {
        console.error('Admin get slots error:', err.message);
        res.status(500).json({ error: 'Failed to fetch slots' });
    }
};

export const adminCreateSlot = async (req, res) => {
    try {
        const { product_id, slot_time, capacity, notes } = req.body;
        if (!product_id || !slot_time) {
            return res.status(400).json({ error: 'product_id and slot_time are required' });
        }
        const slot = await SlotsModel.createSlot({ product_id, slot_time, capacity, notes });
        res.status(201).json({ success: true, slot });
    } catch (err) {
        console.error('Admin create slot error:', err.message);
        res.status(500).json({ error: 'Failed to create slot' });
    }
};

export const adminUpdateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity, is_active, notes, slot_time } = req.body;
        const slot = await SlotsModel.updateSlot(id, { capacity, is_active, notes, slot_time });
        if (!slot) return res.status(404).json({ error: 'Slot not found' });
        res.json({ success: true, slot });
    } catch (err) {
        console.error('Admin update slot error:', err.message);
        res.status(500).json({ error: 'Failed to update slot' });
    }
};

export const adminDeleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        await SlotsModel.deleteSlot(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Admin delete slot error:', err.message);
        res.status(500).json({ error: 'Failed to deactivate slot' });
    }
};
