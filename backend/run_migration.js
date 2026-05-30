import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrate() {
  const sql = fs.readFileSync('SQL_STRIPE_MIGRATION.sql', 'utf8');
  console.log("Trying RPC exec_sql");
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  console.log("RPC exec_sql result:", { data, error });
  
  if (error) {
    console.log("Trying to just fetch via pg driver (we don't have connection string). Trying other RPC?");
  }
}

runMigrate();
