import { Router } from 'express';
import { practiceController } from '../controllers/practiceController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = Router();

// Problem listing & details (optional auth to compute isSolved/isAttempted)
router.get('/problems', optionalProtect, practiceController.getProblems);
router.get('/problems/:slug', optionalProtect, practiceController.getProblemBySlug);

// Run code against sample tests (no login strictly required, but benefits from it)
router.post('/problems/:slug/run', optionalProtect, practiceController.runCode);

// Submit code against all tests & record progress (Login strictly required)
router.post('/problems/:slug/submit', protect, practiceController.submitCode);

// User progress & submissions (Login strictly required)
router.get('/progress', optionalProtect, practiceController.getProgress);
router.get('/submissions', protect, practiceController.getSubmissions);

export default router;
