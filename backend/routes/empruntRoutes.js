const express = require('express');

const {
    createEmprunt,
    retournerLivre,
    getEmpruntsEnCours,
    getEmpruntsEnRetard,
    getHistoriqueMembre
} = require('../controllers/empruntController');

const { validerEmprunt } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/', validerEmprunt, createEmprunt);

router.put('/:id/retour', retournerLivre);

router.get('/en-cours', getEmpruntsEnCours);

router.get('/en-retard', getEmpruntsEnRetard);

router.get('/membre/:membre_id/historique', getHistoriqueMembre);

module.exports = router;