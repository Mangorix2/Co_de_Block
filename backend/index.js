const sqlite3 = require('sqlite3')
const express = require('express');
const app = express()
const port = 3000

const db = new sqlite3.Database("block.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block TEXT NOT NULL,
      unlocked_at_lvl INTEGER
    )`)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})