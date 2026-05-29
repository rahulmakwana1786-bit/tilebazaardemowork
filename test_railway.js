async function checkRailway() {
  const loginRes = await fetch('https://tilebazaardemowork-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin2@tilebazaar.co.uk', password: 'securepassword2' })
  });
  const loginData = await loginRes.json();
  console.log("Railway login for admin2:", loginRes.status, loginData);
}
checkRailway();
