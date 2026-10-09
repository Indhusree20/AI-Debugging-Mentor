import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    problemSlug: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['python', 'java', 'c', 'cpp', 'javascript'],
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Compilation Error',
        'Runtime Error',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Internal Error',
      ],
      required: true,
      index: true,
    },
    passedTestCases: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      required: true,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    memoryUsageKb: {
      type: Number,
      default: 0,
    },
    diagnostics: [
      {
        type: { type: String },
        message: { type: String },
        line: { type: Number },
        column: { type: Number },
        explanation: { type: String },
        severity: { type: String },
      },
    ],
    sampleResults: [
      {
        testCaseIndex: { type: Number },
        input: { type: String },
        expectedOutput: { type: String },
        actualOutput: { type: String },
        passed: { type: Boolean },
        executionTimeMs: { type: Number },
        error: { type: String },
      },
    ],
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, problemId: 1, status: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
