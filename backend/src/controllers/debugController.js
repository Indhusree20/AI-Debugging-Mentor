import { analyzerService } from '../services/analyzerService.js';
import { DebuggingSession } from '../models/DebuggingSession.js';
import { LearningAnalytics } from '../models/LearningAnalytics.js';
import { recommendationService } from '../services/recommendationService.js';
import { sandboxManager } from '../sandbox/SandboxManager.js';

export async function runCode(req, res, next) {
  try {
    const { language, stdin, timeoutMs } = req.body;
    const sourceCode = req.body.sourceCode || req.body.code || '';
    const result = await analyzerService.runCodeOnly({
      language,
      sourceCode,
      stdin,
      timeoutMs,
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
}

export async function analyzeCode(req, res, next) {
  try {
    const {
      language,
      title,
      mode,
      expectedOutput,
      testCases,
      filenameHint,
    } = req.body;
    const sourceCode = req.body.sourceCode || req.body.code || '';

    if (!sourceCode.trim()) {
      return res.status(400).json({
        success: false,
        status: 'EMPTY_INPUT',
        message: 'Source code cannot be empty.',
      });
    }

    const userExperience = req.user?.experienceLevel || 'BEGINNER';

    // Step 1: Run complete multi-stage analysis pipeline with automatic language detection
    const analysisResult = await analyzerService.analyzeCode({
      language,
      sourceCode,
      experienceLevel: userExperience,
      mode: mode || 'LEARN_MODE',
      expectedOutput,
      filenameHint,
    });

    const {
      deterministicAnalysis,
      aiAnalysis,
      durationMs,
      targetLanguage,
      errors,
      summary,
    } = analysisResult;

    // Step 2: If test cases were provided, evaluate them
    const evaluatedTestCases = [];
    if (Array.isArray(testCases) && testCases.length > 0) {
      for (const tc of testCases) {
        try {
          const runRes = await sandboxManager.execute({
            language: targetLanguage,
            sourceCode,
            stdin: tc.input || '',
            timeoutMs: 3000,
          });
          const actualClean = (runRes.stdout || '').trim();
          const expectedClean = (tc.expectedOutput || '').trim();
          const passed = actualClean === expectedClean && runRes.exitCode === 0;

          evaluatedTestCases.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: runRes.stdout,
            passed,
            executionTimeMs: runRes.executionTimeMs,
            error: runRes.stderr || null,
          });
        } catch (err) {
          evaluatedTestCases.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            passed: false,
            executionTimeMs: 0,
            error: err.message,
          });
        }
      }
    }

    // Step 3: Save Debugging Session to MongoDB
    const session = await DebuggingSession.create({
      userId: req.user._id,
      title: title || `${targetLanguage.toUpperCase()} Debugging Session`,
      language: targetLanguage,
      mode: mode || 'LEARN_MODE',
      sourceCode,
      expectedOutput: expectedOutput || null,
      testCases: evaluatedTestCases,
      deterministicAnalysis,
      aiAnalysis,
      status: 'ANALYZED',
      durationMs,
    });

    // Step 4: Update user learning analytics asynchronously
    try {
      const analytics = await LearningAnalytics.findOne({ userId: req.user._id });
      if (analytics) {
        analytics.totalSessions += 1;
        analytics.languageBreakdown[targetLanguage] = (analytics.languageBreakdown[targetLanguage] || 0) + 1;

        if (aiAnalysis.primaryErrorType && aiAnalysis.primaryErrorType !== 'NONE') {
          analytics.errorsDetected += 1;
          analytics.errorTypeFrequency[aiAnalysis.primaryErrorType] =
            (analytics.errorTypeFrequency[aiAnalysis.primaryErrorType] || 0) + 1;
        }

        analytics.successRate = Math.round(
          ((analytics.errorsFixed + (aiAnalysis.primaryErrorType === 'NONE' ? 1 : 0)) /
            analytics.totalSessions) * 100
        );
        analytics.lastActive = new Date();
        await analytics.save();

        await recommendationService.updateRecommendationsForUser(req.user._id);
      }
    } catch (analyticsErr) {
      console.error('[DebugController] Analytics update error:', analyticsErr);
    }

    res.status(200).json({
      success: true,
      status: 'COMPLETED',
      language: analysisResult.language,
      analysis: analysisResult.analysis,
      errors: analysisResult.errors,
      summary: analysisResult.summary,
      sessionId: session._id,
      session,
    });
  } catch (error) {
    next(error);
  }
}


export async function runTestCases(req, res, next) {
  try {
    const { language, sourceCode, testCases } = req.body;
    if (!Array.isArray(testCases)) {
      return res.status(400).json({ success: false, message: 'Test cases must be an array.' });
    }

    const results = [];
    for (const tc of testCases) {
      const runRes = await sandboxManager.execute({
        language,
        sourceCode,
        stdin: tc.input || '',
        timeoutMs: 3000,
      });

      const actualClean = (runRes.stdout || '').trim();
      const expectedClean = (tc.expectedOutput || '').trim();
      const passed = actualClean === expectedClean && runRes.exitCode === 0;

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: runRes.stdout,
        passed,
        executionTimeMs: runRes.executionTimeMs,
        error: runRes.stderr || null,
      });
    }

    res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const { language, errorType, page = 1, limit = 10, search } = req.query;

    const query = { userId: req.user._id };
    if (language) query.language = language;
    if (errorType) query['aiAnalysis.primaryErrorType'] = errorType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sourceCode: { $regex: search, $options: 'i' } },
        { 'aiAnalysis.summary': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await DebuggingSession.countDocuments(query);
    const sessions = await DebuggingSession.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .select('title language mode status createdAt aiAnalysis.primaryErrorType aiAnalysis.summary aiAnalysis.severity durationMs');

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSessionById(req, res, next) {
  try {
    const session = await DebuggingSession.findOne({
      _id: req.params.id,
      userId: req.user._id, // User data isolation
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Debugging session not found.' });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const session = await DebuggingSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Debugging session not found.' });
    }

    res.status(200).json({ success: true, message: 'Session deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionStatus(req, res, next) {
  try {
    const { status } = req.body;
    const session = await DebuggingSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = status;
    await session.save();

    if (status === 'FIXED') {
      await LearningAnalytics.updateOne(
        { userId: req.user._id },
        { $inc: { errorsFixed: 1 } }
      );
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
}
