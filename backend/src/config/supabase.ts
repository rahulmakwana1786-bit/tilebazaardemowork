import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';

const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env file (checked SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY)");
}

export const supabase = createClient(supabaseUrl, supabaseKey);