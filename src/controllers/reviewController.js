const reviewModel = require('../../DB/models/reviewModel')
const asyncHandler = require('express-async-handler')
const apiFeatures = require('../utils/apiFeatures')



const createReview = asyncHandler(async(req,res)=>{
    const { courtId, booking, ratings, comment } = req.body
    req.body.user = req.user.id
    const review = await reviewModel.create({ courtId, booking, ratings, comment, user: req.user.id })
    review ? res.status(201).json({status:'success',message:'Review created successfully',data: review}) : res.status(400).json({status:'fail',message:'Review creation failed' })  
})

const getReview = asyncHandler(async(req,res)=>{
    const {id} = req.params
    let filterObj = {_id:id}
    if(req.params.courtId) {
        filterObj = {_id:id,courtId:req.params.courtId}
    }

    const review = await reviewModel.findOne(filterObj).populate({path:'user',select:'first_name last_name email phone'}).populate({path:'courtId',select:'name location'}) 
    review ? res.status(200).json({status:'success',message:'Review fetched successfully',data: review}) : res.status(404).json({status:'fail',message:'Review Not Found' })   
})

const getReviews = asyncHandler(async(req,res)=>{
    let filterObj = {}
    if(req.params.courtId) filterObj = {courtId:req.params.courtId}
    
    const mongooseQuery = reviewModel.find(filterObj)
    const features = new apiFeatures(req.query,mongooseQuery)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()

    const reviews = await features.mongooseQuery.populate({path:'user',select:'first_name last_name email phone'}).populate({path:'courtId',select:'name location'})    
    const countDocuments = await reviewModel.countDocuments()
    reviews ? res.status(200).json({ status: 'success', message: 'Reviews fetched successfully', totalElements:countDocuments, data: reviews}) : res.status(404).json({status:'fail',message:'No Reviews Found' })  
})

const updateReview = asyncHandler(async(req,res)=>{
    const {id} = req.params
    const review = await reviewModel.findByIdAndUpdate(id,req.body,{new:true})
    await review.save()
    review ? res.status(200).json({status:'success',message:'Review updated successfully',data: review}) : res.status(404).json({status:'fail',message:'Review Not Found' })   
})

const deleteReview = asyncHandler(async(req,res)=>{
    const {id} = req.params
    const review = await reviewModel.findByIdAndDelete(id)
    review ? res.status(200).json({status:'success',message:'Review deleted successfully'}) : res.status(404).json({status:'fail',message:'Review Not Found' })     
})


module.exports = {createReview,getReview,getReviews,updateReview,deleteReview}