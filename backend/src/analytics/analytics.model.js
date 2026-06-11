import { query } from '../db/db.js';

export const record = async (event, props) => {
    await query(
        `INSERT INTO analytics_events (event, props) VALUES ($1, $2)`,
        [event, props]
    );
};

export const summary = async () => {
    const res = await query(`
        SELECT event, DATE_TRUNC('hour', created_at) AS hour, COUNT(*) AS n
        FROM analytics_events
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY event, hour
        ORDER BY hour DESC, event ASC
    `);
    return res.rows;
};
