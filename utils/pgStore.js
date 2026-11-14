const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

const LEGACY_FILES = {
  users: path.join(__dirname, '..', 'users.json'),
  orders: path.join(__dirname, '..', 'data', 'orders.json'),
  products: path.join(__dirname, '..', 'data', 'products.json'),
  payments: path.join(__dirname, '..', 'data', 'payments.json'),
  reviews: path.join(__dirname, '..', 'data', 'reviews.json')
};

function isPostgresEnabled() {
  return Boolean(pool);
}

function recordId(record) {
  const id = record?.checkoutRequestId || record?.id;
  if (id === undefined || id === null || String(id).length === 0) {
    throw new Error('Every database record must have an id.');
  }
  return String(id);
}

async function migrateNamespace(client, namespace, seedRecords = []) {
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [namespace]);
  const countResult = await client.query(
    'SELECT COUNT(*)::int AS count FROM agg_records WHERE namespace = $1',
    [namespace]
  );
  if (countResult.rows[0].count > 0) return;

  let records = [];
  const legacyFile = LEGACY_FILES[namespace];
  if (legacyFile && fs.existsSync(legacyFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(legacyFile, 'utf8') || '[]');
      if (Array.isArray(parsed)) records = parsed;
    } catch (error) {
      console.warn(`Skipping unreadable legacy ${namespace} JSON file:`, error.message);
    }
  }
  if (records.length === 0) records = seedRecords;

  for (let position = 0; position < records.length; position += 1) {
    const record = records[position];
    await client.query(
      `INSERT INTO agg_records (namespace, id, position, payload)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (namespace, id) DO NOTHING`,
      [namespace, recordId(record), position, JSON.stringify(record)]
    );
  }
}

async function initializeStorage() {
  if (!pool) return { backend: 'local-json' };

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agg_records (
      namespace text NOT NULL,
      id text NOT NULL,
      position bigint NOT NULL DEFAULT 0,
      payload jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (namespace, id)
    )
  `);

  const products = require('./productsDb').DEFAULT_PRODUCTS;
  const reviews = require('./reviewsDb').DEFAULT_REVIEWS;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await migrateNamespace(client, 'users');
    await migrateNamespace(client, 'orders');
    await migrateNamespace(client, 'products', products);
    await migrateNamespace(client, 'payments');
    await migrateNamespace(client, 'reviews', reviews);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return { backend: 'postgres' };
}

async function listRecords(namespace) {
  const { rows } = await pool.query(
    'SELECT payload FROM agg_records WHERE namespace = $1 ORDER BY position ASC, updated_at ASC',
    [namespace]
  );
  return rows.map((row) => row.payload);
}

async function getRecord(namespace, id) {
  const { rows } = await pool.query(
    'SELECT payload FROM agg_records WHERE namespace = $1 AND id = $2',
    [namespace, String(id)]
  );
  return rows[0]?.payload || null;
}

async function mutateRecords(namespace, mutator) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [namespace]);
    const { rows } = await client.query(
      'SELECT payload FROM agg_records WHERE namespace = $1 ORDER BY position ASC FOR UPDATE',
      [namespace]
    );
    const records = rows.map((row) => row.payload);
    const result = mutator(records);
    await client.query('DELETE FROM agg_records WHERE namespace = $1', [namespace]);
    for (let position = 0; position < records.length; position += 1) {
      const record = records[position];
      await client.query(
        `INSERT INTO agg_records (namespace, id, position, payload, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, now())`,
        [namespace, recordId(record), position, JSON.stringify(record)]
      );
    }
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  isPostgresEnabled,
  initializeStorage,
  listRecords,
  getRecord,
  mutateRecords
};
