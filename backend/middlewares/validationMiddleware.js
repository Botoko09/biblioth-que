 const validerAuteur = (req, res, next) => {
    const { nom, nationalite } = req.body;

    if (!nom || !nationalite) {
        return res.status(400).json({
            message: 'Le nom et la nationalité sont obligatoires'
        });
    }

    next();
};

const validerMembre = (req, res, next) => {
    const { nom, contact } = req.body;

    if (!nom || !contact) {
        return res.status(400).json({
            message: 'Le nom et le contact sont obligatoires'
        });
    }

    next();
};

const validerLivre = (req, res, next) => {
    const { titre, auteur_id, annee_publication } = req.body;

    if (!titre || !auteur_id || !annee_publication) {
        return res.status(400).json({
            message: 'Le titre, l’auteur et l’année de publication sont obligatoires'
        });
    }

    next();
};

const validerEmprunt = (req, res, next) => {
    const { membre_id, livre_id, date_retour_prevue } = req.body;

    if (!membre_id || !livre_id || !date_retour_prevue) {
        return res.status(400).json({
            message: 'Le membre, le livre et la date de retour prévue sont obligatoires'
        });
    }

    next();
};

module.exports = {
    validerAuteur,
    validerMembre,
    validerLivre,
    validerEmprunt
};