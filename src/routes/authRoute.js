const {signUp,personalInfo,logIn,refreshTokenHandler,logout,forgotPassword,resetPassword,verifyResetCode} = require('../controllers/authController')
const {createUserValidator} = require('../validators/userValidator')
const {verifyToken} = require('../middlewares/verifyToken')
const {authLimiter} = require('../middlewares/rateLimiter')
const router = require('express').Router()


router.post('/signup',authLimiter,createUserValidator,signUp)
router.post('/personal-info',personalInfo)
router.post('/login',authLimiter,logIn)
router.post('/refresh-token',authLimiter,refreshTokenHandler)
router.post('/logout',verifyToken,logout)
router.post('/forgot-password',authLimiter,forgotPassword)
router.post('/verify-reset-code',authLimiter,verifyResetCode)
router.post('/reset-password',authLimiter,resetPassword)


module.exports = router