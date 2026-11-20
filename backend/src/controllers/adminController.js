import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { validateUserInput, validateName, validateEmail, validateAddress } from '../utils/validation.js';

export async function getDashboardStats(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) as totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) as totalRatings FROM ratings');

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    const validation = validateUserInput({ name, email, password, address });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : (role === 'STORE_OWNER' ? 'STORE_OWNER' : 'NORMAL_USER');

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), assignedRole]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: assignedRole
      }
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUsers(req, res) {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             s.id as store_id, s.name as store_name,
             ROUND(AVG(r.rating), 1) as store_rating,
             COUNT(r.id) as store_ratings_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }
    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }
    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }
    if (role && role !== 'ALL') {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ` GROUP BY u.id, s.id ORDER BY u.${safeSortBy} ${safeSortOrder}`;

    const [rows] = await pool.query(query, params);
    res.json({ users: rows });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserDetails(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              s.id as store_id, s.name as store_name, s.address as store_address,
              ROUND(AVG(r.rating), 1) as store_rating,
              COUNT(r.id) as store_ratings_count
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = ?
       GROUP BY u.id, s.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('getUserDetails error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return res.status(400).json({ message: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ message: emailCheck.message });
    }

    const addressCheck = validateAddress(address);
    if (!addressCheck.isValid) {
      return res.status(400).json({ message: addressCheck.message });
    }

    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Store email already registered' });
    }

    let validOwnerId = null;
    if (ownerId) {
      const [ownerRows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (ownerRows.length > 0) {
        validOwnerId = ownerRows[0].id;
        await pool.query('UPDATE users SET role = ? WHERE id = ?', ['STORE_OWNER', validOwnerId]);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), validOwnerId]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId: validOwnerId
      }
    });
  } catch (error) {
    console.error('createStore error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getStores(req, res) {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'rating', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.id as owner_id, u.name as owner_name,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
             COUNT(r.id) as ratings_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    query += ` GROUP BY s.id, u.id ORDER BY ${safeSortBy === 'rating' ? 'rating' : `s.${safeSortBy}`} ${safeSortOrder}`;

    const [rows] = await pool.query(query, params);
    res.json({ stores: rows });
  } catch (error) {
    console.error('getStores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
