import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';

export class CppAdapter extends LanguageAdapter {
  constructor() {
    super('cpp', '.cpp');
  }

  async analyzeSyntax(sourceCode) {
    const codeStr = String(sourceCode || '');
    const lines = codeStr.split('\n');
    const errors = [];

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
          trimmed.startsWith('std::cout') ||
          trimmed.startsWith('cout') ||
          trimmed.startsWith('std::cin') ||
          trimmed.startsWith('cin') ||
          trimmed.startsWith('int ') ||
          trimmed.startsWith('string ') ||
          trimmed.startsWith('std::string ') ||
          trimmed.startsWith('vector') ||
          trimmed.startsWith('std::vector')
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

    // Check for using namespace std;
    if (/using\s+namespace\s+std\s*;/.test(sourceCode)) {
      issues.push({
        rule: 'NamespacePollution',
        line: 1,
        message: "Avoid 'using namespace std;' in header files and large scopes to prevent symbol collisions.",
        severity: 'LOW',
      });
      score -= 5;
    }

    // Check for raw new without delete
    if (/\bnew\s+/.test(sourceCode) && !/\bdelete\s+/.test(sourceCode)) {
      issues.push({
        rule: 'ModernCppRAII',
        line: 1,
        message: "Found raw 'new' expression. In modern C++, prefer smart pointers ('std::unique_ptr', 'std::make_shared') or RAII containers.",
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

    // G++ compile error: solution.cpp:5:10: error: 'cout' was not declared in this scope
    const gppMatch = rawStderr.match(/.*?\.cpp:(\d+):(\d+):\s*(?:fatal\s*)?error:\s*(.*)/);
    if (gppMatch) {
      return {
        errorType: ERROR_TYPES.COMPILATION_ERROR,
        line: parseInt(gppMatch[1], 10),
        column: parseInt(gppMatch[2], 10),
        message: gppMatch[3],
      };
    }

    // std::out_of_range / SIGABRT
    if (rawStderr.includes('std::out_of_range') || rawStderr.includes('vector::_M_range_check')) {
      return {
        errorType: ERROR_TYPES.INDEX_ERROR,
        line: null,
        column: null,
        message: 'std::out_of_range: Vector or array index is out of bounds.',
      };
    }

    if (rawStderr.includes('Segmentation fault') || rawStderr.includes('SIGSEGV')) {
      return {
        errorType: ERROR_TYPES.NULL_REFERENCE,
        line: null,
        column: null,
        message: 'Segmentation fault (SIGSEGV): Null pointer or memory access violation.',
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
