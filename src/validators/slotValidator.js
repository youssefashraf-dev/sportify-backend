const validatorMiddleware = require('../middlewares/validatorMiddleware')
const courtModel = require('../../DB/models/courtModel')
const asyncHandler = require('express-async-handler')
const {check} = require('express-validator')

const createSlotValidator = [
    check('court')
        .notEmpty().withMessage('Court ID is required')
        .isMongoId().withMessage('Invalid Court ID format')
        .custom(asyncHandler(async (value) => {
            const court = await courtModel.findById(value)
            if (!court) {
                throw new Error('Court not found')
            }
            return true
        })),
    check('startTime')
        .notEmpty().withMessage('Start time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
    check('endTime')
        .notEmpty().withMessage('End time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
    validatorMiddleware
]
const updateSlotValidator = [
    check('court')
        .optional()
        .isMongoId().withMessage('Invalid Court ID format')
        .custom(asyncHandler(async (value) => {
            const court = await courtModel.findById(value)
            if (!court) {
                throw new Error('Court not found')
            }
            return true
        })),
    check('startTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
    check('endTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
    validatorMiddleware
]
const slotIdValidator = [
    check('id').isMongoId().withMessage('Invalid Id Format'),
    validatorMiddleware
]

module.exports = {createSlotValidator,updateSlotValidator,slotIdValidator}