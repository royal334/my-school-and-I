import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

console.log("Testing Supabase connection...");
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "Key (first 20 chars):",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase error:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();