const sqlite3 = require('sqlite3')
const express = require('express');
const { rateLimit } = require('express-rate-limit');

const app = express()
app.use(express.json());

const port = 3000
const db = new sqlite3.Database('block.db', (err) => {
    if (err) {
        console.error('DB konnte nicht geöffnet werden:', err.message);
    }
})

// DB Stuff

// Initial Data for DB
const initialBlocks = [
    {name: "forward", lvl: 1},
    {name: "backward", lvl: 1},
    {name: "left", lvl: 1},
    {name: "right", lvl: 1}
];

const initialGrid = [
    {lvl: 1, height: 5, width: 5, goal: "5x5"},
    {lvl: 2, height: 8, width: 8, goal: "5x7"},
    {lvl: 3, height: 8, width: 8, goal: "6x8"},
    {lvl: 4, height: 10, width: 10, goal: "10x9"},
    {lvl: 5, height: 10, width: 10, goal: "7x8"},
];

// kleine Hilfsfunktion: loggt Fehler bei db.run
function logError(err) {
    if (err) {
        console.error('DB Fehler:', err.message);
    }
}

// Creation of Tables
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS blocks", logError)
    db.run("DROP TABLE IF EXISTS grid", logError)

    db.run(`
        CREATE TABLE IF NOT EXISTS blocks
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block TEXT NOT NULL,
            unlocked_at_lvl INTEGER
        )`, logError)
    db.run(`
        CREATE TABLE IF NOT EXISTS grid
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lvl INTEGER NOT NULL,
            height INTEGER NOT NULL,
            width INTEGER NOT NULL,
            goal TEXT NOT NULL
        )`, logError)

    // Datainsertion of Blocks
    const db_insert_blocks = db.prepare("INSERT INTO blocks (block, unlocked_at_lvl) VALUES (?, ?)");
    for (const block of initialBlocks) {
        db_insert_blocks.run(block.name, block.lvl, logError);
    }
    db_insert_blocks.finalize();

    // Datainsertion of Grid
    const db_insert_grid = db.prepare("INSERT INTO grid (lvl, height, width, goal) VALUES (?, ?, ?, ?)");
    for (const grid of initialGrid) {
        db_insert_grid.run(grid.lvl, grid.height, grid.width, grid.goal, logError);
    }
    db_insert_grid.finalize();

    console.log("DB is ready!")
})

// Endpoint for testing if the backend is running
app.get('/health', (req, res) => {
    res.send('HEALTHY: Backend running on Port: ' + port)
})

// TEST
app.get('/', (req, res) => {
    res.send('Hello World!')
})

function validateCurrentlvl(value) {
    const level = Number(value);

    if (level <= 0 || !Number.isInteger(level)) {
        return false
    }
    return true
}

const dbReadRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {error: 'Zu viele Anfragen. Bitte später erneut versuchen.'}
});

// Endpoint to get blocks by lvl
// body: currentLevel
app.get('/getBlocks', dbReadRateLimiter, (req, res) => {
    const currentLevel = Number(req.query.currentLevel);

    if (!validateCurrentlvl(currentLevel)) {
        return res.status(400).json({error: 'currentLevel muss eine positive ganze Zahl sein'});
    }

    db.all(
        'SELECT * FROM blocks WHERE unlocked_at_lvl <= ?',
        [currentLevel],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'Database failure'});
            }
            res.json(rows);
        }
    );
});

app.get('/getGrid', dbReadRateLimiter, (req, res) => {
    const currentlvl = Number(req.query.currentLevel)

    if (!validateCurrentlvl(currentlvl)) {
        return res.status(400).json({error: 'currentLevel muss eine positive ganze Zahl sein'});
    }

    db.all(
        'SELECT * FROM grid WHERE lvl = ?',
        [currentlvl],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'Database failure'});
            }
            if (rows.length === 0) {
                return res.status(404).json({error: 'Kein Grid für dieses Level gefunden'});
            }
            res.json(rows);
        }
    );
})

// codeExec
// body: JSON with all blocks
// Bespiel body
// {"blocks": [
//     {
//      "type": "repeat",
//      "times": 2,
//      "body": [
//        { "type": "move_forward", "steps": 10 },
//        { "type": "turn", "degrees": 90 }
//        .....
app.post('/codeExec', (req, res) => {
    const data = req.body;
    const instructions = createInstructions(data.blocks);

    res.status(200).json({
        instructions: instructions
    });
});

app.listen(port, () => {
    console.log(`Backend is listening on port ${port}`)
})

// Helper function for /codeExec
// creates a list with the commands with all the blocks
// argument block list => see /codeExec
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
