const winston = require('winston')
const dailyRotateFile = require('winston-daily-rotate-file')
const fs = require('fs')


if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs')
}

const rotateTransport = new dailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '14d'
})

const errorRotateTransport = new dailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '10m',
    maxFiles: '30d'
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        rotateTransport,
        errorRotateTransport
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
        format: winston.format.simple()
        })
    )
}

module.exports = logger
