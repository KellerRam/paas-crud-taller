const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_PUBLIC_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: !connectionString.includes('localhost') ? { rejectUnauthorized: false } : false
    })
  : null;

const initDb = async () => {
  if (!pool) {
    console.log('Base de datos no configurada. La API arrancará en modo degradado hasta definir DATABASE_URL.');
    return;
  }

  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    );
  `;

  try {
    await pool.query(query);
    console.log('Base de datos verificada/inicializada correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
};

const ensureDb = () => {
  if (!pool) {
    const error = new Error('Base de datos no configurada. Define DATABASE_URL antes de usar rutas CRUD.');
    error.statusCode = 503;
    throw error;
  }
  return pool;
};

initDb();

module.exports = { pool, ensureDb, isDbConfigured: () => Boolean(pool) };