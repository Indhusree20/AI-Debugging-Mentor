import { PracticeService } from '../services/practiceService.js';

export const practiceController = {
  /**
   * GET /api/practice/problems
   * Fetch all practice problems with optional filters
   */
  async getProblems(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const { difficulty, topic, language, search } = req.query;

      const problems = await PracticeService.getProblems(userId, {
        difficulty,
        topic,
        language,
        search,
      });

      res.status(200).json({
        success: true,
        count: problems.length,
        problems,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/practice/problems/:slug
   * Fetch single problem details
   */
  async getProblemBySlug(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const { slug } = req.params;

      const problem = await PracticeService.getProblemBySlug(slug, userId);
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: `Problem with slug "${slug}" not found.`,
        });
      }

      res.status(200).json({
        success: true,
        problem,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/practice/problems/:slug/run
   * Run user code against visible sample cases
   */
  async runCode(req, res, next) {
    try {
      const { slug } = req.params;
      const { language, sourceCode } = req.body;

      if (!language || !sourceCode) {
        return res.status(400).json({
          success: false,
          message: 'Both language and sourceCode are required.',
        });
      }

      const result = await PracticeService.runCode(slug, { language, sourceCode });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error('[practiceController.runCode ERROR]:', err);
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },

  /**
   * POST /api/practice/problems/:slug/submit
   * Submit code against full test suite (Protected)
   */
  async submitCode(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const { slug } = req.params;
      const { language, sourceCode } = req.body;

      if (!language || !sourceCode) {
        return res.status(400).json({
          success: false,
          message: 'Both language and sourceCode are required.',
        });
      }

      const result = await PracticeService.submitCode(userId, slug, { language, sourceCode });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error('[practiceController.submitCode ERROR]:', err);
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },

  /**
   * GET /api/practice/progress
   * Get user's practice progress summary (Protected)
   */
  async getProgress(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const progress = await PracticeService.getProgress(userId);

      res.status(200).json({
        success: true,
        progress,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/practice/submissions
   * Get submissions for user (Protected)
   */
  async getSubmissions(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const { slug, limit } = req.query;

      const submissions = await PracticeService.getSubmissions(userId, {
        problemSlug: slug,
        limit: limit ? parseInt(limit, 10) : 20,
      });

      res.status(200).json({
        success: true,
        submissions,
      });
    } catch (err) {
      next(err);
    }
  },
};
