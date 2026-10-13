const { check } = require('express-validator')
const validatorMiddleware = require('../middlewares/validatorMiddleware')


exports.registerTokenValidator = [
    check('token')
        .notEmpty().withMessage('FCM token is required')
        .isString().withMessage('FCM token must be a string'),
    check('platform')
        .notEmpty().withMessage('Platform is required')
        .isIn(['android', 'ios', 'web']).withMessage('Platform must be android, ios, or web'),
    validatorMiddleware
]

exports.markAsReadValidator = [
    check('id')
        .isMongoId().withMessage('Invalid notification ID'),
    validatorMiddleware
]
