import mongoose from 'mongoose';
import { SUPPORTED_LANGUAGES, ERROR_TYPES, SEVERITY_LEVELS, CONFIDENCE_LEVELS, DEBUG_MODES } from '../config/constants.js';

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  actualOutput: { type: String, default: '' },
  passed: { type: Boolean, default: false },
  executionTimeMs: { type: Number, default: 0 },
  error: { type: String, default: null }
});

const StepGuidanceSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  targetLine: { type: Number, default: null },
  isCompleted: { type: Boolean, default: false }
});

const ProgressiveHintSchema = new mongoose.Schema({
  tier: { type: Number, required: true }, // 1, 2, or 3
  hint: { type: String, required: true },
  isRevealed: { type: Boolean, default: false }
});

const DebuggingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Debugging Session',
      trim: true,
    },
    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: Object.values(DEBUG_MODES),
      default: DEBUG_MODES.LEARN_MODE,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      default: null,
    },
    testCases: [TestCaseSchema],
    
    // Deterministic Layer Results
    deterministicAnalysis: {
      hasSyntaxError: { type: Boolean, default: false },
      syntaxErrors: [
        {
          line: Number,
          column: Number,
          message: String,
          rawOutput: String,
        },
      ],
      runtimeResult: {
        stdout: { type: String, default: '' },
        stderr: { type: String, default: '' },
        exitCode: { type: Number, default: 0 },
        executionTimeMs: { type: Number, default: 0 },
        timedOut: { type: Boolean, default: false },
        memoryUsageKb: { type: Number, default: 0 },
      },
      staticQuality: {
        score: { type: Number, default: 100 },
        issues: [
          {
            rule: String,
            line: Number,
            message: String,
            severity: String,
          },
        ],
      },
    },

    // AI Debugging Engine Output
    aiAnalysis: {
      summary: { type: String, default: '' },
      primaryErrorType: {
        type: String,
        enum: Object.values(ERROR_TYPES),
        default: ERROR_TYPES.NONE,
        index: true,
      },
      severity: {
        type: String,
        enum: Object.values(SEVERITY_LEVELS),
        default: SEVERITY_LEVELS.LOW,
      },
      confidence: {
        type: String,
        enum: Object.values(CONFIDENCE_LEVELS),
        default: CONFIDENCE_LEVELS.HIGH,
      },
      location: {
        line: { type: Number, default: null },
        column: { type: Number, default: null },
      },
      pedagogicalExplanation: {
        whatHappened: { type: String, default: '' },
        where: { type: String, default: '' },
        whyDidItHappen: { type: String, default: '' },
        howToFix: { type: String, default: '' },
        relatedConcept: { type: String, default: '' },
      },
      suggestedFix: {
        isGuaranteed: { type: Boolean, default: true },
        correctedCode: { type: String, default: '' },
        diffDescription: { type: String, default: '' },
      },
      stepByStepGuidance: [StepGuidanceSchema],
      progressiveHints: [ProgressiveHintSchema],
      codeQuality: {
        score: { type: Number, default: 100 },
        suggestions: [{ type: String }],
      },
      preventionTip: { type: String, default: '' },
      relatedConcepts: [{ type: String }],
    },

    status: {
      type: String,
      enum: ['ANALYZED', 'FIXED', 'IN_PROGRESS'],
      default: 'ANALYZED',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

DebuggingSessionSchema.index({ userId: 1, createdAt: -1 });

export const DebuggingSession = mongoose.model('DebuggingSession', DebuggingSessionSchema);
