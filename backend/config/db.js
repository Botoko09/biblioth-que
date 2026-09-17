const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.query('SELECT NOW()', (error, result) => {
    if (error) {
        console.error('Erreur de connexion à PostgreSQL :', error);
    } else {
        console.log('PostgreSQL connecté');
    }
});

module.exports = pool;