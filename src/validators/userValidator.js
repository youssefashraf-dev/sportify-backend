const validatorMiddleware = require('../middlewares/validatorMiddleware')
const asyncHandler = require('express-async-handler')
const userModel = require('../../DB/models/userModel')
const bcrypt = require('bcrypt')
const {check} = require('express-validator')

const createUserValidator = [
    check('first_name')
        .notEmpty().withMessage('first name is required')
        .isAlpha().withMessage('first name must contain only letters')
    ,check('last_name')
        .notEmpty().withMessage('last name is required')
        .isAlpha().withMessage('last name must contain only letters')
    ,check('username')
        .notEmpty().withMessage('username is required')
        .custom(asyncHandler(async(value) => {
            const user = await userModel.findOne({username: value})
            if(user){ throw new Error('username already exists')}
            return true
        }))
    ,check('email')
        .notEmpty().withMessage('email is required')
        .isEmail().withMessage('invalid email format')
        .custom(asyncHandler(async(value) => {
            const user = await userModel.findOne({email: value})
            if(user){ throw new Error('email already exists')}
            return true
        }))
    ,check('position')
        .notEmpty().withMessage('position is required')
        .isIn(['GK','defender','midfielder','striker', 'winger','allrounder']).withMessage('invalid position value')
    ,check('level')
        .notEmpty().withMessage('level is required')
        .isIn(['beginner','casual','intermediate','advanced','pro']).withMessage('invalid level value')
    ,check('gender')
        .notEmpty().withMessage('gender is required')
        .isIn(['male','female']).withMessage('invalid gender value')
    ,check('date_of_birth')
        .notEmpty().withMessage('date of birth is required')
        .isDate().withMessage('invalid date format')
    ,check('phone')
        .notEmpty().withMessage('phone is required')
        .isMobilePhone(['ar-EG']).withMessage('invalid phone format')
        .custom(asyncHandler(async(value) => {
            const user = await userModel.findOne({phone: value})
            if(user){ throw new Error('phone number already exists')}
            return true
        }))
    ,check('password').notEmpty().withMessage('Please provide a password')
    .isLength({min:6}).withMessage('Password must be at least 6 characters long')
    .custom((val,{req})=>{
        if(val !== req.body.confirmPassword) throw new Error('Password and confirm password do not match')
        return true
    }),
    check('confirmPassword').notEmpty().withMessage('Please provide a confirm password')

    ,validatorMiddleware
]
const updateUserValidator = [
    check('first_name')
        .optional()
        .isAlpha().withMessage('first name must contain only letters')
    ,check('last_name')
        .optional()
        .isAlpha().withMessage('last name must contain only letters')
    ,check('username')
        .optional()
        .custom(asyncHandler(async(value, {req}) => {
            const user = await userModel.findOne({username: value, _id: { $ne: req.user.id }})
            if(user){ throw new Error('username already exists')}
            return true
        }))
    ,check('email')
        .optional()
        .isEmail().withMessage('invalid email format')
        .custom(asyncHandler(async(value, {req}) => {
            console.log(req.user.id)
            const user = await userModel.findOne({email: value, _id: { $ne: req.user.id }})
            if(user){ throw new Error('email already exists')}
            return true
        }))
    ,check('position')
        .optional()
        .isIn(['GK','defender','midfielder','striker', 'winger','allrounder']).withMessage('invalid position value')
    ,check('level')
        .optional()
        .isIn(['beginner','casual','intermediate','advanced','pro']).withMessage('invalid level value')
    ,check('gender')
        .optional()
        .isIn(['male','female']).withMessage('invalid gender value')
    ,check('date_of_birth')
        .optional()
        .isDate().withMessage('invalid date format')
    ,check('phone')
        .optional()
        .isMobilePhone(['ar-EG']).withMessage('invalid phone format')
        .custom(asyncHandler(async(value, {req}) => {
            const user = await userModel.findOne({phone: value, _id: { $ne: req.user.id }})
            if(user){ throw new Error('phone number already exists')}
            return true
        }))
    ,validatorMiddleware
]
const changeUserPasswordValidator = [
    check('currentPassword').notEmpty().withMessage('Please provide your current password')
    .custom(async(val,{req})=>{
        const user = await userModel.findById(req.user.id)
        if(!user) throw new Error('There is no user with this id')
        const isMatch = await bcrypt.compare(val,user.password)
        if(!isMatch) throw new Error('Current password is incorrect')
        return true
    })
    ,check('newPassword').notEmpty().withMessage('Please provide a new password')
    .isLength({min:6}).withMessage('New password must be at least 6 characters long')
    .custom((val,{req})=>{
        if(val !== req.body.confirmPassword) throw new Error('New password and confirm new password do not match')
        return true
    })
    ,check('confirmPassword').notEmpty().withMessage('Please provide a confirm new password')
    ,validatorMiddleware
]

const userIdValidator = [
    check('id').isMongoId().withMessage('Invalid Id Format'),
    validatorMiddleware
]



module.exports = {
    createUserValidator,
    updateUserValidator,
    changeUserPasswordValidator,
    userIdValidator
}