import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';
import vm from 'vm';

export class JavaScriptAdapter extends LanguageAdapter {
  constructor() {
    super('javascript', '.js');
  }

  async analyzeSyntax(sourceCode) {
    const code = String(sourceCode || '');
    const errors = [];

    try {
      // Use Node's built-in V8 compiler to deterministically check JS syntax
      vm.compileFunction(code, [], { filename: 'solution.js' });
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Extract line and column from error stack
        const stack = err.stack || '';
        const match = stack.match(/solution\.js:(\d+)(?::(\d+))?/);
        const line = match ? parseInt(match[1], 10) : 1;
        const column = match && match[2] ? parseInt(match[2], 10) : 1;

        errors.push({
          line,
          column,
          message: err.message,
          rawOutput: `SyntaxError: ${err.message} at line ${line}`,
        });
      }
    }

    return {
      hasSyntaxError: errors.length > 0,
      errors,
    };
  }

  async analyzeCodeQuality(sourceCode) {
    const lines = sourceCode.split('\n');
    const issues = [];
    let score = 100;

    // Check for use of 'var' instead of let/const
    if (/\bvar\s+[a-zA-Z0-9_$]+/.test(sourceCode)) {
      issues.push({
        rule: 'NoVar',
        line: 1,
        message: "Prefer 'const' or 'let' over 'var' for block-scoped variable declarations.",
        severity: 'LOW',
      });
      score -= 5;
    }

    // Check for loose equality == instead of ===
    if (/[^!=]==[^=]/.test(sourceCode)) {
      issues.push({
        rule: 'StrictEquality',
        line: 1,
        message: "Use strict equality '===' instead of loose equality '==' to avoid unexpected type coercion.",
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
    if (!rawStderr) {
      return { errorType: ERROR_TYPES.NONE, line: null, column: null, message: '' };
    }

    const match = rawStderr.match(/([A-Za-z]+Error): (.*)/);
    const lineMatch = rawStderr.match(/:(\d+)(?::(\d+))?/);

    return {
      errorType: match ? (match[1] === 'SyntaxError' ? ERROR_TYPES.SYNTAX_ERROR : ERROR_TYPES.RUNTIME_ERROR) : ERROR_TYPES.RUNTIME_ERROR,
      line: lineMatch ? parseInt(lineMatch[1], 10) : null,
      column: lineMatch && lineMatch[2] ? parseInt(lineMatch[2], 10) : null,
      message: match ? `${match[1]}: ${match[2]}` : rawStderr.slice(0, 200),
    };
  }
}
