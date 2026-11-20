import pool from '../config/db.js';
import { validateRating } from '../utils/validation.js';

export async function submitOrUpdateRating(req, res) {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    const ratingCheck = validateRating(rating);
    if (!ratingCheck.isValid) {
      return res.status(400).json({ message: ratingCheck.message });
    }

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, Number(rating)]
    );

    const [[{ averageRating, totalRatings }]] = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating), 1), 0) as averageRating, COUNT(*) as totalRatings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    res.json({
      message: 'Rating saved successfully',
      userRating: Number(rating),
      overallRating: averageRating,
      totalRatings
    });
  } catch (error) {
    console.error('submitOrUpdateRating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
