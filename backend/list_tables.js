import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_tables'); // if exists, or check via general query
  if (error) {
    // Try querying pg_catalog
    const { data: tables, error: sqlError } = await supabase.from('pg_tables').select('tablename');
    if (sqlError) {
      console.log("Could not query tables listing:", sqlError);
      // Let's query schema
      const { data: schemas, error: schemaError} = await supabase.rpc('execute_sql', { sql: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';" });
      console.log(schemaError || schemas);
    } else {
      console.log(tables);
    }
  } else {
    console.log(data);
  }
}

run();
