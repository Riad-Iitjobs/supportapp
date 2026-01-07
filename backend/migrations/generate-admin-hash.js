/**
 * Helper script to generate bcrypt hash for admin password
 * Usage: node migrations/generate-admin-hash.js <password>
 * Example: node migrations/generate-admin-hash.js admin123
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('\nUsage: node migrations/generate-admin-hash.js <password>');
  console.log('Example: node migrations/generate-admin-hash.js admin123');
  process.exit(1);
}

async function generateHash() {
  try {
    console.log(`\n🔐 Generating hash for password: "${password}"`);
    const hash = await bcrypt.hash(password, 10);
    console.log('\n✅ Generated hash:');
    console.log(hash);
    console.log('\n📝 To update the admin user, run this SQL:');
    console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'admin@supporthub.com';`);
    console.log('');
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

generateHash();
