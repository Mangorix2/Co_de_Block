const sqlite3 = require('sqlite3')
const express = require('express');
const app = express()
const port = 3000

const initialBlocks = [
  { name: "forward", lvl: 1 },
  { name: "backward", lvl: 1 },
  { name: "left", lvl: 1 },
  { name: "right", lvl: 1 }
];

const db = new sqlite3.Database("block.db");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS blocks")
  db.run(`
    CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block TEXT NOT NULL,
      unlocked_at_lvl INTEGER
    )`)

  const db_insert = db.prepare("INSERT INTO blocks (block, unlocked_at_lvl) VALUES (?, ?)");
  for (const block of initialBlocks) {
    db_insert.run(block.name, block.lvl);
  }
  console.log("DB is ready!")

})



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})