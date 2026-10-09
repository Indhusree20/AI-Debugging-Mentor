import express from 'express';
import { chatWithMentor, getProgressiveHint } from '../controllers/mentorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { debugLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/chat', protect, debugLimiter, chatWithMentor);
router.post('/hint', protect, debugLimiter, getProgressiveHint);

export default router;
