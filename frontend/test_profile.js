async function testProfile() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin2@tilebazaar.co.uk', password: 'securepassword2' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileRes.json();
  
  console.log("Profile response:", profileRes.status, profileData);
}

testProfile();
