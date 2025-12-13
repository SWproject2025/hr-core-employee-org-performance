(async () => {
  try {
    const base = 'http://localhost:3000';
    console.log('Registering user...');
    const regRes = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'E2E',
        lastName: 'Tester',
        nationalId: 'NID-E2E-001',
        employeeNumber: 'E2E-001',
        dateOfHire: new Date().toISOString(),
        personalEmail: 'e2e.tester@example.com',
        password: 'Passw0rd!'
      })
    });
    const reg = await regRes.json();
    console.log('Registered:', reg._id || reg);

    console.log('Logging in...');
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e.tester@example.com', password: 'Passw0rd!' })
    });
    const login = await loginRes.json();
    console.log('Login response:', login);
    const token = login.access_token;
    if (!token) throw new Error('No token returned');

    console.log('Fetching /employee-profile/me');
    let meRes = await fetch(base + '/employee-profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    let me = await meRes.json();
    console.log('Me:', me.profile?.firstName && me.profile.lastName ? `${me.profile.firstName} ${me.profile.lastName}` : me);

    console.log('Changing password...');
    const changeRes = await fetch(base + '/employee-profile/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldPassword: 'Passw0rd!', newPassword: 'NewPass1!' })
    });
    console.log('Change password status:', changeRes.status);

    console.log('Logging in with new password...');
    const loginRes2 = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e.tester@example.com', password: 'NewPass1!' })
    });
    const login2 = await loginRes2.json();
    console.log('New login:', login2);

    console.log('E2E flow completed');
  } catch (err) {
    console.error('E2E error:', err);
    process.exit(1);
  }
})();
