import express from 'express';
import { getOwnerDashboard } from '../controllers/ownerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireRole('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);

export default router;
