const userModel = require('../../DB/models/userModel')
const apiFeatures = require('../utils/apiFeatures')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
    const mongooseQuery = userModel.find()
    const features = new apiFeatures(req.query, mongooseQuery)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()

    const users = await features.mongooseQuery
    // const users = await userModel.find({})
    res.status(200).json({ status: 'success', message:'Users fetched successfully', totalElements: users.length, data: users }) 
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  public
const getUserById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const user = await userModel.findById(id)
    user ? res.status(200).json({ status: 'success', message:'User fetched successfully', data: user }) : res.status(404).json({ status: 'fail', message: 'User not found' })    
})

// @desc    Create a new user
// @route   POST /api/users
// @access  Private
const createUser = asyncHandler(async (req, res) => {
    const {first_name, last_name, username, email, position, level, gender, date_of_birth, phone, password,role} = req.body  
    if(!first_name && !last_name && !username && !email && !position && !level && !gender && !date_of_birth && !phone){
        return res.status(400).json({ status: 'fail', message: 'All fields are required' })
    }
    if(role === 'admin'){
        req.body.isVerified = true
    }
    const newUser = await userModel.create({first_name, last_name, username, email, position, level, gender, date_of_birth, phone, password, role})   
    newUser ? res.status(201).json({ status: 'success', msg: 'User created successfully', data: newUser }) : res.status(400).json({ status: 'fail', message: 'User not created' })    
})

// @desc    Update user by ID
// @route   PUT /api/users/:id
// @access  Private
const updateUserById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const {first_name, last_name, username, email, position, level, gender, date_of_birth, phone} = req.body  
    const user = await userModel.findByIdAndUpdate(id, {first_name, last_name, username, email, position, level, gender, date_of_birth, phone}, {new: true})
    user ? res.status(200).json({ status: 'success', message:'User updated successfully', data: user }) : res.status(404).json({ status: 'fail', message: 'User not found' })    
})

// @desc    Delete user by ID
// @route   DELETE /api/users/:id
// @access  Private
const deleteUserById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const user = await userModel.findByIdAndDelete(id)
    user ? res.status(200).json({ status: 'success', message:'User deleted successfully'}) : res.status(404).json({ status: 'fail', message: 'User not found' })    
})

// @desc    Verify user account
// @route   PATCH /api/users/verify/:id
// @access  Private
const verifyUser = asyncHandler(async (req, res) => {
    const {id} = req.params
    const user = await userModel.findById(id)    
    if (!user) {
        return res.status(404).json({status:'fail', message:'User not found'})
    }
    user.isVerified = true
    await user.save()
    res.status(200).json({ status: 'success', message:'User verified successfully', data: user })
})

// @desc    Suspend or Unsuspend user account
// @route   PUT /api/users/suspend/:id
// @access  Private
const suspendUser = asyncHandler(async (req, res) => {
    const {id} = req.params
    const user = await userModel.findById(id)
    if(!user){
        return res.status(404).json({status:'fail', message:'User not found'})
    }
    user.isSuspended = !user.isSuspended
    await user.save()
    res.status(200).json({ status: 'success', message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`, data: user })
})


// ===================================================
// logged user operations
// ==================================================

// @desc    Get logged user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req,res)=>{
    req.params.id = req.user.id
    getUserById(req,res)
})

// @desc    Update logged user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req,res)=>{
    req.params.id = req.user.id
    updateUserById(req,res)
})

// @desc    Change logged user password
// @route   PUT /api/users/change-password
// @access  Private
const changeUserPassword = asyncHandler(async (req,res)=>{
    const {id} = req.user
    const {newPassword} = req.body

    if(newPassword.length < 6){
        return  res.status(400).json({status:'fail',message:'Password must be at least 6 characters'})
    }
    const user = await userModel.findById(id)
    user.password = newPassword
    user.passwordChangedAt = Date.now()
    await user.save()

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
    const {password:Pass, ...others} = user._doc
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
    res.cookie('token',token,cookieOptions).status(200).json({status:'success',message:'Password changed successfully',data: others,token})
})


// @desc    Delete logged user account
// @route   DELETE /api/users/delete-profile
// @access  Private
const deleteUserProfile = asyncHandler(async (req,res)=>{
    req.params.id = req.user.id
    deleteUserById(req,res)
})


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById,
    verifyUser,
    suspendUser,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserProfile
}