import mongoose from 'mongoose';

const exampleCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const hiddenTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
}, { _id: false });

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
      index: true,
    },
    topic: {
      type: String,
      enum: ['Basic Mathematics', 'Conditions', 'Loops', 'Number Theory', 'Arrays', 'Strings'],
      required: true,
      index: true,
    },
    statement: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: { type: String, default: '' },
    exampleCases: [exampleCaseSchema],
    hiddenTestCases: [hiddenTestCaseSchema],
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    supportedLanguages: {
      type: [String],
      default: ['python', 'java', 'c', 'cpp', 'javascript'],
    },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Problem = mongoose.model('Problem', problemSchema);
