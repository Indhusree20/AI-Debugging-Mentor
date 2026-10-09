/**
 * Abstract Base Class for AI Model Providers
 */
export class AIProvider {
  /**
   * Send structured debugging request
   * @param {string} prompt
   * @returns {Promise<string>} raw json text response
   */
  async generateDebuggingAnalysis(prompt) {
    throw new Error('generateDebuggingAnalysis() must be implemented');
  }

  /**
   * Send mentor chat message
   * @param {string} prompt
   * @returns {Promise<string>} mentor message text
   */
  async generateMentorResponse(prompt) {
    throw new Error('generateMentorResponse() must be implemented');
  }
}
