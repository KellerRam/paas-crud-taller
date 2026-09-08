const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    );
  `;
  try {
    await pool.query(query);
    console.log("Base de datos verificada/inicializada correctamente.");
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err);
  }
};

initDb();

module.exports = pool;