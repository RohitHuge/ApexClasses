import { query } from '../db/db.js';

export const createSlot = async ({ product_id, slot_time, capacity, notes }) => {
    const res = await query(
        `INSERT INTO slots (product_id, slot_time, capacity, notes)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [product_id, slot_time, capacity || 1, notes || null]
    );
    return res.rows[0];
};

export const getAvailableSlots = async (product_id) => {
    const res = await query(
        `SELECT * FROM slots
         WHERE product_id = $1
           AND is_active = true
           AND booked < capacity
           AND slot_time > NOW()
         ORDER BY slot_time ASC`,
        [product_id]
    );
    return res.rows;
};

export const getAllSlotsAdmin = async (product_id) => {
    const base = `SELECT s.*,
                    (SELECT COUNT(*) FROM orders o WHERE o.slot_id = s.id AND o.status = 'SUCCESS') as confirmed_bookings
                  FROM slots s`;
    if (product_id) {
        const res = await query(`${base} WHERE s.product_id = $1 ORDER BY s.slot_time DESC`, [product_id]);
        return res.rows;
    }
    const res = await query(`${base} ORDER BY s.slot_time DESC`);
    return res.rows;
};

// Atomic booking — returns null if slot is full or inactive
export const bookSlot = async (slotId) => {
    const res = await query(
        `UPDATE slots
         SET booked = booked + 1
         WHERE id = $1 AND is_active = true AND booked < capacity
         RETURNING *`,
        [slotId]
    );
    return res.rows[0] || null;
};

export const releaseSlot = async (slotId) => {
    await query(
        `UPDATE slots SET booked = GREATEST(0, booked - 1) WHERE id = $1`,
        [slotId]
    );
};

export const updateSlot = async (slotId, { capacity, is_active, notes, slot_time }) => {
    const res = await query(
        `UPDATE slots
         SET capacity = COALESCE($2, capacity),
             is_active = COALESCE($3, is_active),
             notes = COALESCE($4, notes),
             slot_time = COALESCE($5, slot_time)
         WHERE id = $1 RETURNING *`,
        [slotId, capacity, is_active, notes, slot_time]
    );
    return res.rows[0];
};

export const deleteSlot = async (slotId) => {
    await query(`UPDATE slots SET is_active = false WHERE id = $1`, [slotId]);
};
