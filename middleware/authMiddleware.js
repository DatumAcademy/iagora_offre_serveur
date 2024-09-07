const jwt = require('jsonwebtoken');
const configuration = require('../configuration/SECRET');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, configuration.secret, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token invalide' });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ message: 'Token manquant' });
    }
};

module.exports = authenticateJWT;
