// src/utils/logger.js
import { createLogger, format, transports, Logger } from 'winston';

// Create a logger instance
const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default log level
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'error.log', level: 'error' }), // Log error messages to a file
    new transports.File({ filename: 'combined.log' }) // Log all messages to a file
  ]
});

export default logger;
