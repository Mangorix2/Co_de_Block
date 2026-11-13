const sqlite3 = require('sqlite3');
const express = require('express');

const app = express();
const port = 3000;

const db = new sqlite3.Database('block.db', (err) => {
    if (err) {
        console.error('Could not open database:', err.message);
        process.exit(1);
    }
});

// ---------- DB helpers (Promise-Wrapper) ----------
const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });

const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });

// ---------- DB Setup ----------
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

async function initDb() {
    await run("DROP TABLE IF EXISTS blocks");
    await run("DROP TABLE IF EXISTS grid");

    await run(`
        CREATE TABLE blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block TEXT NOT NULL,
            unlocked_at_lvl INTEGER
        )`);
    await run(`
        CREATE TABLE grid (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lvl INTEGER NOT NULL,
            height INTEGER NOT NULL,
            width INTEGER NOT NULL,
            goal TEXT NOT NULL
        )`);

    await run("BEGIN TRANSACTION");
    try {
        for (const b of initialBlocks) {
            await run("INSERT INTO blocks (block, unlocked_at_lvl) VALUES (?, ?)", [b.name, b.lvl]);
        }
        for (const g of initialGrid) {
            await run(
                "INSERT INTO grid (lvl, height, width, goal) VALUES (?, ?, ?, ?)",
                [g.lvl, g.height, g.width, g.goal]
            );
        }
        await run("COMMIT");
    } catch (err) {
        await run("ROLLBACK").catch(() => {});
        throw err;
    }
}

// ---------- Validation ----------
// Gibt das Level als Zahl zurück oder null, wenn ungültig
function parseLevel(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return null;
    }
    const level = Number(value);
    if (!Number.isInteger(level) || level <= 0) {
        return null;
    }
    return level;
}

// Middleware: validiert ?currentLevel und hängt es an req
function requireLevel(req, res, next) {
    const level = parseLevel(req.query.currentLevel);
    if (level === null) {
        return res.status(400).json({
            error: "Invalid or missing 'currentLevel'. It must be a positive integer."
        });
    }
    req.level = level;
    next();
}

// Wrapper, damit async-Fehler im Error-Handler landen
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Routes ----------
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/getBlocks', requireLevel, asyncHandler(async (req, res) => {
    const rows = await all(
        'SELECT * FROM blocks WHERE unlocked_at_lvl <= ?',
        [req.level]
    );
    res.json(rows);
}));

app.get('/getGrid', requireLevel, asyncHandler(async (req, res) => {
    const rows = await all('SELECT * FROM grid WHERE lvl = ?', [req.level]);

    if (rows.length === 0) {
        return res.status(404).json({error: `No grid found for level ${req.level}`});
    }
    res.json(rows);
}));

// ---------- 404 & Error Handler ----------
app.use((req, res) => {
    res.status(404).json({error: `Route ${req.method} ${req.path} not found`});
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({error: 'Internal server error'});
});

// ---------- Start ----------
let server;

initDb()
    .then(() => {
        console.log('DB is ready!');
        server = app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
        server.on('error', (err) => {
            console.error(
                err.code === 'EADDRINUSE'
                    ? `Port ${port} is already in use`
                    : `Server error: ${err.message}`
            );
            process.exit(1);
        });
    })
    .catch((err) => {
        console.error('DB initialization failed:', err);
        process.exit(1);
    });

// ---------- Graceful Shutdown ----------
function shutdown(signal) {
    console.log(`${signal} received, shutting down...`);
    const closeDb = () =>
        db.close((err) => {
            if (err) console.error('Error closing DB:', err.message);
            process.exit(err ? 1 : 0);
        });
    server ? server.close(closeDb) : closeDb();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));