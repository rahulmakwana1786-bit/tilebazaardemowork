async function testSwitch() {
  const switchRes = await fetch('http://localhost:5000/api/admin/admins/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin3@tilebazaar.co.uk', password: 'securepassword3' })
  });
  const switchData = await switchRes.json();
  console.log("Switch response:", switchRes.status, switchData);
}
testSwitch();
