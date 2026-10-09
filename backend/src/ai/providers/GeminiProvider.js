import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './AIProvider.js';
import { SYSTEM_PROMPT_GUARD } from '../prompts/systemPrompts.js';
import { config } from '../../config/index.js';

export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = config.geminiApiKey;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateDebuggingAnalysis(prompt) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT_GUARD,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateMentorResponse(prompt) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT_GUARD,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
