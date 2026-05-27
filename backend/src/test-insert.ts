import { supabase } from './config/supabase.js';

async function inspectUsers() {
  try {
    // 1. Try to fetch a single user to check what columns exist
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
    } else {
      console.log("Single user columns:", user);
    }

    // 2. Try a test insertion with only basic fields
    const testEmail = `test_${Date.now()}@example.com`;
    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: testEmail,
          password: 'hashedpassword123',
          full_name: 'Test User'
        }
      ])
      .select();

    if (insertError) {
      console.error("Insert error with basic fields:", insertError);
    } else {
      console.log("Successfully inserted user:", inserted);
      // Clean up test user
      await supabase.from('users').delete().eq('email', testEmail);
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

inspectUsers();
