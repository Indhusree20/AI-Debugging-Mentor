/**
 * Base Abstract Class for Language Adapters
 */
export class LanguageAdapter {
  constructor(name, extension) {
    this.name = name;
    this.extension = extension;
  }

  /**
   * Deterministic syntax & structural analysis (without LLM)
   * @param {string} sourceCode
   * @returns {Promise<{hasSyntaxError: boolean, errors: Array<{line: number, column: number, message: string, rawOutput: string}>}>}
   */
  async analyzeSyntax(sourceCode) {
    throw new Error('analyzeSyntax() must be implemented');
  }

  /**
   * Static code quality analysis (complexity, naming, dead code)
   * @param {string} sourceCode
   * @returns {Promise<{score: number, issues: Array<{rule: string, line: number, message: string, severity: string}>}>}
   */
  async analyzeCodeQuality(sourceCode) {
    throw new Error('analyzeCodeQuality() must be implemented');
  }

  /**
   * Parse runtime or compiler stderr into structured error information
   * @param {string} rawStderr
   * @returns {{errorType: string, line: number|null, column: number|null, message: string}}
   */
  parseStderr(rawStderr) {
    throw new Error('parseStderr() must be implemented');
  }
}
