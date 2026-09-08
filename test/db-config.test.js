const test = require('node:test');
const assert = require('node:assert/strict');

const dbModulePath = require.resolve('../database.js');

delete process.env.DATABASE_URL;
delete process.env.DATABASE_PRIVATE_URL;
delete process.env.DATABASE_PUBLIC_URL;
delete require.cache[dbModulePath];

test('database module should be null-safe when no DATABASE_URL is configured', () => {
  const database = require('../database.js');

  assert.equal(database.pool, null, 'Expected the Pool to be null when no database URL is configured');
  assert.equal(typeof database.ensureDb, 'function', 'Expected ensureDb to exist');
  assert.equal(typeof database.isDbConfigured, 'function', 'Expected isDbConfigured to exist');
});
