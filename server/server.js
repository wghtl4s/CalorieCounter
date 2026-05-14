const express = require('express');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');

const app      = express();
const PORT     = 5000;
const DATA_FILE = path.join(__dirname, '..', 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

// ─── Helpers ───────────────────────────────────────────────────────────────

function readDB() {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
}

function writeDB(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendError(res, status, message) {
    return res.status(status).json({ error: message });
}

// ─── GET /api/data ─────────────────────────────────────────────────────────

app.get('/api/data', (req, res) => {
    try {
        res.json(readDB());
    } catch (err) {
        sendError(res, 500, 'Помилка читання бази даних.');
    }
});

// ─── Meals ─────────────────────────────────────────────────────────────────

app.post('/api/meals', (req, res) => {
    const meal = req.body;

    if (!meal || !meal.id || !meal.product) {
        return sendError(res, 400, 'Неповні дані запису їжі.');
    }

    try {
        const db = readDB();
        db.meals.push(meal);
        writeDB(db);
        res.status(201).json({ message: 'Запис додано успішно.', id: meal.id });
    } catch (err) {
        sendError(res, 500, 'Помилка збереження запису.');
    }
});

app.delete('/api/meals/:id', (req, res) => {
    const { id } = req.params;

    try {
        const db = readDB();
        const before = db.meals.length;
        db.meals = db.meals.filter(m => m.id !== id);

        if (db.meals.length === before) {
            return sendError(res, 404, `Запис з id '${id}' не знайдено.`);
        }

        writeDB(db);
        res.json({ message: 'Запис видалено успішно.', id });
    } catch (err) {
        sendError(res, 500, 'Помилка видалення запису.');
    }
});

// ─── User ──────────────────────────────────────────────────────────────────

app.post('/api/user', (req, res) => {
    const user = req.body;

    if (!user || !user.name || !user.age || !user.weight || !user.height) {
        return sendError(res, 400, 'Неповні дані профілю користувача.');
    }

    try {
        const db = readDB();
        db.user = user;
        writeDB(db);
        res.status(200).json({ message: 'Профіль збережено успішно.' });
    } catch (err) {
        sendError(res, 500, 'Помилка збереження профілю.');
    }
});

// ─── Water ─────────────────────────────────────────────────────────────────

app.get('/api/water', (req, res) => {
    try {
        const db = readDB();
        const today = new Date().toDateString();
        const log = db.water && new Date(db.water.date).toDateString() === today
            ? db.water
            : null;
        res.json(log || {});
    } catch (err) {
        sendError(res, 500, 'Помилка читання даних про воду.');
    }
});

app.post('/api/water/add', (req, res) => {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
        return sendError(res, 400, 'Невірна кількість води.');
    }

    try {
        const db = readDB();
        const today = new Date().toDateString();

        if (!db.water || new Date(db.water.date).toDateString() !== today) {
            db.water = {
                id:            Date.now().toString(),
                targetVolume:  db.water?.targetVolume || 2000,
                currentVolume: 0,
                date:          new Date().toISOString(),
                records:       []
            };
        }

        db.water.currentVolume += amount;
        db.water.records.push({
            amount,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        writeDB(db);
        res.json({ message: 'Воду додано.', water: db.water });
    } catch (err) {
        sendError(res, 500, 'Помилка збереження даних про воду.');
    }
});

app.post('/api/water/target', (req, res) => {
    const { target } = req.body;

    if (!target || isNaN(target) || target <= 0) {
        return sendError(res, 400, 'Невірна ціль по воді.');
    }

    try {
        const db = readDB();
        if (!db.water) db.water = { currentVolume: 0, records: [], date: new Date().toISOString() };
        db.water.targetVolume = target;
        writeDB(db);
        res.json({ message: 'Ціль оновлено.', target });
    } catch (err) {
        sendError(res, 500, 'Помилка оновлення цілі.');
    }
});

app.post('/api/water/reset', (req, res) => {
    try {
        const db = readDB();
        const prevTarget = db.water?.targetVolume || 2000;
        db.water = {
            id:            Date.now().toString(),
            targetVolume:  prevTarget,
            currentVolume: 0,
            date:          new Date().toISOString(),
            records:       []
        };
        writeDB(db);
        res.json({ message: 'Водний журнал скинуто.', water: db.water });
    } catch (err) {
        sendError(res, 500, 'Помилка скидання даних про воду.');
    }
});

// ─── Start ─────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`✅ Сервер запущено: http://localhost:${PORT}`);
});
