const express = require('express');

const {
    getStatistiques
} = require('../controllers/statistiqueController');

const router = express.Router();

router.get('/', getStatistiques);

module.exports = router;