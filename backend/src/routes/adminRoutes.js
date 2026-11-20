import express from 'express';
import {
  getDashboardStats,
  createUser,
  getUsers,
  getUserDetails,
  createStore,
  getStores
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireRole('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserDetails);
router.get('/stores', getStores);
router.post('/stores', createStore);

export default router;
