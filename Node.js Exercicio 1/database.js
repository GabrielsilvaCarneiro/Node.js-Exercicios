const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:'); 

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    stock INTEGER
  )`);

  
  db.run("INSERT INTO products (name, price, stock) VALUES ('Produto 1', 10.0, 100)");
  db.run("INSERT INTO products (name, price, stock) VALUES ('Produto 2', 20.0, 50)");
});

module.exports = db;
