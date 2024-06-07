const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const methodOverride = require('method-override'); // Import method-override

const app = express();
const port = 8000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method')); // Use method-override

app.get('/', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.render('index', { products: rows });
    }
  });
});

app.post('/products', (req, res) => {
  const { name, price, stock } = req.body;
  db.run("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", [name, price, stock], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/');
    }
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", id, (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      db.all("SELECT * FROM products ORDER BY id", [], (err, rows) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          db.serialize(() => {
            db.run("DROP TABLE IF EXISTS products", (err) => {
              if (err) {
                res.status(500).send(err.message);
              } else {
                db.run(`CREATE TABLE products (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          name TEXT,
                          price REAL,
                          stock INTEGER
                        )`, (err) => {
                  if (err) {
                    res.status(500).send(err.message);
                  } else {
                    const stmt = db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)");
                    rows.forEach((row, index) => {
                      stmt.run(row.name, row.price, row.stock, (err) => {
                        if (err) {
                          console.error(`Error inserting row ${index}:`, err.message);
                        }
                      });
                    });
                    stmt.finalize((err) => {
                      if (err) {
                        res.status(500).send(err.message);
                      } else {
                        res.redirect('/');
                      }
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
