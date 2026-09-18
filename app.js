const express = require('express');
const cors = require('cors');
const path = require('path');

const auteurRoutes = require('./routes/auteurRoutes');
const membreRoutes = require('./routes/membreRoutes');
const livreRoutes = require('./routes/livreRoutes');
const empruntRoutes = require('./routes/empruntRoutes');
const statistiqueRoutes = require('./routes/statistiqueRoutes');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/api/auteurs', auteurRoutes);
app.use('/api/membres', membreRoutes);
app.use('/api/livres', livreRoutes);
app.use('/api/emprunts', empruntRoutes);
app.use('/api/statistiques', statistiqueRoutes);


app.use(errorMiddleware);

module.exports = app;