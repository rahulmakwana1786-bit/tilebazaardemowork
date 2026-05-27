import fs from 'fs/promises';
import path from 'path';

const LOGS_FILE = path.join(process.cwd(), 'admin_logs.json');
const STATUS_FILE = path.join(process.cwd(), 'admin_status.json');

// Helper to generate a random ID (matching the format in logs like 'x3ad12ci9')
const generateId = () => Math.random().toString(36).substring(2, 11);

export const logAdminAction = async (
  email: string,
  name: string,
  action: string,
  details: string,
  page: string = '/admin'
) => {
  try {
    let logs: any[] = [];
    try {
      const data = await fs.readFile(LOGS_FILE, 'utf-8');
      logs = JSON.parse(data);
    } catch (e) {
      // If file doesn't exist or is invalid JSON, keep empty array
    }

    const newLog = {
      id: generateId(),
      admin_email: email,
      admin_name: name,
      action,
      details,
      page,
      created_at: new Date().toISOString()
    };

    // Prepend to show newest first
    logs.unshift(newLog);

    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write admin log:', err);
  }
};

export const updateAdminStatus = async (
  email: string,
  isLoggedIn: boolean
) => {
  try {
    let statusMap: Record<string, any> = {};
    try {
      const data = await fs.readFile(STATUS_FILE, 'utf-8');
      statusMap = JSON.parse(data);
    } catch (e) {
      // Keep empty map if read fails
    }

    const now = new Date().toISOString();
    if (!statusMap[email]) {
      statusMap[email] = {
        email,
        is_logged_in: isLoggedIn,
        last_login: isLoggedIn ? now : null,
        last_logout: !isLoggedIn ? now : null
      };
    } else {
      statusMap[email] = {
        ...statusMap[email],
        is_logged_in: isLoggedIn,
        last_login: isLoggedIn ? now : statusMap[email].last_login,
        last_logout: !isLoggedIn ? now : statusMap[email].last_logout
      };
    }

    await fs.writeFile(STATUS_FILE, JSON.stringify(statusMap, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to update admin status:', err);
  }
};
