const slotModel = require('../../DB/models/slotModel')
const bookingModel = require('../../DB/models/bookingModel')
const apiFeatures = require('../utils/apiFeatures')
const asyncHandler = require('express-async-handler')


const createSlot = asyncHandler(async (req, res) => {
    const { court, startTime, endTime } = req.body
    if(!court || !startTime || !endTime){
        return res.status(400).json({status:'fail', message:'court, startTime and endTime are required'})
    }
    const slotExists = await slotModel.findOne({court, startTime, endTime})
    if(slotExists){
        return  res.status(409).json({status:'fail', message:'Slot already exists for the given court and time range'})
    }

    const newSlot = await slotModel.create({court, startTime, endTime})
    newSlot ? res.status(201).json({status: 'success', message:'Slot created successfully', data: newSlot}) : res.status(500).json({status:'fail', message:'Failed to create slot'})   
})

const getSlots = asyncHandler(async (req, res) => {
    const mongooseQuery = slotModel.find()
    const features = new apiFeatures(req.query, mongooseQuery)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()

    const slots = await features.mongooseQuery.populate({path:'court', select:'name location'})
    // const slots =  await slotModel.find().populate({path:'court', select:'name location'})
    res.status(200).json({ status: 'success', message: 'Slots retrieved successfully', totalElements:slots.length, data: slots })    
})

const getAvaliableSlots = asyncHandler(async (req, res) => {
    const { court,date} = req.query

    const slots = await slotModel.find({court}).populate({ path: 'court', select: 'name location' })

    const bookings = await bookingModel.find({
        court,
        bookingDate: date,
        status: { $in: ['pending', 'confirmed','under review'] }
    }).select('timeSlots')

    // collect booked slot ids 
    const bookedSlotIds = new Set()
    bookings.forEach(booking => {
        booking.timeSlots.forEach(slotId => {
            bookedSlotIds.add(slotId.toString())
        })
    })

    // show slots with Availability 
    const slotsWithAvailability = slots.map(slot => {
        return {...slot.toObject(),isAvailable: !bookedSlotIds.has(slot._id.toString())}
    })
    // return slots count
    const availableSlotsCount = slotsWithAvailability.filter(slot => slot.isAvailable).length
    res.status(200).json({ status: 'success', message: 'Available slots retrieved successfully',totalElements:slots.length,availableSlots:availableSlotsCount, data: slotsWithAvailability  })
})

const getSlotById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const slot = await slotModel.findById(id).populate({ path: 'court', select: 'name location' })
    slot ? res.status(200).json({ status: 'success', message: 'Slot retrieved successfully', data: slot }) : res.status(404).json({ status: 'fail', message: 'Slot not found' })  
})

const updateSlot = asyncHandler(async (req, res) => {
    const { id } = req.params
    const slot = await slotModel.findByIdAndUpdate(id, req.body, { new: true })
    slot ? res.status(200).json({ status: 'success', message: 'Slot updated successfully', data: slot }) : res.status(404).json({ status: 'fail', message: 'Slot not found' })
})

const deleteSlot = asyncHandler(async (req, res) => {
    const { id } = req.params
    const slot = await slotModel.findByIdAndDelete(id)
    slot ? res.status(200).json({ status: 'success', message: 'Slot deleted successfully' }) : res.status(404).json({ status: 'fail', message: 'Slot not found' })  
})


module.exports = { createSlot, getSlots, getAvaliableSlots, getSlotById, updateSlot, deleteSlot }