const validatorMiddleware = require('../middlewares/validatorMiddleware')
const courtModel = require('../../DB/models/courtModel')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const {check} = require('express-validator')

const createCourtValidator = [
    check('name')
        .notEmpty().withMessage('Court name is required')
        .isLength({min:3,max:100}).withMessage('Court name must be between 3 and 100 characters')
        .custom(async (value,{req}) => {
            const court = await courtModel.findOne({name:value})
            if(court){
                throw new Error('Court name already exists')
            }
            req.body.slug = slugify(value)
            return true
        }),
    check('description')
        .notEmpty().withMessage('Description is required')
        .isLength({min:10,max:500}).withMessage('Description must be between 10 and 500 characters'),
    check('phone')
        .notEmpty().withMessage('Contact phone number is required')
        .isMobilePhone(['ar-EG']).withMessage('invalid phone format'),
        // .custom(asyncHandler(async(value)=>{
        //     const court = await courtModel.findOne({phone:value})
        //     if(court){
        //         throw new Error('Phone number already exists')
        //     }
        //     return true
        // })),
    check('terms')
        .notEmpty().withMessage('Terms are required')
        .isLength({min:10,max:1000}).withMessage('Terms must be between 10 and 1000 characters'),
    check('size')
        .notEmpty().withMessage('Court size is required')
        .isIn(['1x1','2x2','5x5','7x7','11x11']).withMessage('Court size must be one of 1x1, 2x2, 5x5, 7x7, or 11x11'),
    check('type')
        .notEmpty().withMessage('Court type is required')
        .isIn(['football','padel','tennis','others']).withMessage('Court type must be one of football, padel, tennis, or others'),
    check('pricePerHour')
        .notEmpty().withMessage('Price per hour is required')
        .isFloat({min:0}).withMessage('Price per hour must be a positive number'),
    check('address')
        .notEmpty().withMessage('Court address is required'),
    // check('location.coordinates')
    //     .isArray({min:2,max:2}).withMessage('Location coordinates must be an array of [longitude, latitude]'),
    validatorMiddleware
]
const updateCourtValidator = [
    check('name')
        .optional()
        .isLength({min:3,max:100}).withMessage('Court name must be between 3 and 100 characters')
        .custom(async (value,{req}) => {
            const court = await courtModel.findOne({name:value})
            if(court){
                return new Error('Court name already exists')
            }
            req.body.slug = slugify(value)
            return true
        }),
    check('description')
        .optional()
        .isLength({min:10,max:500}).withMessage('Description must be between 10 and 500 characters'),
    check('phone')
        .optional()
        .isMobilePhone(['ar-EG']).withMessage('invalid phone format'),
        // .custom(asyncHandler(async(value)=>{
        //     const court = await courtModel.findOne({phone:value})
        //     if(court){
        //         throw new Error('Phone number already exists')
        //     }
        //     return true
        // })),   
    check('terms')
        .optional()
        .isLength({min:10,max:1000}).withMessage('Terms must be between 10 and 1000 characters'),
    check('size')
        .optional()
        .isIn(['1x1','2x2','5x5','7x7','11x11']).withMessage('Court size must be one of 1x1, 2x2, 5x5, 7x7, or 11x11'),
    check('type')
        .optional()
        .isIn(['football','padel','tennis','others']).withMessage('Court type must be one of football, padel, tennis, or others'),
    check('pricePerHour')
        .optional()
        .isFloat({min:0}).withMessage('Price per hour must be a positive number'),
    // check('location.coordinates')
    //     .optional()
    //     .isArray({min:2,max:2}).withMessage('Location coordinates must be an array of [longitude, latitude]'),
    validatorMiddleware
]

const courtIdValidator = [
    check('id').isMongoId().withMessage('Invalid Id Format'),
    validatorMiddleware
]



module.exports = {createCourtValidator,updateCourtValidator,courtIdValidator}