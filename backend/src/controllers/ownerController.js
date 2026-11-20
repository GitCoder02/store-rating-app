import pool from '../config/db.js';

export async function getOwnerDashboard(req, res) {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'rating', sortOrder = 'DESC' } = req.query;

    const [storeRows] = await pool.query(
      'SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (storeRows.length === 0) {
      return res.status(404).json({
        message: 'No store associated with this account',
        hasStore: false
      });
    }

    const store = storeRows[0];

    const [[{ averageRating, totalRatings }]] = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating), 1), 0) as averageRating, COUNT(*) as totalRatings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const allowedSortFields = ['user_name', 'user_email', 'rating', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'rating';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const orderClause =
      safeSortBy === 'user_name' ? 'u.name' :
      safeSortBy === 'user_email' ? 'u.email' :
      safeSortBy === 'rating' ? 'r.rating' : 'r.created_at';

    const [ratingUsers] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id as user_id, u.name as user_name, u.email as user_email, u.address as user_address
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY ${orderClause} ${safeSortOrder}`,
      [store.id]
    );

    res.json({
      hasStore: true,
      store: {
        ...store,
        averageRating,
        totalRatings
      },
      ratings: ratingUsers
    });
  } catch (error) {
    console.error('getOwnerDashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
