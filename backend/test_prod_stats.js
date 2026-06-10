async function run() {
  try {
    const loginRes = await fetch('https://tilebazaardemowork-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin2@tilebazaar.co.uk',
        password: 'securepassword2'
      })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed');
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const statsRes = await fetch('https://tilebazaardemowork-production.up.railway.app/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const statsData = await statsRes.json();
    console.log('Production Stats Response:', statsData);
  } catch (err) {
    console.error(err);
  }
}

run();
