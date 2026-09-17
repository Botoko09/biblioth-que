const pool = require('../config/db');

const getMembres = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM membres ORDER BY id'
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des membres'
        });
    }
};

const getMembreById = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM membres WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Membre introuvable'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la récupération du membre'
        });
    }
};

const createMembre = async (req, res) => {
    try {
        const { nom, contact } = req.body;

        const result = await pool.query(
            'INSERT INTO membres (nom, contact) VALUES ($1, $2) RETURNING *',
            [nom, contact]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la création du membre'
        });
    }
};

const updateMembre = async (req, res) => {
    try {
        const { nom, contact } = req.body;

        const result = await pool.query(
            'UPDATE membres SET nom = $1, contact = $2 WHERE id = $3 RETURNING *',
            [nom, contact, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Membre introuvable'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la modification du membre'
        });
    }
};

const deleteMembre = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM membres WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Membre introuvable'
            });
        }

        res.json({
            message: 'Membre supprimé'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur lors de la suppression du membre'
        });
    }
};

module.exports = {
    getMembres,
    getMembreById,
    createMembre,
    updateMembre,
    deleteMembre
};