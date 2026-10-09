import { z } from 'zod';
import { ERROR_TYPES, SEVERITY_LEVELS, CONFIDENCE_LEVELS, ERROR_SOURCES } from '../../config/constants.js';

export const IssueZodSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  type: z.enum(Object.values(ERROR_TYPES)).default(ERROR_TYPES.SYNTAX_ERROR),
  severity: z.enum(Object.values(SEVERITY_LEVELS)).default(SEVERITY_LEVELS.HIGH),
  line: z.number().nullable().optional(),
  column: z.number().nullable().optional(),
  message: z.string().default(''),
  explanation: z.string().default(''),
  cause: z.string().default(''),
  suggestion: z.string().default(''),
  correctedCode: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.95),
  source: z.enum(Object.values(ERROR_SOURCES)).default(ERROR_SOURCES.AI_ANALYSIS),
});

export const DebuggingResponseZodSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  primaryErrorType: z.enum(Object.values(ERROR_TYPES)).default(ERROR_TYPES.NONE),
  severity: z.enum(Object.values(SEVERITY_LEVELS)).default(SEVERITY_LEVELS.LOW),
  confidence: z.enum(Object.values(CONFIDENCE_LEVELS)).default(CONFIDENCE_LEVELS.HIGH),
  location: z.object({
    line: z.number().nullable().optional(),
    column: z.number().nullable().optional(),
  }).default({}),
  issues: z.array(IssueZodSchema).default([]),
  pedagogicalExplanation: z.object({
    whatHappened: z.string().default(''),
    where: z.string().default(''),
    whyDidItHappen: z.string().default(''),
    howToFix: z.string().default(''),
    relatedConcept: z.string().default(''),
  }).default({}),
  suggestedFix: z.object({
    isGuaranteed: z.boolean().default(true),
    correctedCode: z.string().default(''),
    diffDescription: z.string().default(''),
  }).default({}),
  stepByStepGuidance: z.array(
    z.object({
      stepNumber: z.number(),
      instruction: z.string(),
      targetLine: z.number().nullable().optional(),
      isCompleted: z.boolean().default(false),
    })
  ).default([]),
  progressiveHints: z.array(
    z.object({
      tier: z.number(),
      hint: z.string(),
      isRevealed: z.boolean().default(false),
    })
  ).default([]),
  codeQuality: z.object({
    score: z.number().min(0).max(100).default(100),
    suggestions: z.array(z.string()).default([]),
  }).default({ score: 100, suggestions: [] }),
  preventionTip: z.string().default(''),
  relatedConcepts: z.array(z.string()).default([]),
});

