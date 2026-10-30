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

const initialGrid = [
  { lvl: 1, height: 5, width: 5 },
  { lvl: 2, height: 8, width: 8 },
  { lvl: 3, height: 8, width: 8 },
  { lvl: 4, height: 10, width: 10 },
  { lvl: 5, height: 10, width: 10 },

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
    db.run(`
    CREATE TABLE IF NOT EXISTS grid (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lvl INTEGER NOT NULL,
      height INTEGER NOT NULL,
      width INTEGER NOT NULL
    )`)

  const db_insert_blocks = db.prepare("INSERT INTO blocks (block, unlocked_at_lvl) VALUES (?, ?)");
  for (const block of initialBlocks) {
    db_insert_blocks.run(block.name, block.lvl);
  }

  const db_insert_grid = db.prepare("INSERT INTO grid (lvl, height, width) VALUES (?, ?, ?)");
  for (const grid of initialGrid) {
    db_insert_grid.run(grid.lvl, grid.height, grid. width);
  }
  console.log("DB is ready!")

})



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})