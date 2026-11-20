import express from 'express';
import { submitOrUpdateRating } from '../controllers/ratingController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole('NORMAL_USER'), submitOrUpdateRating);

export default router;
