import { test, describe } from 'node:test';
import assert from 'node:assert';
import { sandboxManager } from '../../src/sandbox/SandboxManager.js';

describe('Sandbox Execution Tests', () => {
  test('Executes valid Python code in sandbox and returns stdout', async () => {
    const result = await sandboxManager.execute({
      language: 'python',
      sourceCode: 'print("Hello Sandbox Execution")',
      timeoutMs: 3000,
    });

    assert.strictEqual(result.exitCode, 0);
    assert.strictEqual(result.stdout.trim(), 'Hello Sandbox Execution');
    assert.strictEqual(result.timedOut, false);
  });

  test('Gracefully captures runtime error in sandbox without crashing host', async () => {
    const result = await sandboxManager.execute({
      language: 'python',
      sourceCode: 'x = 10 / 0',
      timeoutMs: 3000,
    });

    assert.notStrictEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('ZeroDivisionError'));
  });

  test('Terminates infinite loops cleanly via timeout ceiling', async () => {
    const result = await sandboxManager.execute({
      language: 'python',
      sourceCode: 'while True:\n    pass',
      timeoutMs: 1500,
    });

    assert.strictEqual(result.timedOut, true);
    assert.ok(result.stderr.includes('timed out'));
  });
});
