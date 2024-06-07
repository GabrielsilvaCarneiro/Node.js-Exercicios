const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const port = 2000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.render('index', { tasks: rows });
    }
  });
});

app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  db.run("INSERT INTO tasks (title, description, completed) VALUES (?, ?, 0)", [title, description], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/');
    }
  });
});

app.post('/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE tasks SET completed = 1 WHERE id = ?", [id], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/');
    }
  });
});

app.post('/tasks/:id/delete', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/');
    }
  });
});

app.get('/tasks/:id/edit', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.render('edit', { task: row });
    }
  });
});

app.post('/tasks/:id/update', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  db.run("UPDATE tasks SET title = ?, description = ? WHERE id = ?", [title, description, id], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

