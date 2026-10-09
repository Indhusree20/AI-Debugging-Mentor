import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_debugging_mentor',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_ai_debugging_mentor',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  defaultAiProvider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
  sandboxTimeoutMs: parseInt(process.env.SANDBOX_TIMEOUT_MS || '5000', 10),
  maxOutputBytes: parseInt(process.env.MAX_OUTPUT_BYTES || '65536', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
