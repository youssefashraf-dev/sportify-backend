const validatorMiddleware = require('../middlewares/validatorMiddleware')
const courtModel = require('../../DB/models/courtModel')
const slotModel = require('../../DB/models/slotModel')
// const userModel = require('../../DB/models/userModel')
// const bookingModel = require('../../DB/models/bookingModel')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const {check} = require('express-validator')

const createBookingValidator = [
    check('court')
        .notEmpty().withMessage('Court Id is required')
        .isMongoId().withMessage('Invalid Court Id Format')
        .custom(asyncHandler(async(courtId) => {
            const court = await courtModel.findById(courtId)
            if(!court){
                throw new Error('Court not found')
            }
            return true
        })),
    check('bookingDate')
        .notEmpty().withMessage('Booking date is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((value)=>{

            const bookingDate = new Date(value);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            bookingDate.setHours(0, 0, 0, 0);

            if (bookingDate < today) {
                throw new Error('Booking date cannot be in the past')
            }
            return true
        }),
    check('timeSlots')
        .notEmpty().withMessage('At least one Time Slot Id is required')
        .custom(asyncHandler(async(slotIds, {req}) => {
            slotIds = Array.isArray(slotIds) ? slotIds : [slotIds]
            for (const slotId of slotIds) {
                if (!mongoose.Types.ObjectId.isValid(slotId)) {
                    throw new Error(`Invalid Time Slot Id format: ${slotId}`)
                }
                const slot = await slotModel.findOne({ _id: slotId, court:req.body.court })
                if(!slot){
                    throw new Error(`Time Slot not found or not available: ${slotId}`)
                }
            }
            return true
        })),
    validatorMiddleware 
]
const updateBookingValidator = [
    check('status')
        .optional()
        .isIn(['pending','under review', 'rejected', 'confirmed', 'cancelled']).withMessage('Status must be one of the following: pending, under review, confirmed, rejected, cancelled'),
    validatorMiddleware
]

const bookingIdValidator = [
    check('id').isMongoId().withMessage('Invalid Id Format'),
    validatorMiddleware
]



module.exports = {createBookingValidator,updateBookingValidator,bookingIdValidator}