import { aiService } from '../ai/AIService.js';
import { DebuggingSession } from '../models/DebuggingSession.js';

export async function chatWithMentor(req, res, next) {
  try {
    const { sessionId, language, sourceCode, userMessage, chatHistory } = req.body;

    let activeSummary = null;
    if (sessionId) {
      const session = await DebuggingSession.findOne({ _id: sessionId, userId: req.user._id });
      if (session) {
        activeSummary = session.aiAnalysis;
      }
    }

    const responseText = await aiService.mentorChat({
      language: language || 'python',
      sourceCode: sourceCode || '',
      debuggingSummary: activeSummary,
      chatHistory: chatHistory || [],
      userMessage,
      experienceLevel: req.user.experienceLevel || 'BEGINNER',
    });

    res.status(200).json({
      success: true,
      message: responseText,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProgressiveHint(req, res, next) {
  try {
    const { sessionId, tier } = req.body;
    const session = await DebuggingSession.findOne({ _id: sessionId, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Debugging session not found.' });
    }

    const hints = session.aiAnalysis?.progressiveHints || [];
    const targetHint = hints.find(h => h.tier === parseInt(tier, 10)) || hints[0];

    if (!targetHint) {
      return res.status(200).json({
        success: true,
        hint: {
          tier: tier || 1,
          hint: 'Review the line markers and verify operator logic.',
        },
      });
    }

    res.status(200).json({
      success: true,
      hint: targetHint,
    });
  } catch (error) {
    next(error);
  }
}
