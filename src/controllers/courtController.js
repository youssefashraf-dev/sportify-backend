const courtModel = require('../../DB/models/courtModel')
const apiFeatures = require('../utils/apiFeatures')
const asyncHandler = require('express-async-handler')


const createCourt = asyncHandler(async (req, res) => {
    // if(req.file){
    //     const imagePath = `${req.protocol}://${req.get("host")}/uploads/courts/${req.file.filename}`;
    //     console.log(imagePath)
    //     req.body.courtImages = [imagePath]
    // }
    // if(req.files){
    //     console.log(req.files)
    //     const images = []
    //     req.files.courtImages.forEach(file => {
    //         images.push(`${req.protocol}://${req.get("host")}/uploads/courts/${file.filename}`);
    //     })
    //     req.body.courtImages = images
    // }
    if (req.body.instapay) {
        req.body.instapay = JSON.parse(req.body.instapay);
    }
    const court = await courtModel.create(req.body)
    court?res.status(201).json({ status: 'success', message: 'Court created successfully', data: court }) : res.status(400).json({ status: 'fail', message: 'Court creation failed' })    
})

const getAllCourts = asyncHandler(async (req, res) => {
    const mongooseQuery = courtModel.find()
    const features = new apiFeatures(req.query, mongooseQuery)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()
    
    const courts = await features.mongooseQuery
    // const courts = await courtModel.find()
    res.status(200).json({ status: 'success', message: 'Courts retrieved successfully',totalElements:courts.length,data: courts })
})

const getCourtById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const court = await courtModel.findById(id)
    court?res.status(200).json({ status: 'success', data: court }) : res.status(404).json({ status: 'fail', message: 'Court not found' })
})

const updateCourtById = asyncHandler(async (req, res) => {
    const {id} = req.params

    // update court images if files are uploaded without deleting existing ones
    let newImages = []
    if (req.files && req.files.courtImages) {
        newImages = req.files.courtImages.map(file => file.path)
    }
    const { courtImages, ...rest } = req.body
    const updateData = { ...rest }
    if (newImages.length > 0) {
        updateData.$push = { courtImages: { $each: newImages } }
    }
    const court = await courtModel.findByIdAndUpdate(id, updateData, {new:true})
    court?res.status(200).json({ status: 'success', message: 'Court updated successfully', data: court }) : res.status(404).json({ status: 'fail', message: 'Court not found' })
})  

const updateCourtLocation = asyncHandler(async (req, res) => {
    const {id} = req.params
    const updates = {}

    if (req.body.location?.description) {
        updates["location.description"] = req.body.location.description
    }

    if (req.body.location?.coordinates) {
        updates["location.coordinates"] = req.body.location.coordinates
    }
    const court = await courtModel.findByIdAndUpdate(id, { $set: updates }, {new:true})
    court?res.status(200).json({ status: 'success', message: 'Court updated successfully', data: court }) : res.status(404).json({ status: 'fail', message: 'Court not found' })
})  

const deleteCourtById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const court = await courtModel.findByIdAndDelete(id)
    court?res.status(200).json({ status: 'success', message: 'Court deleted successfully' }) : res.status(404).json({ status: 'fail', message: 'Court not found' }) 
})


module.exports = {createCourt,getAllCourts,getCourtById,updateCourtById,updateCourtLocation,deleteCourtById}