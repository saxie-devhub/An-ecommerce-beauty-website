// make-admin.js - CLI tool to promote any user to Admin
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.json');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.log('❌ Error: Please specify the user email.');
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js saxiemary248@gmail.com');
  process.exit(1);
}

try {
  if (!fs.existsSync(DB_PATH)) {
    console.log('❌ Error: users.json file not found.');
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const users = JSON.parse(raw || '[]');

  const user = users.find((u) => (u.email || '').toLowerCase() === emailToPromote.toLowerCase().trim());

  if (!user) {
    console.log(`❌ User with email "${emailToPromote}" not found in users.json.`);
    console.log('Available emails:');
    users.forEach((u) => console.log(` - ${u.email} (${u.name || 'No name'})`));
    process.exit(1);
  }

  user.role = 'admin';
  user.is_admin = 1;

  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));

  console.log('====================================================');
  console.log(`🎉 SUCCESS: User "${user.name || user.email}" is now an ADMIN!`);
  console.log(`📧 Email:    ${user.email}`);
  console.log(`👑 Role:     admin (is_admin: 1)`);
  console.log('👉 Next: Log out and log back in to refresh the JWT session token.');
  console.log('====================================================');
} catch (err) {
  console.error('Error updating admin status:', err);
}
