const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('--- Starting Auth API Integration Tests ---');
  let testUserToken = '';
  
  const testUser = {
    username: 'testuser',
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    // 1. Test Health Endpoint
    console.log('\nTest 1: GET /health');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'ok') {
      console.log('✅ Health check passed.');
    } else {
      throw new Error(`Health check failed with status: ${healthRes.status}`);
    }

    // 2. Test Signup with invalid input
    console.log('\nTest 2: POST /api/auth/signup (invalid input)');
    const invalidSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '', email: 'bad-email', password: '123' })
    });
    const invalidSignupData = await invalidSignupRes.json();
    if (invalidSignupRes.status === 400 && invalidSignupData.status === 'error') {
      console.log('✅ Validation rejection passed (400 Bad Request).');
      console.log('   Errors returned:', invalidSignupData.errors);
    } else {
      throw new Error(`Failed to reject invalid signup: status ${invalidSignupRes.status}`);
    }

    // 3. Test Successful Signup
    console.log('\nTest 3: POST /api/auth/signup (successful signup)');
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const signupData = await signupRes.json();
    if (signupRes.status === 201 && signupData.status === 'success') {
      console.log('✅ Signup successful (201 Created).');
      if (signupData.data.token && signupData.data.user.email === testUser.email.toLowerCase()) {
        console.log('✅ Signup returned valid token and user object.');
        testUserToken = signupData.data.token;
      } else {
        throw new Error('Signup response payload missing token or correct user details');
      }
    } else {
      throw new Error(`Signup failed: status ${signupRes.status}, message: ${signupData.message}`);
    }

    // 4. Test Duplicate Email Signup
    console.log('\nTest 4: POST /api/auth/signup (duplicate signup)');
    const duplicateRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const duplicateData = await duplicateRes.json();
    if (duplicateRes.status === 409) {
      console.log('✅ Duplicate user creation rejected (409 Conflict).');
    } else {
      throw new Error(`Failed to reject duplicate signup: status ${duplicateRes.status}`);
    }

    // 5. Test Successful Login
    console.log('\nTest 5: POST /api/auth/login (successful login)');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.status === 'success') {
      console.log('✅ Login successful (200 OK).');
      if (loginData.data.token) {
        console.log('✅ Login returned valid token.');
      } else {
        throw new Error('Login response missing token');
      }
    } else {
      throw new Error(`Login failed: status ${loginRes.status}, message: ${loginData.message}`);
    }

    // 6. Test Login with wrong password
    console.log('\nTest 6: POST /api/auth/login (invalid password)');
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' })
    });
    const badLoginData = await badLoginRes.json();
    if (badLoginRes.status === 401) {
      console.log('✅ Invalid password login rejected (401 Unauthorized).');
    } else {
      throw new Error(`Failed to reject login with bad password: status ${badLoginRes.status}`);
    }

    // 7. Test Protected Route Access without token
    console.log('\nTest 7: GET /api/auth/me (no token)');
    const noTokenRes = await fetch(`${BASE_URL}/api/auth/me`);
    const noTokenData = await noTokenRes.json();
    if (noTokenRes.status === 401) {
      console.log('✅ Protected access without token rejected (401 Unauthorized).');
    } else {
      throw new Error(`Failed to reject anonymous profile request: status ${noTokenRes.status}`);
    }

    // 8. Test Protected Route Access with token
    console.log('\nTest 8: GET /api/auth/me (with token)');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    const meData = await meRes.json();
    if (meRes.status === 200 && meData.status === 'success') {
      console.log('✅ Profile retrieval succeeded (200 OK).');
      if (meData.data.user.username === testUser.username && meData.data.user.email === testUser.email.toLowerCase()) {
        console.log('✅ Profile returned correct user details.');
      } else {
        throw new Error('Profile response email or username mismatch');
      }
    } else {
      throw new Error(`Profile access failed: status ${meRes.status}, message: ${meData.message}`);
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
