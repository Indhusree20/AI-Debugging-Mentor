import { Recommendation } from '../models/Recommendation.js';
import { LearningAnalytics } from '../models/LearningAnalytics.js';

export class RecommendationService {
  /**
   * Evaluate user mistake patterns and populate personalized practice recommendations
   * @param {string} userId
   */
  async updateRecommendationsForUser(userId) {
    const analytics = await LearningAnalytics.findOne({ userId });
    if (!analytics) return [];

    const existingRecs = await Recommendation.find({ userId, isCompleted: false });
    const existingTopics = new Set(existingRecs.map(r => r.topic));

    const recommendationsToCreate = [];

    // Rule 1: High Syntax Errors
    if (analytics.errorTypeFrequency.SYNTAX_ERROR >= 3 && !existingTopics.has('Statement Syntax & Punctuation')) {
      recommendationsToCreate.push({
        userId,
        topic: 'Statement Syntax & Punctuation',
        category: 'SYNTAX_BASICS',
        reason: `You encountered ${analytics.errorTypeFrequency.SYNTAX_ERROR} syntax errors in recent sessions.`,
        recommendedAction: 'Practice code structure, statement termination (semicolons/colons), and brace matching.',
        samplePracticeProblem: {
          title: 'Syntax Mastery Challenge',
          description: 'Fix the syntax errors in this snippet to make it compile and print the output successfully.',
          language: 'python',
          starterCode: 'def greet(name)\n    print("Hello " + name\n\ngreet("Coder")',
          expectedOutput: 'Hello Coder',
        },
      });
    }

    // Rule 2: High Index Errors
    if (analytics.errorTypeFrequency.INDEX_ERROR >= 2 && !existingTopics.has('Arrays and Index Boundaries')) {
      recommendationsToCreate.push({
        userId,
        topic: 'Arrays and Index Boundaries',
        category: 'ARRAYS',
        reason: 'Multiple array/list index out-of-range exceptions detected.',
        recommendedAction: 'Master 0-indexed arrays, loop bounds (< length vs <= length), and defensive length checks.',
        samplePracticeProblem: {
          title: 'Array Range Safety',
          description: 'Fix the loop boundary so the program sums all elements without crashing with an IndexError.',
          language: 'python',
          starterCode: 'numbers = [10, 20, 30, 40]\ntotal = 0\nfor i in range(len(numbers) + 1):\n    total += numbers[i]\nprint(total)',
          expectedOutput: '100',
        },
      });
    }

    // Rule 3: High Logical Errors or Off-by-one
    if (analytics.errorTypeFrequency.LOGICAL_ERROR >= 2 && !existingTopics.has('Loop Conditions & Invariants')) {
      recommendationsToCreate.push({
        userId,
        topic: 'Loop Conditions & Invariants',
        category: 'LOOPS',
        reason: 'Identified recurring logical calculation mismatches.',
        recommendedAction: 'Practice tracing algorithm variables and setting exact loop termination conditions.',
        samplePracticeProblem: {
          title: 'Accumulator Loop Logic',
          description: 'The function should calculate the sum of numbers from 1 to N inclusive. Fix the logic bug.',
          language: 'python',
          starterCode: 'def sum_to_n(n):\n    total = 0\n    for i in range(n):\n        total += i\n    return total\n\nprint(sum_to_n(5))',
          expectedOutput: '15',
        },
      });
    }

    // Rule 4: Null references
    if (analytics.errorTypeFrequency.NULL_REFERENCE >= 1 && !existingTopics.has('Null Pointer Safety & Initialization')) {
      recommendationsToCreate.push({
        userId,
        topic: 'Null Pointer Safety & Initialization',
        category: 'POINTERS_REFERENCES',
        reason: 'Encountered null reference or uninitialized object crashes.',
        recommendedAction: 'Always initialize objects before calling methods and use guard clauses.',
        samplePracticeProblem: {
          title: 'Defensive Null Check',
          description: 'Add a guard condition to prevent accessing string length on null/None values.',
          language: 'python',
          starterCode: 'def get_length(s):\n    return len(s)\n\nprint(get_length(None))',
          expectedOutput: '0',
        },
      });
    }

    if (recommendationsToCreate.length > 0) {
      await Recommendation.insertMany(recommendationsToCreate);
    }

    return Recommendation.find({ userId }).sort({ createdAt: -1 });
  }
}

export const recommendationService = new RecommendationService();
