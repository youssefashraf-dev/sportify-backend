const slotModel = require('../../DB/models/slotModel')
const bookingModel = require('../../DB/models/bookingModel')
const userModel = require('../../DB/models/userModel')
const courtModel = require('../../DB/models/courtModel')
const apiFeatures = require('../utils/apiFeatures')
const sendEmails = require('../utils/sendEmails')
const sendgrid = require('../utils/sendGrid')
const NotificationService = require('../services/notificationService')
const matchModel = require('../../DB/models/matchModel')
const asyncHandler = require('express-async-handler')
// const mongoose = require('mongoose')




const createBooking = asyncHandler(async (req, res) => {
    const { court, bookingDate, totalAmount } = req.body
    let {timeSlots} = req.body
    
    // check time slot or more
    timeSlots = Array.isArray(timeSlots) ? timeSlots : [timeSlots]
    // check user exists
    const userExists = await userModel.findById(req.user.id)
    if(!userExists){
        return res.status(404).json({ status: 'fail', message: 'User not found' })
    }
    // find price per hour from court
    const courtDoc = await courtModel.findById(court);
    if(!courtDoc){
        return res.status(404).json({ status: 'fail', message: 'Court not found' });
    }
    // check exist slots
    const slots = await slotModel.find({ _id: { $in: timeSlots }, court })
    if (slots.length !== timeSlots.length) {
        return res.status(404).json({ status: 'fail', message: 'One or more slots not found' });
    }

    // booked slots and availability
    const bookedSlots = await bookingModel.find({
        court,
        bookingDate,
        timeSlots: { $in: timeSlots },
        status: { $in: ['pending', 'confirmed'] }
    })
    if(bookedSlots.length > 0){
        const bookedIds = bookedSlots.flatMap(b => b.timeSlots.map(id => id.toString()))
        .filter(id => timeSlots.includes(id))
        return res.status(400).json({ status: 'fail', message: `Slots already booked: ${bookedIds.join(', ')}` });
    }

    // let totalAmountCalc = 0;
    // slots.forEach(slot => {
    //     const start = moment(slot.startTime, 'HH:mm');
    //     const end = moment(slot.endTime, 'HH:mm');
    //     const durationHours = moment.duration(end.diff(start)).asHours();
    //     totalAmount += durationHours * courtDoc.pricePerHour;
    // });
    
    const newBooking = await bookingModel.create({user:req.user.id,court,bookingDate,timeSlots,totalAmount,status: 'pending'})
    newBooking ? res.status(201).json({ status: 'success', message: 'Booking created successfully', data: newBooking }) : res.status(400).json({ status: 'fail', message: 'Booking not created' })       

    // Send notification to all admins about new booking request
    await NotificationService.sendToAllAdmins({
        type: 'BOOKING_REQUESTED',
        title: 'New Booking Request',
        body: `${userExists.username} has requested a booking at ${courtDoc.name}`,
        data: {
            bookingId: newBooking._id,
            userId: req.user.id,
            courtId: court,
            bookingDate
        }
    })

    // try {
    //     const message = `Hi ${userExists.username},\n\nYou're all set to play at ${courtDoc.name}\nHere are your booking details: \nDate:${bookingDate}\nTime:${slots.map(slot => `${slot.startTime} - ${slot.endTime}`).join(', ')}\nTotal Amount: $${totalAmount}\nBooking ID: ${newBooking._id}\n\nPlease upload your payment receipt to confirm your booking.\n\nEnjoy your game!`    
    //     await sendgrid({
    //         email:userExists.email,
    //         subject:'Court Booking Confirmation',
    //         message
    //     })
    // } catch (error) {
    //     console.error(`error while sending the email ${error.message}`);
    // }
    // const session = await mongoose.startSession()
    // try {
    //     session.startTransaction()
    //     const slot = await slotModel.findOne({ _id: timeSlot, court})
    //     const [newBooking] = await bookingModel.create([{
    //         user: req.user.id,
    //         court,
    //         bookingDate,
    //         timeSlot,
    //         totalAmount,
    //         status: 'pending'
    //     }],{ session });
    //     slot.isAvailable = false
    //     await slot.save({ session })

    //     await session.commitTransaction()
    //     session.endSession()
    //     return res.status(201).json({ status: 'success', message: 'Booking created successfully', booking: newBooking })
    // } catch (error) {
    //     await session.abortTransaction()
    //     session.endSession()
    //     res.status(400).json({ status: 'fail', message: error.message })   
    // }
})

const uploadPaymentReceipt = asyncHandler(async (req, res) => {
    const { id } = req.params
    if(!req.file) return res.status(400).json({ status: 'fail', message: 'No payment receipt uploaded' })
    req.body.paymentReceipt = req.file.path

    const booking = await bookingModel.findById(id).populate('user', 'username')
    if(!booking){
        return  res.status(404).json({ status: 'fail', message: 'Booking not found' })
    }
    if (booking.user._id.toString() !== req.user.id) {
        return res.status(403).json({ status: 'fail', message: 'Unauthorized' })
    }
    if (booking.status !== 'pending' && booking.status !== 'under review') return res.status(400).json({ status: 'fail', message: 'Booking already processed' })
    booking.paymentReceipt = req.body.paymentReceipt
    booking.status = 'under review'
    booking.isPaid = true
    await booking.save()

    // Send notification to all admins about payment receipt upload
    await NotificationService.sendToAllAdmins({
        type: 'RECEIPT_UPLOADED',
        title: 'Payment Receipt Uploaded',
        body: `${booking.user.username} has uploaded a payment receipt for booking review`,
        data: {
            bookingId: id,
            userName: req.user.id,
            courtId: booking.court
        }
    })

    res.status(200).json({ status: 'success', message: 'Receipt uploaded, waiting for admin approval', data: booking })
})

const getBookings = asyncHandler(async (req, res) => {
    const mongooseQuery = bookingModel.find()
    const features = new apiFeatures(req.query, mongooseQuery)
    .filter()
    .sort()
    .paginate()
    const bookings = await features.mongooseQuery.populate({path:'user',select:'first_name last_name email phone'}).populate({path:'court',select:'name location'}).populate({path:'timeSlots',select:'date startTime endTime'}) 
    res.status(200).json({ status: 'success', message: 'Bookings retrieved successfully',totalElements:bookings.length,data: bookings})
})

const getMyBookings = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const bookings = await bookingModel.find({ user: userId }).sort('-createdAt').populate({path: 'court',select: 'name location'}).populate({path: 'timeSlots',select: 'startTime endTime'})   
    res.status(200).json({ status: 'success', message: 'My bookings retrieved successfully', data: bookings })  
})

const getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const booking = await bookingModel.findById(id).populate({path: 'court',select: 'name location'}).populate({path: 'timeSlots',select: 'startTime endTime'}).populate({path:'user',select:'first_name last_name email phone'})      
    booking ? res.status(200).json({ status: 'success', message: 'Booking retrieved successfully', data: booking }) : res.status(404).json({ status: 'fail', message: 'Booking not found' })
})

const updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params
    const {status} = req.body

    const allowedStatuses = ['confirmed', 'rejected']
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({status: 'fail',message: 'Invalid status value'})
    }
    const booking = await bookingModel.findById(id)
    if(!booking){
        return res.status(404).json({ status: 'fail', message: 'Booking not found' })
    }

    if (booking.status === 'cancelled') return res.status(400).json({status: 'fail',message: 'Cancelled booking cannot be updated'})

    booking.status = status
    await booking.save()

    if(status === 'confirmed'){
        await NotificationService.send({
        userId: booking.user,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        body: 'Your booking has been confirmed',
        data: {
            bookingId: booking._id,
            courtId: booking.court
        }
    }) 
    } else if(status === 'rejected'){
        await NotificationService.send({
        userId: booking.user,
        type: 'BOOKING_REJECTED',
        title: 'Booking Rejected',
        body: 'Your booking has been rejected',
        data: {
            bookingId: booking._id,
            courtId: booking.court
        }
    }) 
    }
    res.status(200).json({ status: 'success', message: 'Booking status successfully', data: booking })
})

const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params
    const booking = await bookingModel.findById(id)
    if(!booking){
        return res.status(404).json({ status: 'fail', message: 'Booking not found' })
    }
    if (booking.user.toString() !== req.user.id) {
        return res.status(403).json({ status: 'fail', message: 'Unauthorized' })
    }
    if (booking.status === 'cancelled') return res.status(400).json({status: 'fail',message: 'Booking already cancelled'})
    
    booking.status = 'cancelled'
    await booking.save()

    const match = await matchModel.findOne({ booking: booking._id })
    if(match){
        match.status = 'cancelled'
        await match.save()
    }

    await NotificationService.send({
        userId: booking.user,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        body: 'Your booking has been cancelled',
        data: {
            bookingId: booking._id,
            courtId: booking.court
        }
    })
    res.status(200).json({ status: 'success', message: 'Booking cancelled successfully', data: booking })
})


module.exports = { createBooking,uploadPaymentReceipt,getBookings,getMyBookings,getBookingById,updateBookingStatus,cancelBooking } 