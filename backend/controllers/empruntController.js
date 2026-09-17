const pool = require('../config/db');

const createEmprunt = async (req, res) => {
    try {
        const { membre_id, livre_id, date_retour_prevue } = req.body;

        if (!membre_id || !livre_id || !date_retour_prevue) {
            return res.status(400).json({
                message: 'Le membre, le livre et la date de retour prévue sont obligatoires'
            });
        }

        const livre = await pool.query(
            'SELECT * FROM livres WHERE id = $1',
            [livre_id]
        );

        if (livre.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        if (livre.rows[0].statut === 'borrowed') {
            return res.status(400).json({
                message: 'Ce livre est déjà emprunté'
            });
        }

        const membre = await pool.query(
            'SELECT * FROM membres WHERE id = $1',
            [membre_id]
        );

        if (membre.rows.length === 0) {
            return res.status(404).json({
                message: 'Membre introuvable'
            });
        }

        const result = await pool.query(
            `INSERT INTO emprunts
             (membre_id, livre_id, date_retour_prevue)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [membre_id, livre_id, date_retour_prevue]
        );

        await pool.query(
            `UPDATE livres
             SET statut = 'borrowed'
             WHERE id = $1`,
            [livre_id]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur lors de la création de l’emprunt'
        });
    }
};

const retournerLivre = async (req, res) => {
    try {
        const { id } = req.params;

        const emprunt = await pool.query(
            'SELECT * FROM emprunts WHERE id = $1',
            [id]
        );

        if (emprunt.rows.length === 0) {
            return res.status(404).json({
                message: 'Emprunt introuvable'
            });
        }

        if (emprunt.rows[0].date_retour !== null) {
            return res.status(400).json({
                message: 'Ce livre a déjà été retourné'
            });
        }

        const result = await pool.query(
            `UPDATE emprunts
             SET date_retour = CURRENT_DATE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        await pool.query(
            `UPDATE livres
             SET statut = 'available'
             WHERE id = $1`,
            [emprunt.rows[0].livre_id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur lors du retour du livre'
        });
    }
};

const getEmpruntsEnCours = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                emprunts.id,
                membres.nom AS membre_nom,
                livres.titre AS livre_titre,
                emprunts.date_emprunt,
                emprunts.date_retour_prevue
            FROM emprunts
            JOIN membres ON emprunts.membre_id = membres.id
            JOIN livres ON emprunts.livre_id = livres.id
            WHERE emprunts.date_retour IS NULL
            ORDER BY emprunts.id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur lors de la récupération des emprunts en cours'
        });
    }
};

const getEmpruntsEnRetard = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                emprunts.id,
                membres.nom AS membre_nom,
                livres.titre AS livre_titre,
                emprunts.date_emprunt,
                emprunts.date_retour_prevue
            FROM emprunts
            JOIN membres ON emprunts.membre_id = membres.id
            JOIN livres ON emprunts.livre_id = livres.id
            WHERE emprunts.date_retour IS NULL
            AND emprunts.date_retour_prevue < CURRENT_DATE
            ORDER BY emprunts.date_retour_prevue
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur lors de la récupération des emprunts en retard'
        });
    }
};

const getHistoriqueMembre = async (req, res) => {
    try {
        const { membre_id } = req.params;

        const membre = await pool.query(
            'SELECT * FROM membres WHERE id = $1',
            [membre_id]
        );

        if (membre.rows.length === 0) {
            return res.status(404).json({
                message: 'Membre introuvable'
            });
        }

        const result = await pool.query(`
            SELECT
                emprunts.id,
                livres.titre AS livre_titre,
                emprunts.date_emprunt,
                emprunts.date_retour_prevue,
                emprunts.date_retour
            FROM emprunts
            JOIN livres ON emprunts.livre_id = livres.id
            WHERE emprunts.membre_id = $1
            ORDER BY emprunts.date_emprunt DESC
        `, [membre_id]);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur lors de la récupération de l’historique du membre'
        });
    }
};

module.exports = {
    createEmprunt,
    retournerLivre,
    getEmpruntsEnCours,
    getEmpruntsEnRetard,
    getHistoriqueMembre
};