const jwt = require('jsonwebtoken');

module.exports = async function(req, res, next) {
    try {

        let token = req.headers.authorization
        if (!token) return res.status(401).send('invalid token');
        req.auth = token;
        next();

    } catch (error) {
        res.status(500).send(error);
    }
};