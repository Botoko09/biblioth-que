const express = require('express');

const {
    getLivres,
    getLivreById,
    createLivre,
    updateLivre,
    deleteLivre
} = require('../controllers/livreController');

const { validerLivre } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/', getLivres);

router.get('/:id', getLivreById);

router.post('/', validerLivre, createLivre);

router.put('/:id', validerLivre, updateLivre);

router.delete('/:id', deleteLivre);

module.exports = router;