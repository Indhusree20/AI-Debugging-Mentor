import express from 'express';
import { getAdminStatistics } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/statistics', protect, authorize('ADMIN'), getAdminStatistics);

export default router;
