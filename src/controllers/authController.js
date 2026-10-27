const userModel = require('../../DB/models/userModel')
const asyncHandler = require('express-async-handler')
const sendEmails = require('../utils/sendEmails')
const sendgrid = require('../utils/sendGrid')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



const signUp = asyncHandler(async(req,res)=>{
    const {first_name, last_name, username, email, position, level, gender, date_of_birth, phone, password} = req.body  
    if(!first_name || !last_name || !username || !email || !position || !level || !gender || !date_of_birth || !phone){
        return res.status(400).json({ status: 'fail', message: 'All fields are required' })
    }
    const user = await userModel.create({first_name, last_name, username, email, position, level, gender, date_of_birth, phone, password})    
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
    const refreshToken = jwt.sign({id:user._id},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.JWT_REFRESH_EXPIRES_IN})  
    if(!token || !refreshToken) return res.status(400).json({status:'fail',message:'token generation failed'})
        const {password:Pass,refreshToken:refreshTokenValue, ...others} = user._doc
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    user.refreshToken = refreshToken
    await user.save()

    return res.cookie('token',token,{...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000})
    .cookie('refreshToken',refreshToken,{...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000})   
    .status(200).json({status:'success',message:'User registered successfully',data:others,token,refreshToken })    
})

const personalInfo = asyncHandler(async(req,res)=>{
    const {username, email,phone} = req.body
    if(!username || !email || !phone){
        return res.status(400).json({ status: 'fail', message: 'All fields are required' })
    }
    const existUsername = await userModel.findOne({username})
    if (existUsername) {
        return res.status(400).json({ status: 'fail', message: 'Username already exists' })
    }
    const existEmail = await userModel.findOne({email})
    if (existEmail) {
        return res.status(400).json({ status: 'fail', message: 'Email already exists' })
    }
    const existPhone = await userModel.findOne({phone})
    if (existPhone) {
        return res.status(400).json({ status: 'fail', message: 'Phone number already exists' })
    }
    res.status(200).json({status:'success',message:'personal info is valid'})
})

const logIn = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password) return res.status(400).json({status:'fail',message:'please provide email and password'})
    const user = await userModel.findOne({email})
    if(!user || ! await bcrypt.compare(password,user.password)) {
        return res.status(400).json({status:'fail',message:'invalid email or password'})
    }
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
    const refreshToken = jwt.sign({id:user._id},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.JWT_REFRESH_EXPIRES_IN})
    if(!token || !refreshToken) return res.status(400).json({status:'fail',message:'token generation failed'})
    
    user.refreshToken = refreshToken
    await user.save()
    const {password:Pass,refreshToken:refreshTokenValue, ...others} = user._doc
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }
    return res.cookie('token',token,{...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000})
    .cookie('refreshToken',refreshToken,{...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000})
    .status(200).json({status:'success',message:'Logged in successfully',data:others,token,refreshToken})
})

const refreshTokenHandler = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token'] || req.body.refreshToken
    if(!refreshToken) return res.status(401).json({status:'fail',message:'No refresh token provided'})

    try {
        const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET)
        const user = await userModel.findOne({_id:decoded.id,refreshToken})

        if(!user) return res.status(401).json({status:'fail',message:'Invalid refresh token'})  
        if(user.isSuspended) return res.status(403).json({status:'fail',message:'User is suspended'})   
        
        // Check if password was changed after refresh token was issued
        if(user.passwordChangedAt && decoded.iat < +(user.passwordChangedAt.getTime()/1000)){
            return res.status(401).json({status:'fail',message:'Password changed, please login again'})
        }
        
        const newToken = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
        const newRefreshToken = jwt.sign({id:user._id},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.JWT_REFRESH_EXPIRES_IN})

        if(!newToken || !newRefreshToken) return res.status(400).json({status:'fail',message:'token generation failed'})
        
        user.refreshToken = newRefreshToken
        await user.save()

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
        return   res.cookie('token',newToken,{...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000})
                    .cookie('refreshToken',newRefreshToken,{...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000})
                    .status(200).json({status:'success',message:'Token refreshed successfully',token:newToken,refreshToken:newRefreshToken})
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({status:'fail',message:'Refresh token expired, please login again'})
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({status:'fail',message:'Invalid refresh token'})
        }
        return res.status(500).json({status:'fail',message:'Token refresh failed', error: error.message})
    }

})

const logout = asyncHandler(async (req, res) => {
    // Clear refresh token + this device's FCM token if user is authenticated
    if (req.user && req.user.id) {
        const { fcmToken } = req.body || {}

        const update = { $set: { refreshToken: null } }

        if (fcmToken) {
            // remove only this device's token
            update.$pull = { fcmTokens: { token: fcmToken } }
        } else {
            // fallback: no token sent, remove all of this user's tokens
            update.$set.fcmTokens = []
        }

        await userModel.findByIdAndUpdate(req.user.id, update)
    }

    // Always clear cookies even if user is not found or token is invalid
    return res
        .cookie('token', '', { expires: new Date(0) })
        .cookie('refreshToken', '', { expires: new Date(0) })
        .status(200)
        .json({ status: 'success', message: 'Logged out successfully' })
})

const forgotPassword = asyncHandler(async(req,res)=>{
    const {email} = req.body
    const user = await userModel.findOne({email})
    if(!user) return res.status(400).json({status:'fail',message:`there is no user with email ${email}`})
        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex')
        user.passwordResetCode = hashedCode
        user.passwordResetCodeExpires = Date.now() + (10 * 60 *1000)
        user.passwordResetCodeVerified = false
        await user.save()

    try {
        const message = `Hi ${user.username},\n\nwe received a request to reset your password.\nYour password reset code is ${resetCode}. \nIf you did not request this, please ignore this email.`
        await sendgrid({
            email:user.email,
            subject:'Password Reset Token',
            message
        })
    } catch (error) {
        user.passwordResetCode = undefined;
        user.passwordResetCodeExpires = undefined;
        user.passwordResetCodeVerified = undefined;
        await user.save();
        return res.status(500).json({status:'fail',message:'Error sending email',error: error.message });
    }

    res.status(200).json({status:'success',message:'Password reset code sent to email' });
})

const verifyResetCode  = asyncHandler(async(req,res)=>{
    const {resetCode} = req.body
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex')
    const user = await userModel.findOne({passwordResetCode:hashedCode,passwordResetCodeExpires:{$gt:Date.now()}})  


    if(!user) return res.status(404).json('Code Expired or Invalid')
    user.passwordResetCodeVerified = true
    await user.save()
    res.status(200).json({status:'success',message:'Code Verified'})
})

const resetPassword = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    const user = await userModel.findOne({email})
    if(!user) return res.status(404).json({status:'fail',message:`there is no user with email ${email}`})
    if(!user.passwordResetCodeVerified) return res.status(400).json({status:'fail',message:'your code is not verified'})
    user.password = password
    user.passwordChangedAt = Date.now() - 1000
    user.passwordResetCode = undefined
    user.passwordResetCodeExpires = undefined
    user.passwordResetCodeVerified = undefined
    user.refreshToken = null

    await user.save()
    const {password:pass,...others} = user._doc
    res.status(200).json({status:'success',message:'Password Reset Successful',data:others})
})


module.exports = {signUp,personalInfo,logIn,refreshTokenHandler,logout,forgotPassword,resetPassword,verifyResetCode}