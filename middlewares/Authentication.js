const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const TOKEN_SECRET = process.env.secret;

// Middleware for verifying token and role
const authorizeRoute = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        const token = req.headers['access-token'];

        if (!token) {
            return res.status(403).send({ message: 'No token provided!' });
        }

        jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: 'Unauthorized!' });
            }

            req.userId = decoded.id;
            req.role = decoded.role;

            // Check role authorization
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).send({ message: 'Access denied!' });
            }

            next();
        });
    };
};

module.exports = { authorizeRoute };
