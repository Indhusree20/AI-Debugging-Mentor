import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';

export class CAdapter extends LanguageAdapter {
  constructor() {
    super('c', '.c');
  }

  async analyzeSyntax(sourceCode) {
    const codeStr = String(sourceCode || '');
    const lines = codeStr.split('\n');
    const errors = [];

    // Check for main function
    if (!/main\s*\(/.test(codeStr)) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Missing main function (e.g. int main() { ... })',
        rawOutput: 'undefined reference to `main`',
      });
    }

    let openBraces = 0;
    let openParens = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('#')) continue;

      for (const char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
      }

      // Semicolon check
      if (
        trimmed.length > 0 &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('if') &&
        !trimmed.startsWith('else') &&
        !trimmed.startsWith('for') &&
        !trimmed.startsWith('while') &&
        !trimmed.startsWith('#')
      ) {
        if (
          trimmed.includes('=') ||
          trimmed.startsWith('return') ||
          trimmed.startsWith('printf') ||
          trimmed.startsWith('scanf') ||
          trimmed.startsWith('int ') ||
          trimmed.startsWith('char ') ||
          trimmed.startsWith('float ') ||
          trimmed.startsWith('double ')
        ) {
          errors.push({
            line: i + 1,
            column: line.length + 1,
            message: `Missing semicolon ';' at the end of statement: '${trimmed}'`,
            rawOutput: `error: expected ';' before token at line ${i + 1}`,
          });
        }
      }
    }

    if (openBraces !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: openBraces > 0 ? "Missing closing brace '}'" : "Extra closing brace '}'",
        rawOutput: "error: expected '}' at end of input",
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

    // Check for gets() which is unsafe
    if (/\bgets\s*\(/.test(sourceCode)) {
      issues.push({
        rule: 'SecurityVulnerability',
        line: 1,
        message: "The 'gets()' function is dangerous and deprecated due to buffer overflow vulnerability. Use 'fgets()' instead.",
        severity: 'CRITICAL',
      });
      score -= 25;
    }

    // Check for memory allocation without free
    if (/malloc\s*\(/.test(sourceCode) && !/free\s*\(/.test(sourceCode)) {
      issues.push({
        rule: 'MemoryManagement',
        line: 1,
        message: "Detected memory allocation with 'malloc()' without corresponding 'free()'. Potential memory leak.",
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
    if (!rawStderr) {
      return { errorType: ERROR_TYPES.NONE, line: null, column: null, message: '' };
    }

    // GCC format: solution.c:5:3: error: expected ';' before 'return'
    const gccMatch = rawStderr.match(/.*?\.c:(\d+):(\d+):\s*(?:fatal\s*)?error:\s*(.*)/);
    if (gccMatch) {
      return {
        errorType: ERROR_TYPES.COMPILATION_ERROR,
        line: parseInt(gccMatch[1], 10),
        column: parseInt(gccMatch[2], 10),
        message: gccMatch[3],
      };
    }

    // Segmentation fault
    if (rawStderr.includes('Segmentation fault') || rawStderr.includes('SIGSEGV')) {
      return {
        errorType: ERROR_TYPES.NULL_REFERENCE,
        line: null,
        column: null,
        message: 'Segmentation fault (SIGSEGV): Attempted to access unallocated or invalid memory.',
      };
    }

    return {
      errorType: ERROR_TYPES.RUNTIME_ERROR,
      line: null,
      column: null,
      message: rawStderr.slice(0, 300),
    };
  }
}
