const express = require('express');

const {
    getMembres,
    getMembreById,
    createMembre,
    updateMembre,
    deleteMembre
} = require('../controllers/membreController');

const { validerMembre } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/', getMembres);

router.get('/:id', getMembreById);

router.post('/', validerMembre, createMembre);

router.put('/:id', validerMembre, updateMembre);

router.delete('/:id', deleteMembre);

module.exports = router;