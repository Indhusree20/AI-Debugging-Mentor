import { User } from '../models/User.js';
import { DebuggingSession } from '../models/DebuggingSession.js';
import { LearningAnalytics } from '../models/LearningAnalytics.js';

export async function getAdminStatistics(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await DebuggingSession.countDocuments();
    
    // Privacy safe aggregates - counts only, NO source code
    const sessionsByLanguage = await DebuggingSession.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const errorTypeFrequency = await DebuggingSession.aggregate([
      { $match: { 'aiAnalysis.primaryErrorType': { $ne: 'NONE' } } },
      { $group: { _id: '$aiAnalysis.primaryErrorType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const sessionsByMode = await DebuggingSession.aggregate([
      { $group: { _id: '$mode', count: { $sum: 1 } } },
    ]);

    const experienceBreakdown = await User.aggregate([
      { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
    ]);

    const activeUsers24h = await LearningAnalytics.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers24h,
        totalSessions,
        sessionsByLanguage,
        errorTypeFrequency,
        sessionsByMode,
        experienceBreakdown,
        privacyNote: 'User source code is strictly protected and excluded from administration aggregates.',
      },
    });
  } catch (error) {
    next(error);
  }
}
