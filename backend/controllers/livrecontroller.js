const pool = require('../config/db');

const getLivres = async (req, res) => {
    try {
        const { recherche } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const offset = (page - 1) * limite;

        const result = await pool.query(`
            SELECT livres.*, auteurs.nom AS auteur_nom
            FROM livres
            JOIN auteurs ON livres.auteur_id = auteurs.id
            WHERE livres.titre ILIKE $1
               OR auteurs.nom ILIKE $1
            ORDER BY livres.id
            LIMIT $2 OFFSET $3
        `, [`%${recherche || ''}%`, limite, offset]);

        res.json({
            page,
            limite,
            livres: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des livres'
        });
    }
};

const getLivreById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT livres.*, auteurs.nom AS auteur_nom
             FROM livres
             JOIN auteurs ON livres.auteur_id = auteurs.id
             WHERE livres.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la récupération du livre'
        });
    }
};

const createLivre = async (req, res) => {
    try {
        const { titre, auteur_id, annee_publication } = req.body;

        const auteur = await pool.query(
            'SELECT * FROM auteurs WHERE id = $1',
            [auteur_id]
        );

        if (auteur.rows.length === 0) {
            return res.status(404).json({
                message: 'Auteur introuvable'
            });
        }

        const result = await pool.query(
            `INSERT INTO livres (titre, auteur_id, annee_publication)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [titre, auteur_id, annee_publication]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la création du livre'
        });
    }
};

const updateLivre = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, auteur_id, annee_publication } = req.body;

        const auteur = await pool.query(
            'SELECT * FROM auteurs WHERE id = $1',
            [auteur_id]
        );

        if (auteur.rows.length === 0) {
            return res.status(404).json({
                message: 'Auteur introuvable'
            });
        }

        const result = await pool.query(
            `UPDATE livres
             SET titre = $1,
                 auteur_id = $2,
                 annee_publication = $3
             WHERE id = $4
             RETURNING *`,
            [titre, auteur_id, annee_publication, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la modification du livre'
        });
    }
};

const deleteLivre = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM livres WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        res.json({
            message: 'Livre supprimé avec succès',
            livre: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la suppression du livre'
        });
    }
};

module.exports = {
    getLivres,
    getLivreById,
    createLivre,
    updateLivre,
    deleteLivre
};