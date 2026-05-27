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

const allowedAdmins = [
  'jane@tilebazaar.co.uk',
  'admin2@tilebazaar.co.uk',
  'admin3@tilebazaar.co.uk',
  'admin4@tilebazaar.co.uk',
  'admin5@tilebazaar.co.uk'
];

const adminNames = {
  'jane@tilebazaar.co.uk': 'Jane Smith',
  'admin2@tilebazaar.co.uk': 'David Thompson',
  'admin3@tilebazaar.co.uk': 'Admin 3',
  'admin4@tilebazaar.co.uk': 'Admin 4',
  'admin5@tilebazaar.co.uk': 'Jane Smith'
};

async function fixRoles() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role');
    
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  for (const user of data) {
    // 1. If it's one of our 5 admins, ensure the name is correct and role is admin
    if (allowedAdmins.includes(user.email)) {
      const correctName = adminNames[user.email];
      if (user.full_name !== correctName || user.role !== 'admin') {
        console.log(`Updating ${user.email}: name -> ${correctName}, role -> admin`);
        await supabase.from('users').update({ full_name: correctName, role: 'admin' }).eq('id', user.id);
      }
    } else {
      // 2. If it's NOT one of the 5 admins but has role='admin', downgrade to 'customer'
      if (user.role === 'admin') {
        console.log(`Downgrading ${user.email} from admin to customer`);
        await supabase.from('users').update({ role: 'customer' }).eq('id', user.id);
      }
    }
  }
  console.log("Done fixing roles and names.");
}

fixRoles();
