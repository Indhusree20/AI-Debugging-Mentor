/**
 * Abstract Sandbox Interface for isolated, safe user code execution
 */
export class SandboxInterface {
  /**
   * Execute code in an isolated environment
   * @param {Object} params
   * @param {string} params.language - 'python' | 'java' | 'c' | 'cpp'
   * @param {string} params.sourceCode - User's source code
   * @param {string} [params.stdin] - Standard input
   * @param {number} [params.timeoutMs] - Timeout in milliseconds
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number, executionTimeMs: number, timedOut: boolean, memoryUsageKb: number}>}
   */
  async execute({ language, sourceCode, stdin = '', timeoutMs = 5000 }) {
    throw new Error('execute() must be implemented by concrete Sandbox class');
  }
}
