import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'admin_status.json');
const LOGS_FILE = path.join(process.cwd(), 'admin_logs.json');

const generateId = () => Math.random().toString(36).substring(2, 11);

const adminNames = {
  'jane@tilebazaar.co.uk': 'Jane Smith',
  'admin2@tilebazaar.co.uk': 'David Thompson',
  'admin3@tilebazaar.co.uk': 'Admin 3',
  'admin4@tilebazaar.co.uk': 'Admin 4',
  'admin5@tilebazaar.co.uk': 'Jane Smith'
};

if (fs.existsSync(STATUS_FILE)) {
  const statusData = fs.readFileSync(STATUS_FILE, 'utf-8');
  const statusMap = JSON.parse(statusData);
  
  let logs = [];
  if (fs.existsSync(LOGS_FILE)) {
    try {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    } catch(e) {}
  }
  
  const now = new Date().toISOString();
  let updated = false;

  for (const email in statusMap) {
    if (statusMap[email].is_logged_in === false && (!statusMap[email].last_logout || statusMap[email].last_logout === null)) {
      statusMap[email].last_logout = now;
      updated = true;
      
      const adminName = adminNames[email] || 'Admin';
      
      logs.unshift({
        id: generateId(),
        admin_email: email,
        admin_name: adminName,
        action: 'LOGOUT',
        details: 'Logged out of the system (Session Closed)',
        page: '/admin/admins',
        created_at: now
      });
      console.log(`Updated logout time for ${email}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusMap, null, 2), 'utf-8');
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    console.log("Status and logs updated successfully.");
  } else {
    console.log("No offline admins needed updating.");
  }
} else {
  console.log("No admin_status.json found.");
}
