// User storage. DATABASE_URL enables PostgreSQL; without it, local JSON is used.
const fs = require('fs');
const path = require('path');
const { isPostgresEnabled, listRecords, mutateRecords } = require('./pgStore');

const DB_PATH = path.join(__dirname, '../users.json');

function readLocalUsers() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    console.error('Unable to read users:', error);
    return [];
  }
}

function writeLocalUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

async function readUsers() {
  return isPostgresEnabled() ? listRecords('users') : readLocalUsers();
}

async function writeUsers(users) {
  if (isPostgresEnabled()) {
    return mutateRecords('users', (records) => records.splice(0, records.length, ...users));
  }
  writeLocalUsers(users);
}

async function findUserByEmail(email) {
  if (!email) return null;
  const users = await readUsers();
  return users.find((user) => (user.email || '').toLowerCase() === email.toLowerCase().trim()) || null;
}

async function findUserById(id) {
  if (!id) return null;
  const users = await readUsers();
  return users.find((user) => String(user.id) === String(id)) || null;
}

async function createUser(user) {
  if (isPostgresEnabled()) {
    return mutateRecords('users', (users) => {
      if (users.some((item) => (item.email || '').toLowerCase() === user.email.toLowerCase())) {
        const error = new Error('An account with this email already exists.');
        error.code = 'USER_EXISTS';
        throw error;
      }
      if (users.length === 0) {
        user.role = 'admin';
        user.is_admin = 1;
      } else if (!user.role) {
        user.role = 'customer';
        user.is_admin = 0;
      }
      users.push(user);
      return user;
    });
  }

  const users = readLocalUsers();
  if (users.length === 0) {
    user.role = 'admin';
    user.is_admin = 1;
  } else if (!user.role) {
    user.role = 'customer';
    user.is_admin = 0;
  }
  users.push(user);
  writeLocalUsers(users);
  return user;
}

async function updateUserProfile(id, updates) {
  delete updates.passwordHash;
  delete updates.id;
  const update = (users) => {
    const index = users.findIndex((user) => String(user.id) === String(id));
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    return users[index];
  };

  if (isPostgresEnabled()) return mutateRecords('users', update);
  const users = readLocalUsers();
  const result = update(users);
  if (result) writeLocalUsers(users);
  return result;
}

module.exports = { readUsers, writeUsers, findUserByEmail, findUserById, createUser, updateUserProfile };
