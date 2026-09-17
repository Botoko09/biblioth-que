const pool = require('../config/db');

const getStatistiques = async (req, res) => {
    try {
        const totalLivres = await pool.query(
            'SELECT COUNT(*) AS total FROM livres'
        );

        const totalMembres = await pool.query(
            'SELECT COUNT(*) AS total FROM membres'
        );

        const empruntsEnCours = await pool.query(
            `SELECT COUNT(*) AS total
             FROM emprunts
             WHERE date_retour IS NULL`
        );

        const empruntsEnRetard = await pool.query(
            `SELECT COUNT(*) AS total
             FROM emprunts
             WHERE date_retour IS NULL
             AND date_retour_prevue < CURRENT_DATE`
        );

        const livrePlusEmprunte = await pool.query(
            `SELECT livres.titre, COUNT(emprunts.id) AS nombre_emprunts
             FROM emprunts
             JOIN livres ON emprunts.livre_id = livres.id
             GROUP BY livres.id, livres.titre
             ORDER BY nombre_emprunts DESC
             LIMIT 1`
        );

        const membrePlusActif = await pool.query(
            `SELECT membres.nom, COUNT(emprunts.id) AS nombre_emprunts
             FROM emprunts
             JOIN membres ON emprunts.membre_id = membres.id
             GROUP BY membres.id, membres.nom
             ORDER BY nombre_emprunts DESC
             LIMIT 1`
        );

        res.json({
            total_livres: parseInt(totalLivres.rows[0].total),
            total_membres: parseInt(totalMembres.rows[0].total),
            emprunts_en_cours: parseInt(empruntsEnCours.rows[0].total),
            emprunts_en_retard: parseInt(empruntsEnRetard.rows[0].total),
            livre_plus_emprunte: livrePlusEmprunte.rows[0] || null,
            membre_plus_actif: membrePlusActif.rows[0] || null
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};

module.exports = {
    getStatistiques
};