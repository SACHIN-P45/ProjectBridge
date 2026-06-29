const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@projectbridge.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in the environment.');
  process.exit(1);
}

// Bypass SSL certificate validation issues in local development (if any)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

async function seedAdmin() {
  try {
    console.log('⏳ Seeding admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail.toLowerCase().trim())
      .maybeSingle();
      
    if (fetchError) {
      throw fetchError;
    }
    
    let result;
    if (existingUser) {
      console.log(`🔄 Admin user with email "${adminEmail}" already exists. Updating password, role, and verification status...`);
      const { data, error } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          role: 'admin',
          is_verified: true,
          name: 'Admin User'
        })
        .eq('id', existingUser.id)
        .select();
        
      if (error) throw error;
      result = data;
    } else {
      console.log(`➕ Admin user with email "${adminEmail}" not found. Creating new admin...`);
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: 'Admin User',
          email: adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          role: 'admin',
          is_verified: true
        })
        .select();
        
      if (error) throw error;
      result = data;
    }
    
    console.log('✅ Admin user seeded successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
