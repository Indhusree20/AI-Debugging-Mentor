import { LanguageAdapter } from '../LanguageAdapter.js';
import { ERROR_TYPES } from '../../config/constants.js';

export class SqlAdapter extends LanguageAdapter {
  constructor() {
    super('sql', '.sql');
  }

  async analyzeSyntax(sourceCode) {
    const code = String(sourceCode || '');
    const lines = code.split('\n');
    const errors = [];

    // Check for SELECT without FROM (unless pure value expression like SELECT 1)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^SELECT\b/i.test(line) && !/FROM\b/i.test(code) && /[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_]/.test(line)) {
        errors.push({
          line: i + 1,
          column: 1,
          message: 'SELECT query with column references is missing a FROM clause.',
          rawOutput: 'SyntaxError: FROM clause missing',
        });
      }
    }

    // Check unclosed parentheses
    let openParens = 0;
    for (const char of code) {
      if (char === '(') openParens++;
      if (char === ')') openParens--;
    }
    if (openParens !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: openParens > 0 ? "Unclosed parenthesis '(' in SQL query." : "Extra closing parenthesis ')' in SQL query.",
        rawOutput: 'SyntaxError: unmatched parenthesis',
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

    // Check for SELECT * in production queries
    if (/SELECT\s+\*\s+FROM/i.test(sourceCode)) {
      issues.push({
        rule: 'SelectStar',
        line: 1,
        message: "Avoid 'SELECT *' in production queries. Explicitly list only needed columns to optimize performance and prevent schema breakage.",
        severity: 'LOW',
      });
      score -= 5;
    }

    // Check for missing WHERE in UPDATE or DELETE
    if (/^\s*(UPDATE|DELETE\s+FROM)\b/i.test(sourceCode) && !/\bWHERE\b/i.test(sourceCode)) {
      issues.push({
        rule: 'UnboundedMutation',
        line: 1,
        message: "Dangerous query: UPDATE/DELETE statement without a WHERE clause will modify all rows in the table!",
        severity: 'CRITICAL',
      });
      score -= 30;
    }

    return {
      score: Math.max(20, Math.min(100, score)),
      issues,
    };
  }

  parseStderr(rawStderr) {
    if (!rawStderr) return { errorType: ERROR_TYPES.NONE, line: null, column: null, message: '' };
    return {
      errorType: ERROR_TYPES.SYNTAX_ERROR,
      line: null,
      column: null,
      message: rawStderr.slice(0, 250),
    };
  }
}
