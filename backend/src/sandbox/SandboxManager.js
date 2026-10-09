import { ProcessSandbox } from './ProcessSandbox.js';

class SandboxManager {
  constructor() {
    this.sandbox = new ProcessSandbox();
  }

  getSandbox() {
    return this.sandbox;
  }

  /**
   * Execute code using the active sandbox instance
   * @param {Object} params
   */
  async execute(params) {
    return this.sandbox.execute(params);
  }
}

export const sandboxManager = new SandboxManager();
