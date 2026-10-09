import express from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateRequest(updateProfileSchema), updateProfile);

export default router;

