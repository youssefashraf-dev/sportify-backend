const {body,check} = require('express-validator')
const validatorMiddleware = require('../middlewares/validatorMiddleware')
const courtModel = require('../../DB/models/courtModel')
const bookingModel = require('../../DB/models/bookingModel')
const reviewModel = require('../../DB/models/reviewModel')
const apiError = require('../utils/apiError')



const createReviewValidator = [
    check('booking').notEmpty().withMessage('Review booking is required')
    .isMongoId().withMessage('Invalid booking id format')
    .custom(async(val,{req})=>{
        const booking = await bookingModel.findOne({_id:val,user:req.user.id,status:'confirmed'})
        if(!booking){
            throw new apiError('cannot review unconfirmed or not your booking',400)
        }
        const court = await courtModel.findById(booking.court)
        if(!court){
            throw new apiError('Court Not Found For This Booking',404)
        }
        req.body.courtId = court._id
        return true
    }),
    body('ratings').notEmpty().withMessage('review must include rate')
    .isFloat({min:1,max:5}).withMessage('Invalid rate value'),
    validatorMiddleware
]

const updateReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format')
    .custom(async (val,{req})=>{
        const review = await reviewModel.findById(val)
        if(!review){
            throw new apiError('Review Not Found',404)
        }
        if(review.user._id.toString() !== req.user.id){
            throw new apiError('You Are Not Allowed To Update This Review',403)
        }
    }),
    check('ratings').optional().isFloat({min:1,max:5}).withMessage('Invalid rate value'),
    check('booking').optional().custom(async (val,{req})=>{
        const review = await reviewModel.findById(req.params.id)
        const booking = await bookingModel.findOne({_id:val,user:req.user.id,status:'confirmed'})
        if(!booking){
            throw new apiError('cannot review unconfirmed or not your booking',400)
        }
        if(booking._id.toString() !== review.booking.toString()){
            throw new apiError('You Cannot Change Booking In This Review',400)
        }
        return true
    }),
    validatorMiddleware
]

const deleteReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format')
    .custom(async (val,{req})=>{
        const review = await reviewModel.findById(val)
        if(!review){
            throw new apiError('Review Not Found',404)
        }
        if(review.user._id.toString() !== req.user.id){
            throw new apiError('You Are Not Allowed To Delete This Review',403)
        }})
    ,validatorMiddleware
]

const checkIdValdidator = [
    check('id').isMongoId().withMessage('Invalid Review id format'),
    validatorMiddleware
]

module.exports = {createReviewValidator,updateReviewValidator,deleteReviewValidator,checkIdValdidator}