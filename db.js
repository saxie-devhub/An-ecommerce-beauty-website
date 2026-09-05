// utils/db.js - User Database Helper
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

function readUsers() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function findUserByEmail(email) {
  if (!email) return null;
  const users = readUsers();
  return users.find((user) => (user.email || '').toLowerCase() === email.toLowerCase().trim());
}

function findUserById(id) {
  if (!id) return null;
  const users = readUsers();
  return users.find((user) => String(user.id) === String(id));
}

function createUser(user) {
  const users = readUsers();
  // If first user, make admin automatically for convenience
  if (users.length === 0) {
    user.role = 'admin';
    user.is_admin = 1;
  } else if (!user.role) {
    user.role = 'customer';
    user.is_admin = 0;
  }
  users.push(user);
  writeUsers(users);
  return user;
}

function updateUserProfile(id, updates) {
  const users = readUsers();
  const index = users.findIndex((u) => String(u.id) === String(id));
  if (index === -1) return null;

  // Protect sensitive fields from accidental overwrite
  delete updates.passwordHash;
  delete updates.id;

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeUsers(users);
  return users[index];
}

module.exports = {
  readUsers,
  writeUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile
};