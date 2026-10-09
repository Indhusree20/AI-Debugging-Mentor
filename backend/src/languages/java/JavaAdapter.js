import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';

export class JavaAdapter extends LanguageAdapter {
  constructor() {
    super('java', '.java');
  }

  async analyzeSyntax(sourceCode) {
    const codeStr = String(sourceCode || '');
    const lines = codeStr.split('\n');
    const errors = [];

    // Check for class declaration
    if (!/public\s+class\s+[A-Za-z0-9_]+|class\s+[A-Za-z0-9_]+/.test(codeStr)) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Missing class definition (e.g. public class Main { ... })',
        rawOutput: 'class, interface, or enum expected',
      });
    }

    // Check brace balance
    let openBraces = 0;
    let openParens = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

      // Track braces
      for (const char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
      }

      // Check for missing semicolon on statements
      if (
        trimmed.length > 0 &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('if') &&
        !trimmed.startsWith('else') &&
        !trimmed.startsWith('for') &&
        !trimmed.startsWith('while') &&
        !trimmed.startsWith('public') &&
        !trimmed.startsWith('private') &&
        !trimmed.startsWith('protected') &&
        !trimmed.startsWith('class') &&
        !trimmed.startsWith('interface') &&
        !trimmed.startsWith('@') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*')
      ) {
        // High confidence statement without semicolon
        if (
          trimmed.includes('=') ||
          trimmed.startsWith('return') ||
          trimmed.startsWith('System.out.print') ||
          trimmed.startsWith('int ') ||
          trimmed.startsWith('double ') ||
          trimmed.startsWith('float ') ||
          trimmed.startsWith('String ') ||
          trimmed.startsWith('boolean ')
        ) {
          errors.push({
            line: i + 1,
            column: line.length + 1,
            message: `Missing semicolon ';' at the end of statement: '${trimmed}'`,
            rawOutput: `';' expected at line ${i + 1}`,
          });
        }
      }
    }

    if (openBraces !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: openBraces > 0 ? "Missing closing brace '}'" : "Extra closing brace '}'",
        rawOutput: "reached end of file while parsing / class or interface expected",
      });
    }

    if (openParens !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: 'Unbalanced parentheses () in code.',
        rawOutput: "')' expected",
      });
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

    // Check for System.out.println in production style
    const printCount = (sourceCode.match(/System\.out\.print/g) || []).length;
    if (printCount > 5) {
      issues.push({
        rule: 'LoggingPractice',
        line: 1,
        message: 'Excessive raw System.out.println statements. Use structured logging in production.',
        severity: 'LOW',
      });
      score -= 5;
    }

    // Check for public fields instead of getters/setters
    if (/public\s+(int|String|double|float|boolean)\s+[a-zA-Z0-9_]+\s*;/.test(sourceCode)) {
      issues.push({
        rule: 'Encapsulation',
        line: 1,
        message: 'Public field detected. Encapsulate fields with private access and getters/setters.',
        severity: 'MEDIUM',
      });
      score -= 10;
    }

    return {
      score: Math.max(30, Math.min(100, score)),
      issues,
    };
  }

  parseStderr(rawStderr) {
    if (!rawStderr) {
      return { errorType: ERROR_TYPES.NONE, line: null, column: null, message: '' };
    }

    // Javac compilation error pattern: Main.java:5: error: ';' expected
    const compileMatch = rawStderr.match(/.*?\.java:(\d+):\s*error:\s*(.*)/);
    if (compileMatch) {
      const line = parseInt(compileMatch[1], 10);
      const msg = compileMatch[2];
      return {
        errorType: ERROR_TYPES.COMPILATION_ERROR,
        line,
        column: null,
        message: msg,
      };
    }

    // Java Runtime Exception: Exception in thread "main" java.lang.NullPointerException
    const runtimeMatch = rawStderr.match(/Exception in thread ".*?"\s+java\.lang\.([A-Za-z]+Exception|NullPointerException|ArrayIndexOutOfBoundsException|ArithmeticException):?\s*(.*)/);
    if (runtimeMatch) {
      const errName = runtimeMatch[1];
      const details = runtimeMatch[2] || '';
      
      const lineMatch = rawStderr.match(/at\s+.*?\..*?\(.*?\.java:(\d+)\)/);
      const line = lineMatch ? parseInt(lineMatch[1], 10) : null;

      let errorType = ERROR_TYPES.RUNTIME_ERROR;
      if (errName === 'NullPointerException') errorType = ERROR_TYPES.NULL_REFERENCE;
      else if (errName === 'ArrayIndexOutOfBoundsException') errorType = ERROR_TYPES.INDEX_ERROR;
      else if (errName === 'ArithmeticException') errorType = ERROR_TYPES.RUNTIME_ERROR;

      return {
        errorType,
        line,
        column: null,
        message: `${errName}: ${details}`,
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
