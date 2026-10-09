import express from 'express';
import {
  runCode,
  analyzeCode,
  runTestCases,
  getHistory,
  getSessionById,
  deleteSession,
  updateSessionStatus,
} from '../controllers/debugController.js';
import { protect } from '../middleware/authMiddleware.js';
import { debugLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/run', debugLimiter, runCode);
router.post('/analyze', protect, debugLimiter, analyzeCode);
router.post('/test', protect, debugLimiter, runTestCases);
router.post('/test-cases', protect, debugLimiter, runTestCases);
router.get('/history', protect, getHistory);
router.get('/history/:id', protect, getSessionById);
router.delete('/history/:id', protect, deleteSession);
router.get('/session/:id', protect, getSessionById);
router.delete('/session/:id', protect, deleteSession);
router.patch('/session/:id/status', protect, updateSessionStatus);

export default router;

