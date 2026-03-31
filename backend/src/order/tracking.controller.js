import { query } from '../db/db.js';

export const getOrderTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const res_tracking = await query('SELECT * FROM order_tracking WHERE order_id = $1 ORDER BY timestamp DESC', [id]);
        
        res.status(200).json({ success: true, tracking: res_tracking.rows });
    } catch (error) {
        console.error('Get Tracking Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
