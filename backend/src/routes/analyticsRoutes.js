import express from 'express';
import {
  getDashboardAnalytics,
  getRecommendations,
  completeRecommendation,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/recommendations', protect, getRecommendations);
router.patch('/recommendations/:id/complete', protect, completeRecommendation);

export default router;
