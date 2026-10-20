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
const promoCodeModel = require('../../DB/models/promoCodeModel')
// const mongoose = require('mongoose')

const createBooking = asyncHandler(async (req, res) => {
    const { court, bookingDate, promoCode } = req.body
    let { timeSlots } = req.body

    // Check time slot or more
    timeSlots = Array.isArray(timeSlots) ? timeSlots : [timeSlots]

    if (!timeSlots.length) {
        return res.status(400).json({
            status: 'fail',
            message: 'At least one time slot is required'
        })
    }

    // Check user exists
    const userExists = await userModel.findById(req.user.id)

    if (!userExists) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found'
        })
    }

    // Find court
    const courtDoc = await courtModel.findById(court)

    if (!courtDoc) {
        return res.status(404).json({
            status: 'fail',
            message: 'Court not found'
        })
    }

    // Check slots belong to this court
    const slots = await slotModel.find({
        _id: { $in: timeSlots },
        court
    })

    if (slots.length !== timeSlots.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'One or more slots not found'
        })
    }

    // Check booked slots and availability
    const bookedSlots = await bookingModel.find({
        court,
        bookingDate,
        timeSlots: { $in: timeSlots },
        status: { $in: ['pending', 'confirmed'] }
    })

    if (bookedSlots.length > 0) {
        const requestedSlotIds = timeSlots.map(id => id.toString())

        const bookedIds = bookedSlots
            .flatMap(b =>
                b.timeSlots.map(id => id.toString())
            )
            .filter(id => requestedSlotIds.includes(id))

        return res.status(400).json({
            status: 'fail',
            message: `Slots already booked: ${bookedIds.join(', ')}`
        })
    }

    // ==========================================
    // CALCULATE ORIGINAL PRICE ON SERVER
    // ==========================================

    let originalAmount = 0

    slots.forEach(slot => {
        const [startHour, startMinute] =
            slot.startTime.split(':').map(Number)

        const [endHour, endMinute] =
            slot.endTime.split(':').map(Number)

        let startMinutes =
            startHour * 60 + startMinute

        let endMinutes =
            endHour * 60 + endMinute

        // Handle slot crossing midnight
        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60
        }

        const durationHours =
            (endMinutes - startMinutes) / 60

        originalAmount +=
            durationHours * courtDoc.pricePerHour
    })

    originalAmount = Number(
        originalAmount.toFixed(2)
    )

    // ==========================================
    // APPLY PROMO CODE
    // ==========================================

    let discountAmount = 0
    let appliedPromoCode = null

    if (promoCode && promoCode.trim() !== '') {
        const normalizedPromoCode =
            promoCode.trim().toUpperCase()

        const promo = await promoCodeModel.findOne({
            code: normalizedPromoCode
        })

        if (!promo) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid promo code'
            })
        }

        if (!promo.isActive) {
            return res.status(400).json({
                status: 'fail',
                message: 'Promo code is inactive'
            })
        }

        if (new Date() > new Date(promo.expiresAt)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Promo code has expired'
            })
        }

        discountAmount = Number(
            (
                originalAmount *
                (promo.discountPercentage / 100)
            ).toFixed(2)
        )

        appliedPromoCode = promo.code
    }

    // ==========================================
    // FINAL PRICE
    // ==========================================

    const totalAmount = Number(
        (
            originalAmount -
            discountAmount
        ).toFixed(2)
    )

    // ==========================================
    // CREATE BOOKING
    // ==========================================

    const newBooking = await bookingModel.create({
        user: req.user.id,
        court,
        bookingDate,
        timeSlots,
        originalAmount,
        discountAmount,
        promoCode: appliedPromoCode,
        totalAmount,
        status: 'pending'
    })

    if (!newBooking) {
        return res.status(400).json({
            status: 'fail',
            message: 'Booking not created'
        })
    }

    // Send notification to all admins
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

    return res.status(201).json({
        status: 'success',
        message: 'Booking created successfully',
        data: newBooking,
        pricing: {
            originalAmount,
            discountAmount,
            totalAmount,
            promoCode: appliedPromoCode
        }
    })
})

const uploadPaymentReceipt = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!req.file) {
        return res.status(400).json({
            status: 'fail',
            message: 'No payment receipt uploaded'
        })
    }

    req.body.paymentReceipt = req.file.path

    const booking = await bookingModel
        .findById(id)
        .populate('user', 'username')

    if (!booking) {
        return res.status(404).json({
            status: 'fail',
            message: 'Booking not found'
        })
    }

    if (booking.user._id.toString() !== req.user.id) {
        return res.status(403).json({
            status: 'fail',
            message: 'Unauthorized'
        })
    }

    if (
        booking.status !== 'pending' &&
        booking.status !== 'under review'
    ) {
        return res.status(400).json({
            status: 'fail',
            message: 'Booking already processed'
        })
    }

    booking.paymentReceipt = req.body.paymentReceipt
    booking.status = 'under review'
    booking.isPaid = true

    await booking.save()

    // Send notification to all admins
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

    res.status(200).json({
        status: 'success',
        message: 'Receipt uploaded, waiting for admin approval',
        data: booking
    })
})

const getBookings = asyncHandler(async (req, res) => {
    const mongooseQuery = bookingModel.find()

    const features = new apiFeatures(
        req.query,
        mongooseQuery
    )
        .filter()
        .sort()
        .paginate()

    const bookings =
        await features.mongooseQuery
            .populate({
                path: 'user',
                select: 'first_name last_name email phone'
            })
            .populate({
                path: 'court',
                select: 'name location'
            })
            .populate({
                path: 'timeSlots',
                select: 'date startTime endTime'
            })

    res.status(200).json({
        status: 'success',
        message: 'Bookings retrieved successfully',
        totalElements: bookings.length,
        data: bookings
    })
})

const getMyBookings = asyncHandler(async (req, res) => {
    const userId = req.user.id

    const bookings = await bookingModel
        .find({ user: userId })
        .sort('-createdAt')
        .populate({
            path: 'court',
            select: 'name location'
        })
        .populate({
            path: 'timeSlots',
            select: 'startTime endTime'
        })

    res.status(200).json({
        status: 'success',
        message: 'My bookings retrieved successfully',
        data: bookings
    })
})

const getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const booking = await bookingModel
        .findById(id)
        .populate({
            path: 'court',
            select: 'name location'
        })
        .populate({
            path: 'timeSlots',
            select: 'startTime endTime'
        })
        .populate({
            path: 'user',
            select: 'first_name last_name email phone'
        })

    booking
        ? res.status(200).json({
            status: 'success',
            message: 'Booking retrieved successfully',
            data: booking
        })
        : res.status(404).json({
            status: 'fail',
            message: 'Booking not found'
        })
})

const updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = [
        'confirmed',
        'rejected'
    ]

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid status value'
        })
    }

    const booking = await bookingModel.findById(id)

    if (!booking) {
        return res.status(404).json({
            status: 'fail',
            message: 'Booking not found'
        })
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({
            status: 'fail',
            message: 'Cancelled booking cannot be updated'
        })
    }

    booking.status = status

    await booking.save()

    if (status === 'confirmed') {
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
    } else if (status === 'rejected') {
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

    res.status(200).json({
        status: 'success',
        message: 'Booking status successfully',
        data: booking
    })
})

const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params

    const booking = await bookingModel.findById(id)

    if (!booking) {
        return res.status(404).json({
            status: 'fail',
            message: 'Booking not found'
        })
    }

    if (booking.user.toString() !== req.user.id) {
        return res.status(403).json({
            status: 'fail',
            message: 'Unauthorized'
        })
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({
            status: 'fail',
            message: 'Booking already cancelled'
        })
    }

    booking.status = 'cancelled'

    await booking.save()

    const match = await matchModel.findOne({
        booking: booking._id
    })

    if (match) {
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

    res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully',
        data: booking
    })
})

module.exports = {
    createBooking,
    uploadPaymentReceipt,
    getBookings,
    getMyBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking
}