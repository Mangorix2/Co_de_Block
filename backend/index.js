const sqlite3 = require('sqlite3')
const express = require('express');
const app = express()
const port = 3000

const db = new sqlite3.Database("block.db");

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})