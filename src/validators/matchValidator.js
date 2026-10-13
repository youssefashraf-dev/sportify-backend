const {check} = require('express-validator')
const validatorMiddleware = require('../middlewares/validatorMiddleware')
const matchModel = require('../../DB/models/matchModel')
const bookingModel = require('../../DB/models/bookingModel')
const apiError = require('../utils/apiError')



const createMatchValidator = [
    check('booking').isMongoId().withMessage('Invalid booking id format')
    .custom(async(bookingId,{req})=>{
        const booking = await bookingModel.findById(bookingId)
        if(!booking){
            throw new apiError('Booking not found',404)
        }
        if(!booking.user.equals(req.user.id)){
            throw new apiError('You are not allowed to create match for this booking',403)
        }
        if(booking.status !== 'confirmed'){
            throw new apiError('Match can be created only for confirmed bookings',400)
        }
        const existingMatch = await matchModel.findOne({booking: bookingId,status:{$ne:'cancelled'}})
        if(existingMatch){
            throw new apiError('A match is already associated with this booking',400)
        }
        req.body.matchDate = booking.bookingDate
        req.body.court = booking.court
        req.body.matchTimeSlots = booking.timeSlots
        return true;
    }),
    check('matchType')
        .isIn(['needPlayers', 'needTeam']).withMessage('matchType must be either needPlayers or needTeam'),
    check('matchDate')
        .isISO8601().withMessage('matchDate must be a valid date')
        .custom(async(value)=>{
            const bookingDate = new Date(value);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            bookingDate.setHours(0, 0, 0, 0);

            if (bookingDate < today) {
                throw new Error('Match date cannot be in the past')
            }
            return true
        }),
    check('teamSize')
        .isInt().withMessage('teamSize must be an integer'),
    validatorMiddleware
]

const applyToMatchValidator = [
    check('id').isMongoId().withMessage('Invalid Match id format')
    .custom(async(matchId,{req})=>{
        const match = await matchModel.findById(matchId)
        if(!match){
            throw new apiError('Match not found',404)
        }
        if(match.status !== 'open'){
            throw new apiError('Cannot apply to this match',400)
        }
        if (match.createdBy.equals(req.user.id)) {
            throw new apiError('You cannot apply to your own match',400);
        }
        if(match.participants.includes(req.user.id) || match.waitingList.includes(req.user.id)){
            throw new apiError('You have already applied to this match',400)
        }
        return true;
    }),
    validatorMiddleware
]

const updateMatchValidator = [
    check('matchType')
        .optional()
        .isIn(['needPlayers', 'needTeam']).withMessage('matchType must be either needPlayers or needTeam'),   
    check('matchDate')
        .optional()
        .isISO8601().withMessage('matchDate must be a valid date'),
    check('teamSize')
        .optional()
        .isInt().withMessage('teamSize must be an integer'),
    validatorMiddleware
]

const checkIdValdidator = [
    check('id').isMongoId().withMessage('Invalid Match id format'),
    validatorMiddleware
]

module.exports = {createMatchValidator,updateMatchValidator,checkIdValdidator,applyToMatchValidator}