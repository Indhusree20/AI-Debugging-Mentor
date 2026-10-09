import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';

export class GoAdapter extends LanguageAdapter {
  constructor() {
    super('go', '.go');
  }

  async analyzeSyntax(sourceCode) {
    const code = String(sourceCode || '');
    const lines = code.split('\n');
    const errors = [];

    // Check package declaration
    if (!/^\s*package\s+[a-zA-Z0-9_]+/m.test(code)) {
      errors.push({
        line: 1,
        column: 1,
        message: "Missing 'package' declaration at start of Go source file (e.g. 'package main')",
        rawOutput: 'expected package, found ...',
      });
    }

    let openBraces = 0;
    for (const char of code) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
    }
    if (openBraces !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: openBraces > 0 ? "Unclosed brace '{'" : "Extra closing brace '}'",
        rawOutput: 'syntax error: unexpected }',
      });
    }

    return {
      hasSyntaxError: errors.length > 0,
      errors,
    };
  }

  async analyzeCodeQuality(sourceCode) {
    const issues = [];
    let score = 100;

    // Check for ignored error returns (_ = functionCallThatReturnsError)
    if (/_,\s*_\s*:=/.test(sourceCode) || /_,\s*err\s*:=/.test(sourceCode) && !/if\s+err\s*!=\s*nil/.test(sourceCode)) {
      issues.push({
        rule: 'UnhandledError',
        line: 1,
        message: "Potential unhandled error in Go. Always inspect 'if err != nil' after operations returning errors.",
        severity: 'HIGH',
      });
      score -= 15;
    }

    return {
      score: Math.max(20, Math.min(100, score)),
      issues,
    };
  }

  parseStderr(rawStderr) {
    if (!rawStderr) return { errorType: ERROR_TYPES.NONE, line: null, column: null, message: '' };
    return {
      errorType: ERROR_TYPES.COMPILATION_ERROR,
      line: null,
      column: null,
      message: rawStderr.slice(0, 250),
    };
  }
}
