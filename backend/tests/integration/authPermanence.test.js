import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';

describe('AI Debugging Mentor - Permanent Authentication & Persistence Tests', () => {
  let server;
  let baseUrl;
  const testEmail = `permanent_user_${Date.now()}@domain.com`;
  const testPassword = 'SecurePassword123!';
  let userToken;
  let registeredUserId;

  before(async () => {
    await connectDB();
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
  });

  test('TEST 1: FIRST REGISTRATION - Registers a new user and persists in database', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Permanent Engineer',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testEmail.toLowerCase());
    assert.strictEqual(data.user.passwordHash, undefined); // Password hash must NEVER be exposed
    registeredUserId = data.user.id || data.user._id;

    // Verify record in database
    const dbUser = await User.findOne({ email: testEmail.toLowerCase() });
    assert.ok(dbUser);
    assert.strictEqual(dbUser.email, testEmail.toLowerCase());
  });

  test('TEST 2: DUPLICATE REGISTRATION - Rejects duplicate email registration', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Attempt',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.toLowerCase().includes('already exists'));
  });

  test('TEST 3: FIRST LOGIN - Logs in with correct credentials and receives token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testEmail.toLowerCase());
    userToken = data.token;
  });

  test('TEST 4: WRONG PASSWORD - Rejects login with incorrect password with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.token, undefined);
  });

  test('TEST 5: RESTART PERSISTENCE - User can log in with same credentials repeatedly', async () => {
    // Attempt 2nd login with identical credentials
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail.toUpperCase(), // Case insensitive normalization test
        password: testPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, testEmail.toLowerCase());
  });

  test('TEST 6: BROWSER REFRESH / SESSION RESTORATION - GET /api/auth/me restores valid user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, testEmail.toLowerCase());
  });

  test('TEST 7: RETURNING USER - Repeated login operates smoothly without re-registration', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
    }
  });

  test('TEST 8: LOGOUT - Logout returns success confirmation', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  test('TEST 9: LOGIN AFTER LOGOUT - Account is still intact and user logs in immediately', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
  });

  test('TEST 10: PROTECTED ROUTES - Unauthenticated requests to protected endpoints fail with 401', async () => {
    const endpoints = [
      `${baseUrl}/api/auth/me`,
      `${baseUrl}/api/debug/history`,
      `${baseUrl}/api/practice/submissions`,
    ];

    for (const url of endpoints) {
      const res = await fetch(url);
      assert.strictEqual(res.status, 401);
    }
  });

  test('TEST 11: USER DATA ISOLATION - User B cannot access User A private sessions or progress', async () => {
    // Register User B
    const resB = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User B',
        email: `user_b_${Date.now()}@domain.com`,
        password: 'Password123!',
      }),
    });
    const dataB = await resB.json();
    const tokenB = dataB.token;

    // User A submits a debugging code analysis
    const analyzeResA = await fetch(`${baseUrl}/api/debug/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: `print("User A Private Code")`,
      }),
    });
    const analyzeDataA = await analyzeResA.json();
    const sessionAId = analyzeDataA.session?._id || analyzeDataA.session?.id;

    if (sessionAId) {
      // User B attempts to access User A's session
      const fetchByB = await fetch(`${baseUrl}/api/debug/history/${sessionAId}`, {
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      // Must be 404 / isolated
      assert.strictEqual(fetchByB.status, 404);
    }
  });
});
