import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role');
    
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log(`Found ${data.length} total users.`);
    const admins = data.filter(u => u.role === 'admin');
    console.log(`Found ${admins.length} admins:`, admins);
  }
}

checkUsers();
