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

    // check time slot or more
    timeSlots = Array.isArray(timeSlots) ? timeSlots : [timeSlots]

    if (!timeSlots.length) {
        return res.status(400).json({
            status: 'fail',
            message: 'At least one time slot is required'
        })
    }

    // check user exists
    const userExists = await userModel.findById(req.user.id)

    if (!userExists) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found'
        })
    }

    // find court
    const courtDoc = await courtModel.findById(court)

    if (!courtDoc) {
        return res.status(404).json({
            status: 'fail',
            message: 'Court not found'
        })
    }

    // check slots belong to this court
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

    // booked slots and availability
    const bookedSlots = await bookingModel.find({
        court,
        bookingDate,
        timeSlots: { $in: timeSlots },
        status: { $in: ['pending', 'confirmed'] }
    })

    if (bookedSlots.length > 0) {
        const requestedSlotIds = timeSlots.map(id => id.toString())

        const bookedIds = bookedSlots
            .flatMap(b => b.timeSlots.map(id => id.toString()))
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
        const [startHour, startMinute] = slot.startTime.split(':').map(Number)
        const [endHour, endMinute] = slot.endTime.split(':').map(Number)

        let startMinutes = startHour * 60 + startMinute
        let endMinutes = endHour * 60 + endMinute

        // handle slot crossing midnight
        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60
        }

        const durationHours = (endMinutes - startMinutes) / 60

        originalAmount += durationHours * courtDoc.pricePerHour
    })

    // round to 2 decimal places
    originalAmount = Number(originalAmount.toFixed(2))

    // ==========================================
    // APPLY PROMO CODE
    // ==========================================

    let discountAmount = 0
    let appliedPromoCode = null

    if (promoCode && promoCode.trim() !== '') {
        const normalizedPromoCode = promoCode.trim().toUpperCase()

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

        discountAmount =
            originalAmount * (promo.discountPercentage / 100)

        discountAmount = Number(discountAmount.toFixed(2))

        appliedPromoCode = promo.code
    }

    // ==========================================
    // FINAL PRICE
    // ==========================================

    const totalAmount = Number(
        (originalAmount - discountAmount).toFixed(2)
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

    res.status(201).json({
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