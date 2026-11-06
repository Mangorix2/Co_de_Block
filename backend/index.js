const sqlite3 = require('sqlite3')
const express = require('express');

const app = express()
app.use(express.json());

const port = 3000
const db = new sqlite3.Database('block.db')

// DB
const initialBlocks = [
  { name: "forward", lvl: 1 },
  { name: "backward", lvl: 1 },
  { name: "left", lvl: 1 },
  { name: "right", lvl: 1 }
];

const initialGrid = [
  { lvl: 1, height: 5, width: 5, goal: "5x5" },
  { lvl: 2, height: 8, width: 8, goal: "5x7" },
  { lvl: 3, height: 8, width: 8, goal: "6x8" },
  { lvl: 4, height: 10, width: 10, goal: "10x9" },
  { lvl: 5, height: 10, width: 10, goal: "7x8" },

];

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
      width INTEGER NOT NULL,
      goal TEXT NOT NULL
    )`)

  const db_insert_blocks = db.prepare("INSERT INTO blocks (block, unlocked_at_lvl) VALUES (?, ?)");
  for (const block of initialBlocks) {
    db_insert_blocks.run(block.name, block.lvl);
  }

  const db_insert_grid = db.prepare("INSERT INTO grid (lvl, height, width, goal) VALUES (?, ?, ?, ?)");
  for (const grid of initialGrid) {
    db_insert_grid.run(grid.lvl, grid.height, grid.width, grid.goal);
  }
  console.log("DB is ready!")

})


// TEST
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// getblocks
app.get('/getBlocks', (req, res) => {
  const currentLevel = Number(req.query.currentLevel);

  if (Number.isNaN(currentLevel)) {
    return res.status(400).json({ error: 'level muss eine Zahl sein' });
  }

  db.all(
      'SELECT * FROM blocks WHERE unlocked_at_lvl <= ?',
      [currentLevel],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Databasefailure' });
        }
        res.json(rows);
      }
  );
})

// codeExec
// body: JSON with all blocks
//{"blocks": [
//     {
//      "type": "repeat",
//      "times": 2,
//      "body": [
//        { "type": "move_forward", "steps": 10 },
//        { "type": "turn", "degrees": 90 }
//        .....
app.post('/codeExec', (req, res) => {
  const data = req.body;
  console.log(data)
  const instructions = createInstructions(data.blocks);

  console.log(instructions)
  res.status(200).json({
    instructions: instructions
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function createInstructions(blocks) {
  let list = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case 'move_forward':
        list.push(`move_forward(${block.steps})`);
        break;

      case 'turn':
        list.push(`turn(${block.degrees})`);
        break;

      case 'repeat':
        const times = block.times || 1;
        const innerBlocks = block.body;

        for (let i = 0; i < times; i++) {
          const innerBlock = createInstructions(innerBlocks);
          list = list.concat(innerBlock);
        }
        break;
    }
  })
  return list
}