const { createClient } = require('@supabase/supabase-js');

// Bypass SSL certificate validation issues in local development (e.g. corporate proxies/firewalls)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

const connectDB = async () => {
  try {
    // A quick check to see if the connection works (we query the users table)
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine. Other errors mean connection failed.
      throw error;
    }
    console.log('✅ Supabase PostgreSQL connected successfully.');
  } catch (error) {
    console.error(`❌ Supabase Connection Error: ${error.message}`);
    // We don't exit the process immediately so the user can configure their credentials,
    // but we log the error.
  }
};

module.exports = { connectDB, supabase };
