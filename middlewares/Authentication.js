const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const config = require('../config');
dotenv.config();

const TOKEN_SECRET = "asfhn&*#@GEYVO^GF!*!TDOVQW*@#YFVSAD@^O#EF@R@4r^O&@#G*&GWTWFO*^!#DVO@C^@#^RF";

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

            console.log(decoded,'the decoded data here')
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


const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, // Include user ID and role in token payload
        TOKEN_SECRET,
        { expiresIn: '24h' } // Set expiration time as needed
    );
};

module.exports = { authorizeRoute , generateToken };
