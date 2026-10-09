import { LanguageAdapter } from '../LanguageAdapter.js';
import { spawn } from 'child_process';
import { ERROR_TYPES } from '../../config/constants.js';

export class PythonAdapter extends LanguageAdapter {
  constructor() {
    super('python', '.py');
  }

  async analyzeSyntax(sourceCode) {
    // We use Python's built-in ast and compile to deterministically verify syntax
    const astCheckerScript = `
import ast
import json
import sys

code = sys.stdin.read()
try:
    ast.parse(code)
    print(json.dumps({"hasSyntaxError": False, "errors": []}))
except SyntaxError as e:
    print(json.dumps({
        "hasSyntaxError": True,
        "errors": [{
            "line": e.lineno,
            "column": e.offset,
            "message": e.msg,
            "rawOutput": f"SyntaxError: {e.msg} at line {e.lineno}, column {e.offset}"
        }]
    }))
except Exception as e:
    print(json.dumps({
        "hasSyntaxError": True,
        "errors": [{
            "line": 1,
            "column": 1,
            "message": str(e),
            "rawOutput": str(e)
        }]
    }))
`;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      let child;
      try {
        child = spawn('python', ['-c', astCheckerScript]);
      } catch (err) {
        // If python isn't installed locally, fallback gracefully
        return resolve(this._fallbackSyntaxCheck(sourceCode));
      }

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('error', () => {
        resolve(this._fallbackSyntaxCheck(sourceCode));
      });

      child.on('close', (code) => {
        if (code === 0 && stdout) {
          try {
            const parsed = JSON.parse(stdout.trim());
            return resolve(parsed);
          } catch (e) {
            // fallback
          }
        }
        resolve(this._fallbackSyntaxCheck(sourceCode));
      });

      const safeCode = String(sourceCode || '');
      child.stdin.write(safeCode);
      child.stdin.end();
    });
  }

  _fallbackSyntaxCheck(sourceCode) {
    const lines = sourceCode.split('\n');
    const errors = [];

    // Basic heuristic checks if python runner isn't available
    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Missing colon checks for def, if, for, while, class
      if (/^(def|class|if|elif|else|for|while|try|except|finally)\b/.test(trimmed)) {
        if (!trimmed.endsWith(':') && !trimmed.includes('#')) {
          errors.push({
            line: i + 1,
            column: line.length,
            message: `Missing colon ':' at the end of statement '${trimmed}'`,
            rawOutput: `SyntaxError: expected ':' at line ${i + 1}`,
          });
        }
      }

      // Check unbalanced brackets
      for (const char of line) {
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
      }
    }

    if (openParens !== 0 || openBrackets !== 0 || openBraces !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: 'Unbalanced parentheses, brackets, or braces.',
        rawOutput: 'SyntaxError: unmatched delimiter',
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

    // Check for overly long lines
    lines.forEach((line, idx) => {
      if (line.length > 100) {
        issues.push({
          rule: 'LineLength',
          line: idx + 1,
          message: `Line exceeds 100 characters (${line.length} chars). Consider breaking it up.`,
          severity: 'LOW',
        });
        score -= 3;
      }
    });

    // Check for single-letter variable names (outside common loops)
    const singleLetterVars = sourceCode.match(/\b([a-hj-km-z])\s*=\s*/g);
    if (singleLetterVars && singleLetterVars.length > 2) {
      issues.push({
        rule: 'VariableNaming',
        line: 1,
        message: 'Found multiple single-letter variable names. Use descriptive variable names.',
        severity: 'MEDIUM',
      });
      score -= 8;
    }

    // Check for bare except
    if (/except\s*:/.test(sourceCode)) {
      issues.push({
        rule: 'BareExcept',
        line: 1,
        message: "Avoid bare 'except:'. Catch specific exceptions like 'except ValueError:' or 'except Exception:'.",
        severity: 'HIGH',
      });
      score -= 10;
    }

    // Check for deep nesting (> 3 levels of indentation)
    let maxIndentation = 0;
    lines.forEach((line, idx) => {
      const match = line.match(/^(\s+)/);
      if (match) {
        const spaces = match[1].replace(/\t/g, '    ').length;
        const level = Math.floor(spaces / 4);
        if (level > 3) {
          maxIndentation = Math.max(maxIndentation, level);
        }
      }
    });

    if (maxIndentation > 3) {
      issues.push({
        rule: 'DeepNesting',
        line: 1,
        message: `Deeply nested code (${maxIndentation} levels). Consider extracting nested logic into helper functions.`,
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

    // Check for SyntaxError
    const syntaxMatch = rawStderr.match(/File ".*", line (\d+)(?:, in .*)?\n(?:\s+.*\n)?(?:\s+\^+\n)?([A-Za-z]+Error): (.*)/);
    if (syntaxMatch) {
      const line = parseInt(syntaxMatch[1], 10);
      const errName = syntaxMatch[2];
      const msg = syntaxMatch[3];
      return {
        errorType: errName === 'SyntaxError' ? ERROR_TYPES.SYNTAX_ERROR : ERROR_TYPES.RUNTIME_ERROR,
        line,
        column: null,
        message: `${errName}: ${msg}`,
      };
    }

    // Standard Python Traceback
    const tracebackMatch = rawStderr.match(/File ".*", line (\d+), in .*\n\s+(.*)\n([A-Za-z]+Error): (.*)/);
    if (tracebackMatch) {
      const line = parseInt(tracebackMatch[1], 10);
      const errName = tracebackMatch[3];
      const msg = tracebackMatch[4];

      let errorType = ERROR_TYPES.RUNTIME_ERROR;
      if (errName === 'ZeroDivisionError') errorType = ERROR_TYPES.RUNTIME_ERROR;
      else if (errName === 'IndexError') errorType = ERROR_TYPES.INDEX_ERROR;
      else if (errName === 'NameError') errorType = ERROR_TYPES.NAME_ERROR;
      else if (errName === 'TypeError') errorType = ERROR_TYPES.TYPE_ERROR;
      else if (errName === 'ImportError' || errName === 'ModuleNotFoundError') errorType = ERROR_TYPES.IMPORT_ERROR;

      return {
        errorType,
        line,
        column: null,
        message: `${errName}: ${msg}`,
      };
    }

    // Timeout
    if (rawStderr.includes('timed out')) {
      return {
        errorType: ERROR_TYPES.INFINITE_LOOP,
        line: null,
        column: null,
        message: 'Program exceeded execution timeout limit (potential infinite loop).',
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
