const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Determine log directory (use /var/log/ytech for Docker, or local ./logs for testing outside docker)
const logDir = process.env.NODE_ENV === 'test' || !fs.existsSync('/var/log') ? path.join(__dirname, 'logs') : '/var/log/ytech';

// Ensure the directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create the Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'ytech-backend' },
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'backend-error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'backend.log') }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

module.exports = logger;
