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
  const testEmail = `test_no_phone_${Date.now()}@example.com`;
  console.log(`Attempting to insert test user: ${testEmail}`);
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email: testEmail,
        password: 'testpassword123',
        full_name: 'Test No Phone',
        country: 'United Kingdom'
      }
    ])
    .select();
    
  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded! User created:", data);
    // Cleanup
    const { error: delError } = await supabase
      .from('users')
      .delete()
      .eq('email', testEmail);
    console.log("Cleanup delete:", delError ? "Failed" : "Succeeded");
  }
}

checkUsers();
