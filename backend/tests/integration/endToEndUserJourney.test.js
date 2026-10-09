import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';

describe('AI Debugging Mentor - End to End User Journey & System Tests', () => {
  let server;
  let baseUrl = '';
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let sessionAId = '';

  const userAData = {
    name: 'User Alpha',
    email: `alpha_${Date.now()}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    experienceLevel: 'BEGINNER',
    preferredLanguages: ['python'],
  };

  const userBData = {
    name: 'User Beta',
    email: `beta_${Date.now()}@example.com`,
    password: 'Password456!',
    confirmPassword: 'Password456!',
    experienceLevel: 'INTERMEDIATE',
    preferredLanguages: ['java', 'cpp'],
  };

  before(async () => {
    await connectDB();
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      server.close();
    }
    await disconnectDB();
  });

  // TEST 1: New user registration
  test('TEST 1: New user registration creates account in MongoDB', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    assert.strictEqual(body.user.email, userAData.email.toLowerCase());
    userAToken = body.token;
    userAId = body.user.id;
  });

  // TEST 2: Register same email again
  test('TEST 2: Duplicate registration with same email is rejected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
    assert.match(body.message, /already exists/i);
  });

  // TEST 3: Login with correct password
  test('TEST 3: Login with correct credentials succeeds', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAData.email,
        password: userAData.password,
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    userAToken = body.token;
  });

  // TEST 4: Login with incorrect password
  test('TEST 4: Login with incorrect password is rejected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAData.email,
        password: 'WrongPassword999!',
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.success, false);
    assert.match(body.message, /invalid email or password/i);
  });

  // TEST 5: Session hydration / User profile endpoint (GET /api/auth/me)
  test('TEST 5: GET /api/auth/me restores authenticated session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.email, userAData.email.toLowerCase());
  });

  // TEST 6: Protected endpoint access without token
  test('TEST 6: Unauthenticated request to protected route is rejected', async () => {
    const res = await fetch(`${baseUrl}/api/debug/history`);
    assert.strictEqual(res.status, 401);
  });

  // Register User B for isolation testing
  test('Setup: Register User B', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBData),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    userBToken = body.token;
    userBId = body.user.id;
  });

  // TEST 7: Submit valid Python code
  test('TEST 7: Submit valid Python code returns execution output and zero errors', async () => {
    const res = await fetch(`${baseUrl}/api/debug/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        sourceCode: 'print("Hello, AI Debugging Mentor!")',
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.result.stdout.includes('Hello, AI Debugging Mentor!'));
    assert.strictEqual(body.result.exitCode, 0);
  });

  // TEST 8: Submit code with syntax error
  test('TEST 8: Submit code with syntax error identifies error location and explanation', async () => {
    const res = await fetch(`${baseUrl}/api/debug/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: 'def calculate(scores)\n    return sum(scores)',
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.session.aiAnalysis.primaryErrorType, 'SYNTAX_ERROR');
    assert.ok(body.session.aiAnalysis.location.line);
    sessionAId = body.sessionId;
  });

  // TEST 9: Submit code with multiple errors
  test('TEST 9: Submit code with multiple problems returns multiple detectable issues', async () => {
    const codeWithMultipleIssues = `# Python with multiple issues:
def bad_function(a, b)
    x = 10
    y = 20
    # unused variables and division by zero risk
    return a / 0
`;
    const res = await fetch(`${baseUrl}/api/debug/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: codeWithMultipleIssues,
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.session.aiAnalysis.issues.length >= 1);
  });

  // TEST 10: Submit code with runtime error
  test('TEST 10: Submit code with runtime crash returns structured exception analysis', async () => {
    const res = await fetch(`${baseUrl}/api/debug/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: 'items = [1, 2, 3]\nprint(items[10])',
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    const issues = body.session.aiAnalysis.issues;
    const hasIndexOrRuntime = issues.some(i => i.type === 'INDEX_ERROR' || i.type === 'RUNTIME_ERROR');
    assert.ok(hasIndexOrRuntime || body.session.aiAnalysis.primaryErrorType === 'INDEX_ERROR');
  });

  // TEST 11: Submit code with logical mismatch
  test('TEST 11: Submit code with logical discrepancy detects logical error', async () => {
    const res = await fetch(`${baseUrl}/api/debug/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: 'def add(a, b):\n    return a - b\n\nprint(add(5, 3))',
        expectedOutput: '8',
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    const issues = body.session.aiAnalysis.issues;
    const hasLogical = issues.some(i => i.type === 'LOGICAL_ERROR') || body.session.aiAnalysis.primaryErrorType === 'LOGICAL_ERROR';
    assert.ok(hasLogical);
  });

  // TEST 12: Test case runner system
  test('TEST 12: Run multiple test cases verifies Passed and Failed cases', async () => {
    const res = await fetch(`${baseUrl}/api/debug/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: 'import sys\nval = int(sys.stdin.read().strip())\nprint(val * 2)',
        testCases: [
          { input: '4', expectedOutput: '8' },
          { input: '5', expectedOutput: '11' }, // Intentional mismatch
        ],
      }),
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.results.length, 2);
    assert.strictEqual(body.results[0].passed, true);
    assert.strictEqual(body.results[1].passed, false);
  });


  // TEST 13: History retrieval
  test('TEST 13: User can retrieve their own debugging history', async () => {
    const res = await fetch(`${baseUrl}/api/debug/history`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.sessions.length > 0);
  });

  // TEST 14: User Data Isolation (User B cannot access User A session)
  test('TEST 14: User Data Isolation - User B cannot retrieve User A debugging session', async () => {
    assert.ok(sessionAId, 'Session A must exist');

    const res = await fetch(`${baseUrl}/api/debug/history/${sessionAId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(body.success, false);
  });
});

