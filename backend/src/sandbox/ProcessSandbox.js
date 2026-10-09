import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SandboxInterface } from './SandboxInterface.js';
import { config } from '../config/index.js';

export class ProcessSandbox extends SandboxInterface {
  constructor() {
    super();
    this.defaultTimeoutMs = config.sandboxTimeoutMs || 5000;
    this.maxOutputBytes = config.maxOutputBytes || 65536;
  }

  async execute({ language, sourceCode, stdin = '', timeoutMs = this.defaultTimeoutMs }) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mentor-sandbox-'));
    const startTime = Date.now();

    try {
      switch (language) {
        case 'python':
        case 'py':
          return await this._executePython(tempDir, sourceCode, stdin, timeoutMs, startTime);
        case 'javascript':
        case 'js':
          return await this._executeJavaScript(tempDir, sourceCode, stdin, timeoutMs, startTime);
        case 'java':
          return await this._executeJava(tempDir, sourceCode, stdin, timeoutMs, startTime);
        case 'c':
          return await this._executeC(tempDir, sourceCode, stdin, timeoutMs, startTime);
        case 'cpp':
          return await this._executeCpp(tempDir, sourceCode, stdin, timeoutMs, startTime);
        default:
          throw new Error(`Unsupported language for execution: ${language}`);
      }
    } finally {
      // Clean up ephemeral sandbox directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        // Silently ignore cleanup errors
      }
    }
  }

  async _executeJavaScript(tempDir, sourceCode, stdin, timeoutMs, startTime) {
    const scriptPath = path.join(tempDir, 'solution.js');
    await fs.writeFile(scriptPath, sourceCode, 'utf8');

    return this._runProcess('node', [scriptPath], stdin, timeoutMs, startTime, tempDir);
  }

  async _executePython(tempDir, sourceCode, stdin, timeoutMs, startTime) {
    const scriptPath = path.join(tempDir, 'solution.py');
    await fs.writeFile(scriptPath, sourceCode, 'utf8');

    return this._runProcess('python', ['-u', scriptPath], stdin, timeoutMs, startTime, tempDir);
  }

  async _executeJava(tempDir, sourceCode, stdin, timeoutMs, startTime) {
    // Determine class name from code or default to Main
    const match = sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    const className = match ? match[1] : 'Main';
    const filePath = path.join(tempDir, `${className}.java`);
    await fs.writeFile(filePath, sourceCode, 'utf8');

    // Compile step
    const compileResult = await this._runProcess('javac', [filePath], '', timeoutMs, startTime, tempDir);
    if (compileResult.exitCode !== 0) {
      return {
        stdout: '',
        stderr: compileResult.stderr || compileResult.stdout || 'Java compilation failed.',
        exitCode: compileResult.exitCode,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
        memoryUsageKb: 0,
        isCompilationError: true,
      };
    }

    // Run step
    return this._runProcess('java', ['-cp', tempDir, className], stdin, timeoutMs, startTime, tempDir);
  }

  async _executeC(tempDir, sourceCode, stdin, timeoutMs, startTime) {
    const srcPath = path.join(tempDir, 'solution.c');
    const binExt = process.platform === 'win32' ? '.exe' : '';
    const binPath = path.join(tempDir, `solution${binExt}`);
    await fs.writeFile(srcPath, sourceCode, 'utf8');

    // Compile with gcc
    const compileResult = await this._runProcess('gcc', [srcPath, '-o', binPath], '', timeoutMs, startTime, tempDir);
    if (compileResult.exitCode !== 0) {
      return {
        stdout: '',
        stderr: compileResult.stderr || compileResult.stdout || 'C compilation failed.',
        exitCode: compileResult.exitCode,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
        memoryUsageKb: 0,
        isCompilationError: true,
      };
    }

    // Run binary
    return this._runProcess(binPath, [], stdin, timeoutMs, startTime, tempDir);
  }

  async _executeCpp(tempDir, sourceCode, stdin, timeoutMs, startTime) {
    const srcPath = path.join(tempDir, 'solution.cpp');
    const binExt = process.platform === 'win32' ? '.exe' : '';
    const binPath = path.join(tempDir, `solution${binExt}`);
    await fs.writeFile(srcPath, sourceCode, 'utf8');

    // Compile with g++
    const compileResult = await this._runProcess('g++', [srcPath, '-o', binPath, '-std=c++17'], '', timeoutMs, startTime, tempDir);
    if (compileResult.exitCode !== 0) {
      return {
        stdout: '',
        stderr: compileResult.stderr || compileResult.stdout || 'C++ compilation failed.',
        exitCode: compileResult.exitCode,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
        memoryUsageKb: 0,
        isCompilationError: true,
      };
    }

    // Run binary
    return this._runProcess(binPath, [], stdin, timeoutMs, startTime, tempDir);
  }

  _runProcess(command, args, stdin, timeoutMs, startTime, cwd) {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let isTimedOut = false;
      let totalBytes = 0;

      let child;
      try {
        child = spawn(command, args, {
          cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            PATH: process.env.PATH,
            PYTHONIOENCODING: 'utf-8',
            LANG: 'en_US.UTF-8',
          },
        });
      } catch (err) {
        return resolve({
          stdout: '',
          stderr: `Execution error: ${err.message}`,
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
          timedOut: false,
          memoryUsageKb: 0,
        });
      }

      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          child.kill('SIGKILL');
        } catch (e) {
          // ignore
        }
      }, timeoutMs);

      child.stdout.on('data', (data) => {
        const str = data.toString('utf8');
        if (totalBytes < this.maxOutputBytes) {
          stdout += str;
          totalBytes += Buffer.byteLength(str);
        } else if (!stdout.endsWith('\n[Output Truncated - Maximum Limit Exceeded]')) {
          stdout += '\n[Output Truncated - Maximum Limit Exceeded]';
        }
      });

      child.stderr.on('data', (data) => {
        const str = data.toString('utf8');
        if (totalBytes < this.maxOutputBytes) {
          stderr += str;
          totalBytes += Buffer.byteLength(str);
        }
      });

      if (stdin && child.stdin) {
        try {
          child.stdin.write(stdin);
          child.stdin.end();
        } catch (err) {
          // Ignore write error if process already exited
        }
      } else if (child.stdin) {
        child.stdin.end();
      }

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr: stderr || `Process execution failed: ${err.message}`,
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
          timedOut: false,
          memoryUsageKb: 0,
        });
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          stdout: stdout.trimEnd(),
          stderr: isTimedOut ? `Execution timed out after ${timeoutMs}ms (Infinite loop or long-running process).` : stderr.trimEnd(),
          exitCode: isTimedOut ? 124 : (code ?? 0),
          executionTimeMs: Date.now() - startTime,
          timedOut: isTimedOut,
          memoryUsageKb: Math.round(process.memoryUsage().heapUsed / 1024),
        });
      });
    });
  }
}
