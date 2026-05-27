import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'admin_status.json');

if (fs.existsSync(STATUS_FILE)) {
  const data = fs.readFileSync(STATUS_FILE, 'utf-8');
  const statusMap = JSON.parse(data);
  
  for (const email in statusMap) {
    statusMap[email].is_logged_in = false;
    // Don't modify last_logout if they didn't really logout, but setting to offline
  }
  
  fs.writeFileSync(STATUS_FILE, JSON.stringify(statusMap, null, 2), 'utf-8');
  console.log("Reset all admins to offline.");
} else {
  console.log("No admin_status.json found.");
}
