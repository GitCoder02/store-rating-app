import pool from '../config/db.js';

export async function listStoresForUser(req, res) {
  try {
    const userId = req.user.id;
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'address', 'overall_rating', 'user_rating'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(ROUND(AVG(all_r.rating), 1), 0) AS overall_rating,
             COUNT(DISTINCT all_r.id) AS total_ratings,
             my_r.rating AS user_rating
      FROM stores s
      LEFT JOIN ratings all_r ON all_r.store_id = s.id
      LEFT JOIN ratings my_r ON my_r.store_id = s.id AND my_r.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (search && search.trim()) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` GROUP BY s.id, my_r.rating ORDER BY ${safeSortBy === 'overall_rating' ? 'overall_rating' : (safeSortBy === 'user_rating' ? 'user_rating' : `s.${safeSortBy}`)} ${safeSortOrder}`;

    const [rows] = await pool.query(query, params);
    res.json({ stores: rows });
  } catch (error) {
    console.error('listStoresForUser error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
