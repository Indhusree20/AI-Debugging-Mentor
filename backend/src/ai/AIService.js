import { GeminiProvider } from './providers/GeminiProvider.js';
import { HeuristicAIProvider } from './providers/HeuristicAIProvider.js';
import { buildDebuggingPrompt, buildMentorChatPrompt } from './prompts/systemPrompts.js';
import { DebuggingResponseZodSchema } from './schemas/debuggingResponseSchema.js';
import { config } from '../config/index.js';

export class AIService {
  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.heuristicProvider = new HeuristicAIProvider();
  }

  getPrimaryProvider() {
    if (config.defaultAiProvider === 'gemini' && this.geminiProvider.isConfigured()) {
      return this.geminiProvider;
    }
    return this.heuristicProvider;
  }

  async analyzeCode({
    language,
    sourceCode,
    experienceLevel = 'BEGINNER',
    mode = 'LEARN_MODE',
    expectedOutput = null,
    deterministicAnalysis = {},
  }) {
    const prompt = buildDebuggingPrompt({
      language,
      sourceCode,
      experienceLevel,
      mode,
      expectedOutput,
      deterministicAnalysis,
    });

    const provider = this.getPrimaryProvider();

    try {
      const rawResponse = await provider.generateDebuggingAnalysis(prompt);
      
      // Clean possible markdown code fence wrappers (e.g. ```json ... ```)
      const cleanJson = rawResponse.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
      const parsed = JSON.parse(cleanJson);

      // Validate with Zod Schema
      const validated = DebuggingResponseZodSchema.parse(parsed);
      return validated;
    } catch (err) {
      console.warn('[AIService] AI primary provider error or validation failure, using heuristic fallback:', err.message);
      
      // Graceful fallback to heuristic engine
      const fallbackRaw = await this.heuristicProvider.generateDebuggingAnalysis(prompt);
      const parsedFallback = JSON.parse(fallbackRaw);
      return DebuggingResponseZodSchema.parse(parsedFallback);
    }
  }

  async mentorChat({
    language,
    sourceCode,
    debuggingSummary,
    chatHistory = [],
    userMessage,
    experienceLevel = 'BEGINNER',
  }) {
    const prompt = buildMentorChatPrompt({
      language,
      sourceCode,
      debuggingSummary,
      chatHistory,
      userMessage,
      experienceLevel,
    });

    const provider = this.getPrimaryProvider();

    try {
      return await provider.generateMentorResponse(prompt);
    } catch (err) {
      console.warn('[AIService] Mentor chat error, using heuristic fallback:', err.message);
      return await this.heuristicProvider.generateMentorResponse(prompt);
    }
  }
}

export const aiService = new AIService();
