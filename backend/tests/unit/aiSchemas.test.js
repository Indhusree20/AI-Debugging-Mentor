import { test, describe } from 'node:test';
import assert from 'node:assert';
import { aiService } from '../../src/ai/AIService.js';

describe('AI Debugging Engine Schema Tests', () => {
  test('AI Service parses Python syntax error into structured pedagogical schema', async () => {
    const result = await aiService.analyzeCode({
      language: 'python',
      sourceCode: 'def greet(name)\n    print(name)',
      experienceLevel: 'BEGINNER',
      mode: 'LEARN_MODE',
      deterministicAnalysis: {
        hasSyntaxError: true,
        syntaxErrors: [{ line: 1, column: 15, message: "expected ':'" }],
      },
    });

    assert.ok(result.summary);
    assert.strictEqual(result.primaryErrorType, 'SYNTAX_ERROR');
    assert.ok(result.pedagogicalExplanation.whatHappened);
    assert.ok(result.pedagogicalExplanation.whyDidItHappen);
    assert.ok(result.pedagogicalExplanation.howToFix);
    assert.ok(result.suggestedFix.correctedCode);
    assert.ok(Array.isArray(result.stepByStepGuidance));
    assert.ok(Array.isArray(result.progressiveHints));
  });

  test('AI Mentor responds to student conceptual questions', async () => {
    const response = await aiService.mentorChat({
      language: 'python',
      sourceCode: 'print(10 / 0)',
      userMessage: 'Why did my code crash with ZeroDivisionError?',
      experienceLevel: 'BEGINNER',
    });

    assert.ok(typeof response === 'string');
    assert.ok(response.length > 20);
  });
});
