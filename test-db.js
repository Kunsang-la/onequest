import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Query to get columns for the quests table
  const { data: cols, error: err1 } = await supabase.rpc('get_schema_info', {}); // if exists, but we can just use the standard REST if we have access, else we can't easily.
  // Actually, we can just insert and see what fails, or we can check the error using standard Postgres if we had the connection string, but we only have anon key.
  
  // Let's just try to fetch a single quest to see what columns it has.
  const { data, error } = await supabase.from('quests').select('*').limit(1);
  console.log("Columns from data:", data ? Object.keys(data[0] || {}) : error);
}

check();
