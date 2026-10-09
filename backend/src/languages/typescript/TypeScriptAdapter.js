import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';

export class TypeScriptAdapter extends LanguageAdapter {
  constructor() {
    super('typescript', '.ts');
  }

  async analyzeSyntax(sourceCode) {
    const lines = String(sourceCode || '').split('\n');
    const errors = [];
    let openBraces = 0;
    let openParens = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

      for (const char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
      }

      // Check for malformed interface / type definition
      if (/^interface\s+[a-zA-Z0-9_]+\s*$/i.test(trimmed)) {
        errors.push({
          line: i + 1,
          column: line.length + 1,
          message: `Interface '${trimmed}' is missing a body '{ ... }'`,
          rawOutput: `TS1005: '{' expected at line ${i + 1}`,
        });
      }
    }

    if (openBraces !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: openBraces > 0 ? "Missing closing brace '}'" : "Extra closing brace '}'",
        rawOutput: "TS1005: '}' expected",
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

    // Check for 'any' type usage
    if (/:\s*any\b/.test(sourceCode)) {
      issues.push({
        rule: 'NoExplicitAny',
        line: 1,
        message: "Avoid using the 'any' type in TypeScript. Use specific types, generics, or 'unknown'.",
        severity: 'MEDIUM',
      });
      score -= 10;
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
