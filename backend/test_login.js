fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin2@tilebazaar.co.uk',
    password: 'securepassword2'
  })
}).then(r => r.json().then(data => ({status: r.status, data})))
  .then(console.log)
  .catch(console.error);
