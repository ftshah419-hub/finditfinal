import http from 'http';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import User from '../src/models/User.js';
import ActivityLog from '../src/models/ActivityLog.js';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('='.repeat(70));
  console.log('  FINDIT — Full Authentication & Authorization Test Suite');
  console.log('='.repeat(70));

  // 1. Connect to database
  console.log('\n[1] Connecting to MongoDB Atlas:');
  const conn = await connectDB();
  assert(conn.name === 'findit', 'Connected to the target database: findit');

  // 2. Start HTTP server on dynamic port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;
  console.log(`\n[2] Test HTTP Server running on port ${port}`);

  const testEmail = `test_auth_${Date.now()}@example.org`;
  const testPassword = 'Password123!';
  let authTokenCookie = '';
  let authBearerToken = '';
  let testUserId = null;

  try {
    // ── Test 1: Register New User ─────────────────────────────────────────
    console.log('\n[3] Testing User Registration:');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Candidate',
        email: testEmail,
        password: testPassword,
        role: 'ADMIN' // Malicious attempt to self-assign ADMIN
      })
    });

    const regData = await regRes.json();
    assert(regRes.status === 201, 'Registration returns HTTP 201 Created');
    assert(regData.success === true, 'Response envelope has success: true');
    assert(regData.data.user.role === 'USER', 'Registration strictly assigns role USER, ignoring client input');
    assert(regData.data.user.password === undefined, 'Response does not contain password or hash');
    assert(regData.data.token, 'Registration returns JWT token');

    testUserId = regData.data.user.id;
    authBearerToken = regData.data.token;

    // Check Set-Cookie header
    const setCookie = regRes.headers.get('set-cookie');
    assert(Boolean(setCookie && setCookie.includes('findit_token=')), 'Set-Cookie header sets findit_token');
    assert(Boolean(setCookie && setCookie.includes('HttpOnly')), 'Cookie has HttpOnly flag');
    if (setCookie) {
      authTokenCookie = setCookie.split(';')[0];
    }

    // ── Test 2: Duplicate Registration ────────────────────────────────────
    console.log('\n[4] Testing Duplicate Email Registration:');
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testEmail,
        password: testPassword
      })
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 409, 'Duplicate registration returns HTTP 409 Conflict');
    assert(dupData.errorCode === 'EMAIL_ALREADY_EXISTS', 'Duplicate registration returns errorCode EMAIL_ALREADY_EXISTS');

    // ── Test 3: Invalid Email Validation ──────────────────────────────────
    console.log('\n[5] Testing Validation Rules:');
    const invalidEmailRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'invalid-email-address',
        password: 'validPassword123'
      })
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert(invalidEmailRes.status === 422, 'Invalid email returns HTTP 422 Unprocessable Entity');
    assert(invalidEmailData.errorCode === 'VALIDATION_ERROR', 'Invalid email returns errorCode VALIDATION_ERROR');

    // ── Test 4: Password Hashing Verification in MongoDB ──────────────────
    console.log('\n[6] Verifying Stored Password Hash in MongoDB:');
    const dbUser = await User.findById(testUserId).select('+password');
    assert(Boolean(dbUser), 'User record exists in MongoDB');
    assert(dbUser.password !== testPassword, 'Stored password is NOT plain text');
    assert(dbUser.password.startsWith('$2'), 'Stored password is a valid bcrypt hash ($2...)');

    // ── Test 5: Login with Correct Credentials ────────────────────────────
    console.log('\n[7] Testing User Login:');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        rememberMe: true
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Login returns HTTP 200 OK');
    assert(loginData.success === true, 'Login response has success: true');
    assert(loginData.data.user.email === testEmail.toLowerCase(), 'Login returns matching normalized email');
    assert(loginData.data.user.password === undefined, 'Login response does not expose password hash');

    const loginSetCookie = loginRes.headers.get('set-cookie');
    assert(Boolean(loginSetCookie && loginSetCookie.includes('findit_token=')), 'Login sets findit_token cookie');

    // ── Test 6: Login with Incorrect Password ─────────────────────────────
    console.log('\n[8] Testing Login with Wrong Password:');
    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'CompletelyWrongPassword!'
      })
    });
    const wrongPassData = await wrongPassRes.json();
    assert(wrongPassRes.status === 401, 'Wrong password returns HTTP 401 Unauthorized');
    assert(wrongPassData.message === 'Invalid email or password.', 'Generic error message masks password failure');
    assert(wrongPassData.errorCode === 'INVALID_CREDENTIALS', 'Returns errorCode INVALID_CREDENTIALS');

    // ── Test 7: Login with Unregistered Email ─────────────────────────────
    console.log('\n[9] Testing Login with Non-Existent Account:');
    const nonExistRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unregistered_ghost_user@example.org',
        password: 'SomePassword123!'
      })
    });
    const nonExistData = await nonExistRes.json();
    assert(nonExistRes.status === 401, 'Unregistered email returns HTTP 401 Unauthorized');
    assert(nonExistData.message === 'Invalid email or password.', 'Identical generic message prevents account enumeration');

    // ── Test 8: Get Current User (/auth/me) ───────────────────────────────
    console.log('\n[10] Testing Current User Endpoint (/auth/me):');
    // Without authentication
    const unauthMeRes = await fetch(`${baseUrl}/auth/me`);
    assert(unauthMeRes.status === 401, '/auth/me without token returns HTTP 401');

    // With Cookie
    const cookieMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: authTokenCookie }
    });
    const cookieMeData = await cookieMeRes.json();
    assert(cookieMeRes.status === 200, '/auth/me with secure cookie returns HTTP 200 OK');
    assert(cookieMeData.data.user.email === testEmail.toLowerCase(), 'Profile matches authenticated user');

    // With Bearer Header
    const headerMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authBearerToken}` }
    });
    assert(headerMeRes.status === 200, '/auth/me with Bearer token header returns HTTP 200 OK');

    // With Invalid Token
    const invalidTokenRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' }
    });
    assert(invalidTokenRes.status === 401, 'Invalid JWT returns HTTP 401 Unauthorized');

    // ── Test 9: Authorization & Role Guard ────────────────────────────────
    console.log('\n[11] Testing Role-Based Authorization:');
    // 1. Regular USER attempts to access admin route
    const userAdminRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Cookie: authTokenCookie }
    });
    assert(userAdminRes.status === 403, 'USER accessing admin endpoint returns HTTP 403 Forbidden');

    // 2. Manually promote user to ADMIN in MongoDB (simulating Atlas manual role promotion)
    await User.findByIdAndUpdate(testUserId, { role: 'ADMIN' });
    console.log('  [INFO] Manually promoted user role to ADMIN in MongoDB');

    // 3. Retry admin route - fresh database role check should immediately permit access!
    const adminAccessRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Cookie: authTokenCookie }
    });
    assert(adminAccessRes.status === 200, 'ADMIN accessing admin endpoint returns HTTP 200 OK after role promotion');

    // ── Test 10: Account Deactivation ─────────────────────────────────────
    console.log('\n[12] Testing Account Deactivation Handling:');
    await User.findByIdAndUpdate(testUserId, { isActive: false });
    console.log('  [INFO] Deactivated user account in MongoDB (isActive = false)');

    const deactLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    assert(deactLoginRes.status === 403, 'Login with deactivated account returns HTTP 403 Forbidden');

    const deactMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: authTokenCookie }
    });
    assert(deactMeRes.status === 403, 'Request with deactivated account returns HTTP 403 Forbidden');

    // ── Test 11: Logout ───────────────────────────────────────────────────
    console.log('\n[13] Testing Logout:');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: authTokenCookie }
    });
    assert(logoutRes.status === 200, 'Logout returns HTTP 200 OK');

    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert(Boolean(logoutCookie && (logoutCookie.includes('findit_token=;') || logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires='))),
      'Logout clears the authentication cookie'
    );

  } finally {
    // ── Cleanup ───────────────────────────────────────────────────────────
    console.log('\n[14] Cleaning up Test Artifacts:');
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      await ActivityLog.deleteMany({ actorId: testUserId });
      console.log('  [CLEANUP] Deleted ephemeral test user and related logs from MongoDB.');
    }
    server.close();
    await disconnectDB();
  }

  // ── Results Summary ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  if (failed === 0) {
    console.log(`  ALL ${passed} AUTHENTICATION & AUTHORIZATION TESTS PASSED!`);
    console.log('  Zero failures. Complete compliance verified.');
  } else {
    console.error(`  ${failed} TESTS FAILED out of ${passed + failed}:`);
    failures.forEach((f, i) => console.error(`    ${i + 1}. ${f}`));
  }
  console.log('='.repeat(70) + '\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTestSuite().catch((err) => {
  console.error('[Fatal Test Error]:', err);
  process.exit(1);
});
