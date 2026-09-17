const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: 'Une erreur interne est survenue'
    });
};

module.exports = errorMiddleware;