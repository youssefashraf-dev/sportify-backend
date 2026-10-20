const validatorMiddleware = require('../middlewares/validatorMiddleware')
const { check } = require('express-validator')

// ==========================================
// CREATE PROMO CODE
// ==========================================

const createPromoCodeValidator = [
    check('code')
        .notEmpty()
        .withMessage('Promo code is required')
        .isLength({ min: 3, max: 30 })
        .withMessage(
            'Promo code must be between 3 and 30 characters'
        )
        .matches(/^[A-Za-z0-9_-]+$/)
        .withMessage(
            'Promo code can only contain letters, numbers, underscores, and hyphens'
        ),

    check('discountPercentage')
        .notEmpty()
        .withMessage('Discount percentage is required')
        .isFloat({ min: 0.01, max: 100 })
        .withMessage(
            'Discount percentage must be between 0.01 and 100'
        ),

    check('expiresAt')
        .notEmpty()
        .withMessage('Expiration date is required')
        .isISO8601()
        .withMessage('Invalid expiration date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error(
                    'Expiration date must be in the future'
                )
            }

            return true
        }),

    validatorMiddleware,
]

// ==========================================
// UPDATE PROMO CODE
// ==========================================

const updatePromoCodeValidator = [
    check('code')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage(
            'Promo code must be between 3 and 30 characters'
        )
        .matches(/^[A-Za-z0-9_-]+$/)
        .withMessage(
            'Promo code can only contain letters, numbers, underscores, and hyphens'
        ),

    check('discountPercentage')
        .optional()
        .isFloat({ min: 0.01, max: 100 })
        .withMessage(
            'Discount percentage must be between 0.01 and 100'
        ),

    check('expiresAt')
        .optional()
        .isISO8601()
        .withMessage('Invalid expiration date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error(
                    'Expiration date must be in the future'
                )
            }

            return true
        }),

    check('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),

    validatorMiddleware,
]

// ==========================================
// PROMO CODE ID
// ==========================================

const promoCodeIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Id Format'),

    validatorMiddleware,
]

// ==========================================
// VALIDATE PROMO CODE
// ==========================================

const validatePromoCodeValidator = [
    check('court')
        .notEmpty()
        .withMessage('Court is required')
        .isMongoId()
        .withMessage('Invalid court id'),

    check('timeSlots')
        .custom((value) => {
            const slots = Array.isArray(value)
                ? value
                : [value]

            if (!slots.length) {
                throw new Error(
                    'At least one time slot is required'
                )
            }

            for (const slot of slots) {
                if (
                    typeof slot !== 'string' ||
                    !/^[0-9a-fA-F]{24}$/.test(slot)
                ) {
                    throw new Error(
                        'Invalid time slot id'
                    )
                }
            }

            return true
        }),

    check('promoCode')
        .notEmpty()
        .withMessage('Promo code is required')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage(
            'Promo code must be between 3 and 30 characters'
        ),

    validatorMiddleware,
]

module.exports = {
    createPromoCodeValidator,
    updatePromoCodeValidator,
    promoCodeIdValidator,
    validatePromoCodeValidator,
}