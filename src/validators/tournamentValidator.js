const validatorMiddleware = require('../middlewares/validatorMiddleware')
const { check } = require('express-validator')

const createTournamentValidator = [
    check('title')
        .notEmpty()
        .withMessage('Tournament title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Tournament title must be between 3 and 100 characters'),

    check('description')
        .notEmpty()
        .withMessage('Tournament description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Tournament description must be between 10 and 1000 characters'),

    check('date')
        .notEmpty()
        .withMessage('Tournament date is required')
        .isISO8601()
        .withMessage('Invalid date format'),

    check('location')
        .notEmpty()
        .withMessage('Tournament location is required'),

    check('price')
        .notEmpty()
        .withMessage('Tournament price is required')
        .isFloat({ min: 0 })
        .withMessage('Tournament price must be a positive number'),

    check('instructions')
        .notEmpty()
        .withMessage('Tournament instructions are required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Tournament instructions must be between 10 and 2000 characters'),

    validatorMiddleware
]

const updateTournamentValidator = [
    check('title')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('Tournament title must be between 3 and 100 characters'),

    check('description')
        .optional()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Tournament description must be between 10 and 1000 characters'),

    check('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),

    check('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tournament price must be a positive number'),

    check('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Status must be active or inactive'),

    validatorMiddleware
]

const tournamentIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Id Format'),

    validatorMiddleware
]

const tournamentRequestStatusValidator = [
    check('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['accepted', 'rejected'])
        .withMessage('Status must be accepted or rejected'),

    validatorMiddleware
]

const tournamentRequestIdValidator = [
    check('requestId')
        .isMongoId()
        .withMessage('Invalid Request Id Format'),

    validatorMiddleware
]

module.exports = {
    createTournamentValidator,
    updateTournamentValidator,
    tournamentIdValidator,
    tournamentRequestStatusValidator,
    tournamentRequestIdValidator
}