import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { PracticeService } from '../../src/services/practiceService.js';

describe('AI Debugging Mentor - Practice Module Integration Tests', () => {
  let server;
  let baseUrl;
  let authToken;
  let userEmail = `practice_coder_${Date.now()}@domain.com`;

  before(async () => {
    await connectDB();
    await PracticeService.seedInitialProblems();

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Register test user
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Practice Coder',
        email: userEmail,
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    authToken = data.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
  });

  test('TEST 1: Fetch list of practice problems returns all 7 seeded problems', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count, 7);
    assert.ok(Array.isArray(data.problems));
    assert.strictEqual(data.problems[0].slug, 'sum-of-two-numbers');
    // Ensure hidden test cases are not leaked
    assert.strictEqual(data.problems[0].hiddenTestCases, undefined);
  });

  test('TEST 2: Problem detail by slug returns problem data without hidden test cases', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems/prime-number`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.problem.title, 'Prime Number');
    assert.strictEqual(data.problem.topic, 'Number Theory');
    assert.strictEqual(data.problem.hiddenTestCases, undefined);
    assert.ok(data.problem.exampleCases.length > 0);
    assert.ok(data.problem.starterCode.python.length > 0);
  });

  test('TEST 3: Filter problems by topic', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems?topic=Conditions`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.problems.length >= 3);
    data.problems.forEach((p) => assert.strictEqual(p.topic, 'Conditions'));
  });

  test('TEST 4: Run Code executes against sample test cases and passes for correct Python code', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems/sum-of-two-numbers/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        sourceCode: `a, b = map(int, input().split())\nprint(a + b)`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, 'Accepted');
    assert.strictEqual(data.allPassed, true);
    assert.strictEqual(data.passedTestCases, data.totalTestCases);
  });

  test('TEST 5: Run Code returns Wrong Answer for faulty code and includes diagnostics', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems/sum-of-two-numbers/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        sourceCode: `a, b = map(int, input().split())\nprint(a * b)`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Wrong Answer');
    assert.strictEqual(data.allPassed, false);
  });

  test('TEST 6: Submitting code without token is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems/sum-of-two-numbers/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        sourceCode: `a, b = map(int, input().split())\nprint(a + b)`,
      }),
    });
    assert.strictEqual(res.status, 401);
  });

  test('TEST 7: Authenticated submission of correct solution passes all hidden tests and marks Accepted', async () => {
    const res = await fetch(`${baseUrl}/api/practice/problems/sum-of-two-numbers/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: `a, b = map(int, input().split())\nprint(a + b)`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
    assert.strictEqual(data.passedTestCases, data.totalTestCases);
    assert.ok(data.submissionId);
  });

  test('TEST 8: Problem 2 (Prime Number) submission test', async () => {
    const solution = `def is_prime(n):
    if n <= 1: return False
    if n <= 3: return True
    if n % 2 == 0 or n % 3 == 0: return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0: return False
        i += 6
    return True

n = int(input().strip())
print("Prime" if is_prime(n) else "Not Prime")`;

    const res = await fetch(`${baseUrl}/api/practice/problems/prime-number/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: solution,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
  });

  test('TEST 9: Problem 3 (Odd or Even) submission test', async () => {
    const solution = `n = int(input().strip())\nprint("Even" if n % 2 == 0 else "Odd")`;
    const res = await fetch(`${baseUrl}/api/practice/problems/odd-or-even/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: solution,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
  });

  test('TEST 10: Problem 4 (Leap Year) submission test', async () => {
    const solution = `def is_leap(y):
    return (y % 400 == 0) or (y % 4 == 0 and y % 100 != 0)

y = int(input().strip())
print("Leap Year" if is_leap(y) else "Not a Leap Year")`;
    const res = await fetch(`${baseUrl}/api/practice/problems/leap-year/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: solution,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
  });

  test('TEST 11: Problem 5 (Largest of Three Numbers) submission test', async () => {
    const solution = `a, b, c = map(int, input().split())\nprint(max(a, b, c))`;
    const res = await fetch(`${baseUrl}/api/practice/problems/largest-of-three-numbers/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: solution,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
  });

  test('TEST 12: Problem 6 (Factorial) submission test', async () => {
    const solution = `def fact(n):
    res = 1
    for i in range(2, n + 1):
        res *= i
    return res

n = int(input().strip())
print(fact(n))`;
    const res = await fetch(`${baseUrl}/api/practice/problems/factorial/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: solution,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
  });

  test('TEST 13: Problem 7 (Multiplication Table) submission test', async () => {
    const solution = `n = int(input().strip())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")`;
    const res = await fetch(`${baseUrl}/api/practice/problems/multiplication-table/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: solution,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'Accepted');
  });

  test('TEST 14: User Progress computes real solved count and percentage accurately', async () => {
    const res = await fetch(`${baseUrl}/api/practice/progress`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.progress.totalProblems, 7);
    assert.strictEqual(data.progress.solvedCount, 7);
    assert.strictEqual(data.progress.completionPercentage, 100);
    assert.ok(data.progress.recentSubmissions.length > 0);
  });

  test('TEST 15: Submissions list endpoint returns user submissions', async () => {
    const res = await fetch(`${baseUrl}/api/practice/submissions`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.submissions.length >= 7);
  });
});
