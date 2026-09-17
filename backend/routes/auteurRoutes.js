const express = require('express');
const { validerAuteur } = require('../middlewares/validationMiddleware');
const {
    getAuteurs,
    createAuteur,
    updateAuteur,
    deleteAuteur
} = require('../controllers/auteurController');

const router = express.Router();

router.get('/', getAuteurs);

router.post('/', createAuteur);

router.put('/:id', updateAuteur);

router.delete('/:id', deleteAuteur);

router.post('/', validerAuteur, createAuteur);

router.put('/:id', validerAuteur, updateAuteur);

module.exports = router;