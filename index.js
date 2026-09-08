const express = require('express');
const cors = require('cors');
const { pool, ensureDb, isDbConfigured } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '¡API funcionando correctamente en el PaaS!',
    database: isDbConfigured() ? 'configured' : 'not-configured'
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    database: isDbConfigured() ? 'configured' : 'not-configured'
  });
});

app.post('/tasks', async (req, res) => {
  try {
    const db = ensureDb();
    const { title } = req.body;
    const newTask = await db.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Error del servidor'
    });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const db = ensureDb();
    const allTasks = await db.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(allTasks.rows);
  } catch (err) {
    console.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Error del servidor'
    });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const db = ensureDb();
    const { id } = req.params;
    const { title, completed } = req.body;
    const updateTask = await db.query(
      'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    res.json(updateTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Error del servidor'
    });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const db = ensureDb();
    const { id } = req.params;
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (err) {
    console.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Error del servidor'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});