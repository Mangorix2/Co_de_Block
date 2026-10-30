const express = require('express');
const sqlite3 = require('sqlite3');

const app = express()
const port = 3000
const db = new sqlite3.Database('block.db')

app.get('/', (req, res) => {
  res.send('Hello World!')
})

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})