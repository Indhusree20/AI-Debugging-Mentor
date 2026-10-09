import { LearningAnalytics } from '../models/LearningAnalytics.js';
import { DebuggingSession } from '../models/DebuggingSession.js';
import { Recommendation } from '../models/Recommendation.js';
import { Submission } from '../models/Submission.js';

export async function getDashboardAnalytics(req, res, next) {
  try {
    let analytics = await LearningAnalytics.findOne({ userId: req.user._id });

    if (!analytics) {
      analytics = await LearningAnalytics.create({
        userId: req.user._id,
      });
    }

    const recentSessions = await DebuggingSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title language mode status createdAt aiAnalysis.primaryErrorType aiAnalysis.summary');

    const recommendations = await Recommendation.find({
      userId: req.user._id,
      isCompleted: false,
    }).limit(3);

    // Compute real practice metrics from Submission collection
    const attemptedProblems = await Submission.distinct('problemId', { userId: req.user._id });
    const solvedProblems = await Submission.distinct('problemId', { userId: req.user._id, status: 'Accepted' });

    // Compute error breakdown array for charts
    const errorTypeChartData = Object.entries(analytics.errorTypeFrequency || {})
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: type.replace('_', ' '),
        value: count,
      }));

    // Compute language breakdown array
    const languageChartData = Object.entries(analytics.languageBreakdown || {})
      .map(([lang, count]) => ({
        language: lang.toUpperCase(),
        count,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalSessions: analytics.totalSessions,
        errorsDetected: analytics.errorsDetected,
        errorsFixed: analytics.errorsFixed,
        problemsAttempted: attemptedProblems.length,
        problemsSolved: solvedProblems.length,
        successRate: analytics.successRate,
        recentSessions,
        recommendations,
        errorTypeChartData,
        languageChartData,
        masteryScores: analytics.masteryScores || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const recommendations = await Recommendation.find({ userId: req.user._id })
      .sort({ isCompleted: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeRecommendation(req, res, next) {
  try {
    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isCompleted: true },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found.' });
    }

    res.status(200).json({ success: true, recommendation });
  } catch (error) {
    next(error);
  }
}
