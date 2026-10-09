import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['ARRAYS', 'LOOPS', 'POINTERS_REFERENCES', 'TYPES_CONVERSIONS', 'CONDITIONALS', 'RECURSION', 'SYNTAX_BASICS'],
      default: 'SYNTAX_BASICS',
    },
    reason: {
      type: String,
      required: true,
    },
    recommendedAction: {
      type: String,
      required: true,
    },
    samplePracticeProblem: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      language: { type: String, default: 'python' },
      starterCode: { type: String, default: '' },
      expectedOutput: { type: String, default: '' },
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RecommendationSchema.index({ userId: 1, isCompleted: 1 });

export const Recommendation = mongoose.model('Recommendation', RecommendationSchema);
