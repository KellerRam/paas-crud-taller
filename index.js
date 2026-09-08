const express = require('express');
const cors = require('cors');
const pool = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de bienvenida / Test
app.get('/', (req, res) => {
  res.json({ message: "¡API funcionando correctamente en el PaaS!" });
});

// CREATE: Crear una tarea
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    const newTask = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// READ: Obtener todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const allTasks = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(allTasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// UPDATE: Actualizar el estado o título de una tarea
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id }  = req.params;
    const { title, completed } = req.body;
    const updateTask = await pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    res.json(updateTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// DELETE: Eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: "Tarea eliminada exitosamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});