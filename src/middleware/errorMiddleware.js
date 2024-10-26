const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Set status code
    
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack in production
    });
};

module.exports = errorHandler;