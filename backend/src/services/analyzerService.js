import { languageFactory } from '../languages/LanguageFactory.js';
import { LanguageDetector } from '../languages/LanguageDetector.js';
import { sandboxManager } from '../sandbox/SandboxManager.js';
import { aiService } from '../ai/AIService.js';

export class AnalyzerService {
  /**
   * Run the full multi-tier debugging pipeline with automatic language detection
   */
  async analyzeCode({
    language,
    sourceCode,
    experienceLevel = 'BEGINNER',
    mode = 'LEARN_MODE',
    expectedOutput = null,
    filenameHint = '',
  }) {
    const startTime = Date.now();

    // Step 1: Automatic Programming Language Detection
    let detectedLang = (language || '').toLowerCase().trim();
    let detectionInfo = { language: detectedLang || 'python', confidence: 1.0, status: 'DETECTED' };

    if (!detectedLang || detectedLang === 'auto') {
      const result = LanguageDetector.detect(sourceCode, filenameHint);
      detectedLang = result.language;
      detectionInfo = {
        name: result.language,
        confidence: result.confidence,
        detectionStatus: result.status,
      };
    } else {
      detectionInfo = {
        name: detectedLang,
        confidence: 1.0,
        detectionStatus: 'DETECTED',
      };
    }

    const adapter = languageFactory.getAdapter(detectedLang);

    // Step 2: Deterministic Syntax / AST Analysis
    const syntaxAnalysis = await adapter.analyzeSyntax(sourceCode);

    // Step 3: Code Execution / Runtime Analysis in Isolated Sandbox (for executable targets)
    let runtimeResult = {
      stdout: '',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 0,
      timedOut: false,
      memoryUsageKb: 0,
    };

    const isSandboxSupported = ['python', 'java', 'c', 'cpp'].includes(detectedLang);

    if (isSandboxSupported && !syntaxAnalysis.hasSyntaxError) {
      try {
        runtimeResult = await sandboxManager.execute({
          language: detectedLang,
          sourceCode,
          timeoutMs: 4000,
        });
      } catch (err) {
        runtimeResult.stderr = `Execution failed: ${err.message}`;
        runtimeResult.exitCode = 1;
      }
    }

    // Step 4: Static Code Quality Analysis
    const staticQuality = await adapter.analyzeCodeQuality(sourceCode);

    // Combine deterministic diagnostics
    const deterministicAnalysis = {
      hasSyntaxError: syntaxAnalysis.hasSyntaxError,
      syntaxErrors: syntaxAnalysis.errors || [],
      runtimeResult,
      staticQuality,
    };

    // Step 5: AI Debugging Engine (Pedagogical Scaffolding & Structured Output)
    const aiAnalysis = await aiService.analyzeCode({
      language: detectedLang,
      sourceCode,
      experienceLevel,
      mode,
      expectedOutput,
      deterministicAnalysis,
    });

    const totalDurationMs = Date.now() - startTime;

    // Build standard clean errors list
    const cleanErrors = (aiAnalysis.issues || []).map((iss, idx) => ({
      id: iss.id || `err-${idx + 1}`,
      type: iss.type,
      severity: iss.severity,
      line: iss.line || null,
      column: iss.column || null,
      message: iss.message,
      explanation: iss.explanation || iss.cause || 'Check the highlighted construct.',
      classification: iss.severity === 'CRITICAL' || iss.severity === 'HIGH' ? 'CONFIRMED' : 'POSSIBLE',
      source: iss.source || 'STATIC_ANALYZER',
    }));

    return {
      language: detectionInfo,
      analysis: {
        completed: true,
        availableChecks: ['SYNTAX', 'STATIC_ANALYSIS', isSandboxSupported ? 'RUNTIME' : null].filter(Boolean),
        unavailableChecks: isSandboxSupported ? [] : ['RUNTIME'],
      },
      errors: cleanErrors,
      summary: {
        detectedIssues: cleanErrors.length,
      },
      deterministicAnalysis,
      aiAnalysis,
      durationMs: totalDurationMs,
      targetLanguage: detectedLang,
    };
  }


  /**
   * Quick execution runner without full AI diagnostics
   */
  async runCodeOnly({ language, sourceCode, stdin = '', timeoutMs = 4000 }) {
    const startTime = Date.now();
    const adapter = languageFactory.getAdapter(language);

    // Check syntax first
    const syntaxCheck = await adapter.analyzeSyntax(sourceCode);
    if (syntaxCheck.hasSyntaxError && syntaxCheck.errors?.length > 0) {
      return {
        stdout: '',
        stderr: syntaxCheck.errors.map(e => e.rawOutput || e.message).join('\n'),
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
        memoryUsageKb: 0,
        isSyntaxError: true,
      };
    }

    // Execute in sandbox
    const result = await sandboxManager.execute({
      language,
      sourceCode,
      stdin,
      timeoutMs,
    });

    return result;
  }
}

export const analyzerService = new AnalyzerService();
