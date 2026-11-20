import express from 'express';
import { listStoresForUser } from '../controllers/storeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, listStoresForUser);

export default router;
