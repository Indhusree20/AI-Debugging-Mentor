import { AIProvider } from './AIProvider.js';
import { ERROR_TYPES, SEVERITY_LEVELS, CONFIDENCE_LEVELS, ERROR_SOURCES } from '../../config/constants.js';

export class HeuristicAIProvider extends AIProvider {
  async generateDebuggingAnalysis(prompt) {
    // Parse context out of prompt
    const langMatch = prompt.match(/Analyze the following ([A-Z0-9+]+) code/i);
    const language = langMatch ? langMatch[1].toLowerCase() : 'python';

    const codeMatch = prompt.match(/<UNTRUSTED_USER_SOURCE_CODE>([\s\S]*?)<\/UNTRUSTED_USER_SOURCE_CODE>/);
    const sourceCode = codeMatch ? codeMatch[1].trim() : '';

    const expectedMatch = prompt.match(/USER EXPECTED OUTPUT:\s*"""([\s\S]*?)"""/);
    const expectedOutput = expectedMatch ? expectedMatch[1].trim() : null;

    const stderrMatch = prompt.match(/Runtime Stderr:\s*"""([\s\S]*?)"""/);
    const stderr = stderrMatch ? stderrMatch[1].trim() : '';

    const stdoutMatch = prompt.match(/Runtime Stdout:\s*"""([\s\S]*?)"""/);
    const stdout = stdoutMatch ? stdoutMatch[1].trim() : '';

    const syntaxMatch = prompt.match(/Syntax Errors Detected:\s*(\[[\s\S]*?\])/);
    let syntaxErrors = [];
    try {
      if (syntaxMatch) syntaxErrors = JSON.parse(syntaxMatch[1]);
    } catch (e) {
      // ignore
    }

    const qualityMatch = prompt.match(/Static Quality Issues:\s*(\[[\s\S]*?\])/);
    let qualityIssues = [];
    try {
      if (qualityMatch) qualityIssues = JSON.parse(qualityMatch[1]);
    } catch (e) {
      // ignore
    }

    const lines = sourceCode.split('\n');
    const issues = [];
    let correctedCode = sourceCode;
    let primaryErrorType = ERROR_TYPES.NONE;
    let overallSeverity = SEVERITY_LEVELS.LOW;
    let whatHappened = 'No critical errors detected. Code executed cleanly.';
    let whereText = 'Whole Program';
    let whyText = 'Code structure follows language rules correctly.';
    let howToFix = 'No fixes required. You can review code quality recommendations.';
    let relatedConcept = 'Clean Code & Best Practices';
    let diffDescription = 'No changes required.';

    // 1. Gather all Syntax Errors
    if (syntaxErrors.length > 0) {
      syntaxErrors.forEach((err, idx) => {
        const lineNum = err.line || 1;
        const lineText = (lines[lineNum - 1] || '').trim();
        issues.push({
          id: `syntax-${idx + 1}`,
          type: ERROR_TYPES.SYNTAX_ERROR,
          severity: SEVERITY_LEVELS.HIGH,
          line: lineNum,
          column: err.column || 1,
          message: `Syntax Error: ${err.message}`,
          explanation: `The compiler/parser encountered invalid syntax: "${err.message}".`,
          cause: `Violates ${language.toUpperCase()} grammar rules at line ${lineNum}: "${lineText}"`,
          suggestion: `Fix the statement structure at line ${lineNum}.`,
          correctedCode: null,
          confidence: 0.98,
          source: ERROR_SOURCES.STATIC_ANALYZER,
        });
      });

      const firstErr = syntaxErrors[0];
      const targetLineNum = firstErr.line || 1;
      primaryErrorType = ERROR_TYPES.SYNTAX_ERROR;
      overallSeverity = SEVERITY_LEVELS.HIGH;
      whatHappened = `The compiler encountered syntax errors: ${firstErr.message}.`;
      whereText = `Line ${targetLineNum}: "${(lines[targetLineNum - 1] || '').trim()}"`;
      whyText = `${language.toUpperCase()} grammar rules require correct statement termination and delimiter matching.`;
      howToFix = `Review line ${targetLineNum} and apply the required syntax correction.`;
      relatedConcept = `${language.toUpperCase()} Grammar & Syntax Rules`;

      // Auto-fix generation for semicolon / colon
      if (firstErr.message.includes('semicolon') || firstErr.message.includes(';')) {
        const fixedLines = [...lines];
        if (fixedLines[targetLineNum - 1] && !fixedLines[targetLineNum - 1].trim().endsWith(';')) {
          fixedLines[targetLineNum - 1] = fixedLines[targetLineNum - 1] + ';';
          correctedCode = fixedLines.join('\n');
          diffDescription = `Added missing semicolon ';' to line ${targetLineNum}`;
        }
      } else if (firstErr.message.includes('colon') || firstErr.message.includes(':')) {
        const fixedLines = [...lines];
        if (fixedLines[targetLineNum - 1] && !fixedLines[targetLineNum - 1].trim().endsWith(':')) {
          fixedLines[targetLineNum - 1] = fixedLines[targetLineNum - 1] + ':';
          correctedCode = fixedLines.join('\n');
          diffDescription = `Added missing colon ':' to statement at line ${targetLineNum}`;
        }
      }
    }

    // 2. Gather Runtime Errors & Exceptions
    if (stderr && stderr !== 'None') {
      let errType = ERROR_TYPES.RUNTIME_ERROR;
      let what = 'A runtime exception was thrown during execution.';
      let why = stderr;
      let fix = 'Add proper boundary conditions or guard checks before this operation.';
      let targetLine = 1;

      if (stderr.includes('ZeroDivisionError') || stderr.includes('/ by zero')) {
        errType = ERROR_TYPES.DIVISION_BY_ZERO;
        what = 'Division by zero occurred.';
        why = 'Mathematical division by 0 is undefined and causes the program to crash.';
        fix = 'Verify that the denominator is not zero before dividing.';
      } else if (stderr.includes('IndexError') || stderr.includes('ArrayIndexOutOfBoundsException') || stderr.includes('out_of_range')) {
        errType = ERROR_TYPES.INDEX_ERROR;
        what = 'Array / Collection index out of range.';
        why = 'The program tried to access an element at an index that does not exist.';
        fix = 'Ensure index is strictly within 0 and length - 1.';
      } else if (stderr.includes('NullPointer') || stderr.includes('NoneType') || stderr.includes('Segmentation fault')) {
        errType = ERROR_TYPES.NULL_REFERENCE;
        what = 'Null / None reference or invalid memory access.';
        why = 'Attempted to invoke a method or access an attribute on an uninitialized/null object.';
        fix = 'Check that the variable is properly initialized before accessing its properties.';
      } else if (stderr.includes('timed out')) {
        errType = ERROR_TYPES.INFINITE_LOOP;
        what = 'Execution timed out (Infinite Loop).';
        why = 'The loop termination condition is never reached or loop variable is not updated.';
        fix = 'Ensure the loop increment/decrement condition moves towards the exit boundary.';
      } else if (stderr.includes('NameError')) {
        errType = ERROR_TYPES.NAME_ERROR;
        what = 'Name or identifier is not defined.';
        why = 'Referencing a variable or function before declaration or misspelling variable name.';
        fix = 'Verify variable declaration and spelling.';
      }

      const lineMatch = stderr.match(/line (\d+)/i) || stderr.match(/:(\d+):/);
      if (lineMatch) {
        targetLine = parseInt(lineMatch[1], 10);
      }

      issues.push({
        id: `runtime-${issues.length + 1}`,
        type: errType,
        severity: SEVERITY_LEVELS.CRITICAL,
        line: targetLine,
        column: 1,
        message: what,
        explanation: `Runtime crash: ${stderr.slice(0, 140)}`,
        cause: why,
        suggestion: fix,
        correctedCode: null,
        confidence: 0.95,
        source: ERROR_SOURCES.RUNTIME,
      });

      if (primaryErrorType === ERROR_TYPES.NONE) {
        primaryErrorType = errType;
        overallSeverity = SEVERITY_LEVELS.CRITICAL;
        whatHappened = what;
        whereText = `Encountered near line ${targetLine}. Stderr: ${stderr.slice(0, 120)}`;
        whyText = why;
        howToFix = fix;
        relatedConcept = 'Exception Handling & Defensiveness';
      }
    }

    // 3. Gather Logical Discrepancies
    if (expectedOutput && stdout !== expectedOutput) {
      issues.push({
        id: `logic-${issues.length + 1}`,
        type: ERROR_TYPES.LOGICAL_ERROR,
        severity: SEVERITY_LEVELS.HIGH,
        line: 1,
        column: 1,
        message: 'Logical Bug: Output mismatch with expected result.',
        explanation: `Program output ("${stdout}") differs from expected ("${expectedOutput}").`,
        cause: 'The calculation or loop boundary condition logic produces incorrect results.',
        suggestion: 'Verify algorithm step conditions, loop invariants, and formula operations.',
        correctedCode: null,
        confidence: 0.88,
        source: ERROR_SOURCES.TEST_CASE,
      });

      if (primaryErrorType === ERROR_TYPES.NONE) {
        primaryErrorType = ERROR_TYPES.LOGICAL_ERROR;
        overallSeverity = SEVERITY_LEVELS.MEDIUM;
        whatHappened = `Actual output ("${stdout}") did not match expected output ("${expectedOutput}").`;
        whereText = 'Algorithm logic or calculation statement';
        whyText = 'The program runs without crashing, but conditions produce incorrect output values.';
        howToFix = 'Trace variable values step-by-step through each iteration and verify arithmetic formulas.';
        relatedConcept = 'Algorithm Correctness & Tracing';
      }
    }

    // 4. Gather Static Code Quality Warnings
    if (qualityIssues.length > 0) {
      qualityIssues.forEach((q, idx) => {
        issues.push({
          id: `quality-${issues.length + 1}`,
          type: ERROR_TYPES.CODE_QUALITY_ISSUE,
          severity: q.severity || SEVERITY_LEVELS.LOW,
          line: q.line || 1,
          column: 1,
          message: q.message,
          explanation: `Code quality rule "${q.rule || 'BestPractice'}" triggered.`,
          cause: 'Non-idiomatic or suboptimal structure.',
          suggestion: 'Refactor for cleaner maintainability and performance.',
          correctedCode: null,
          confidence: 0.90,
          source: ERROR_SOURCES.STATIC_ANALYZER,
        });
      });
    }

    // Build overall summary
    let summaryText = 'No issues were detected by the available analyzers and tests.';
    if (issues.length > 0) {
      summaryText = `${issues.length} ${issues.length === 1 ? 'issue' : 'issues'} detected across static, runtime, and quality checks.`;
    }

    const firstIssue = issues[0];
    const targetLine = firstIssue?.line || null;

    return JSON.stringify({
      summary: summaryText,
      primaryErrorType: primaryErrorType,
      severity: overallSeverity,
      confidence: CONFIDENCE_LEVELS.HIGH,
      location: { line: targetLine, column: firstIssue?.column || null },
      issues,
      pedagogicalExplanation: {
        whatHappened,
        where: whereText,
        whyDidItHappen: whyText,
        howToFix,
        relatedConcept,
      },
      suggestedFix: {
        isGuaranteed: primaryErrorType === ERROR_TYPES.SYNTAX_ERROR || primaryErrorType === ERROR_TYPES.NONE,
        correctedCode,
        diffDescription,
      },
      stepByStepGuidance: issues.length > 0 ? [
        { stepNumber: 1, instruction: `Inspect issue #1 at line ${targetLine || 1}.`, targetLine: targetLine || 1, isCompleted: false },
        { stepNumber: 2, instruction: `Review the recommended fix and verify variable state.`, targetLine: targetLine || 1, isCompleted: false },
        { stepNumber: 3, instruction: `Re-run code execution to confirm test pass.`, targetLine: targetLine || 1, isCompleted: false },
      ] : [
        { stepNumber: 1, instruction: 'Review the output to verify expected behavior.', targetLine: 1, isCompleted: true },
      ],
      progressiveHints: issues.length > 0 ? [
        { tier: 1, hint: `Check around line ${targetLine || 1} for ${primaryErrorType.toLowerCase().replace('_', ' ')}.`, isRevealed: false },
        { tier: 2, hint: `Examine the syntax and variable definitions on highlighted lines.`, isRevealed: false },
        { tier: 3, hint: howToFix, isRevealed: false },
      ] : [],
      codeQuality: {
        score: Math.max(30, 100 - (issues.length * 12)),
        suggestions: qualityIssues.map(q => q.message).concat(['Keep code modular with clear variable names.']),
      },
      preventionTip: 'Dry-run algorithms with edge cases and keep an eye on compiler warnings.',
      relatedConcepts: [relatedConcept, 'Defensive Programming', 'Unit Testing'],
    });
  }


  async generateMentorResponse(prompt) {
    const questionMatch = prompt.match(/STUDENT'S NEW QUESTION:\s*"([\s\S]*?)"/);
    const question = questionMatch ? questionMatch[1].toLowerCase() : '';

    if (question.includes('hint') || question.includes("don't give me the answer")) {
      return "💡 **Mentor Hint**: Take a close look at the line where the error is reported. Check if all required delimiters (like semicolons, colons, or closing brackets) are in place, and trace the variable types!";
    }

    if (question.includes('why') || question.includes('explain')) {
      return "🎓 **Conceptual Breakdown**:\nIn programming, compilers and interpreters need strict syntax structures to understand statement boundaries and types. When an expected symbol is missing or an operation is illegal (such as dividing by zero or indexing out of bounds), the runtime cannot safely continue and raises an error.";
    }

    if (question.includes('beginner') || question.includes('simple')) {
      return "👋 **Simple Explanation**:\nThink of code like a recipe. If a step says 'put the cake in the oven' but doesn't say which temperature, the kitchen stops! Similarly, the computer needs exact instructions. Check the highlighted line and ensure each instruction is complete.";
    }

    return "🤖 **AI Mentor**: I'm here to guide you through debugging this code! Ask me to explain the error, give you progressive hints, or explain why a specific line behaves the way it does.";
  }
}
