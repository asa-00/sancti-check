// src/middleware/errorHandler.js

const logger = require('../utils/logger'); // Import your logger

const errorHandler = (err, req, res, next) => {
    // Log the error details
    logger.error(err.message); // Log the error message
    logger.error(err.stack);   // Log the stack trace for debugging

    // Set default status code to 500 if not specified
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    // Send response to the client
    res.status(statusCode).json({
        success: false,
        message: err.message, // Send error message
        // Optionally include additional error details
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Include stack trace in development mode
    });
};

module.exports = errorHandler;
