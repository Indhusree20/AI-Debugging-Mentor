import mongoose from 'mongoose';
import { SUPPORTED_LANGUAGES, ERROR_TYPES } from '../config/constants.js';

const LearningAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalSessions: { type: Number, default: 0 },
    errorsDetected: { type: Number, default: 0 },
    errorsFixed: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }, // 0 - 100%
    
    languageBreakdown: {
      python: { type: Number, default: 0 },
      java: { type: Number, default: 0 },
      c: { type: Number, default: 0 },
      cpp: { type: Number, default: 0 },
    },

    errorTypeFrequency: {
      SYNTAX_ERROR: { type: Number, default: 0 },
      LOGICAL_ERROR: { type: Number, default: 0 },
      RUNTIME_ERROR: { type: Number, default: 0 },
      TYPE_ERROR: { type: Number, default: 0 },
      COMPILATION_ERROR: { type: Number, default: 0 },
      IMPORT_ERROR: { type: Number, default: 0 },
      NAME_ERROR: { type: Number, default: 0 },
      INDEX_ERROR: { type: Number, default: 0 },
      NULL_REFERENCE: { type: Number, default: 0 },
      INFINITE_LOOP: { type: Number, default: 0 },
      PERFORMANCE_ISSUE: { type: Number, default: 0 },
      CODE_QUALITY_ISSUE: { type: Number, default: 0 },
    },

    repeatedMistakes: [
      {
        concept: String,
        count: Number,
        lastOccurred: Date,
      },
    ],

    masteryScores: [
      {
        topic: String,
        score: { type: Number, min: 0, max: 100, default: 50 },
      },
    ],

    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const LearningAnalytics = mongoose.model('LearningAnalytics', LearningAnalyticsSchema);
