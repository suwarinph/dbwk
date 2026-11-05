const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token',
                data: null
            });
        }

        const token = authHeader.split(' ')[1];

        // ตรวจสอบว่า Token ถูกต้องและยังไม่หมดอายุ
        req.auth = jwt.verify(token, process.env.JWT_SECRET);

        next();

    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: 'Invalid or expired token',
            data: null
        });
    }
};