const logger = require('../config/logger')

const requestLogger = (req, res, next) => {
    const oldSend = res.send; // Save the original res.send method

    // Log the request
    logger.info(`[${req.method}] ${req.originalUrl}`);

    // Override res.send to capture the response body
    res.send = function (body) {
        // Log the response status and body
        const status = res.statusCode;
        if (status >= 400) {
            logger.error(`Response Error: ${status} for ${req.originalUrl}`);
        } else {
            logger.info(`Response Success: ${status} for ${req.originalUrl}`);
        }

        logger.info(`Response Body: ${JSON.stringify(body)}`);
        
        // Call the original res.send method
        oldSend.call(this, body);
    };

    next();
};

module.exports = { requestLogger };