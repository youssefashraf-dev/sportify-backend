const asyncHandler = require('express-async-handler')
const promoCodeModel = require('../../DB/models/promoCodeModel')
const courtModel = require('../../DB/models/courtModel')
const slotModel = require('../../DB/models/slotModel')

// ==========================================
// CREATE PROMO CODE - ADMIN
// ==========================================

const createPromoCode = asyncHandler(async (req, res) => {
    const { code, discountPercentage, expiresAt } = req.body

    const normalizedCode = code.trim().toUpperCase()

    const existingPromoCode = await promoCodeModel.findOne({
        code: normalizedCode,
    })

    if (existingPromoCode) {
        return res.status(400).json({
            status: 'fail',
            message: 'Promo code already exists',
        })
    }

    const promoCode = await promoCodeModel.create({
        code: normalizedCode,
        discountPercentage,
        expiresAt,
        isActive: true,
    })

    res.status(201).json({
        status: 'success',
        message: 'Promo code created successfully',
        data: promoCode,
    })
})

// ==========================================
// GET ALL PROMO CODES - ADMIN
// ==========================================

const getAllPromoCodes = asyncHandler(async (req, res) => {
    const promoCodes = await promoCodeModel
        .find()
        .sort({ createdAt: -1 })

    res.status(200).json({
        status: 'success',
        totalElements: promoCodes.length,
        data: promoCodes,
    })
})

// ==========================================
// GET PROMO CODE BY ID - ADMIN
// ==========================================

const getPromoCodeById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const promoCode = await promoCodeModel.findById(id)

    if (!promoCode) {
        return res.status(404).json({
            status: 'fail',
            message: 'Promo code not found',
        })
    }

    res.status(200).json({
        status: 'success',
        data: promoCode,
    })
})

// ==========================================
// UPDATE PROMO CODE - ADMIN
// ==========================================

const updatePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params
    const {
        code,
        discountPercentage,
        expiresAt,
        isActive,
    } = req.body

    const updateData = {}

    if (code !== undefined) {
        updateData.code = code.trim().toUpperCase()
    }

    if (discountPercentage !== undefined) {
        updateData.discountPercentage = discountPercentage
    }

    if (expiresAt !== undefined) {
        updateData.expiresAt = expiresAt
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive
    }

    if (updateData.code) {
        const existingPromoCode = await promoCodeModel.findOne({
            code: updateData.code,
            _id: { $ne: id },
        })

        if (existingPromoCode) {
            return res.status(400).json({
                status: 'fail',
                message: 'Promo code already exists',
            })
        }
    }

    const promoCode = await promoCodeModel.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    )

    if (!promoCode) {
        return res.status(404).json({
            status: 'fail',
            message: 'Promo code not found',
        })
    }

    res.status(200).json({
        status: 'success',
        message: 'Promo code updated successfully',
        data: promoCode,
    })
})

// ==========================================
// DELETE PROMO CODE - ADMIN
// ==========================================

const deletePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params

    const promoCode = await promoCodeModel.findByIdAndDelete(id)

    if (!promoCode) {
        return res.status(404).json({
            status: 'fail',
            message: 'Promo code not found',
        })
    }

    res.status(200).json({
        status: 'success',
        message: 'Promo code deleted successfully',
    })
})

// ==========================================
// TOGGLE PROMO CODE - ADMIN
// ==========================================

const togglePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params

    const promoCode = await promoCodeModel.findById(id)

    if (!promoCode) {
        return res.status(404).json({
            status: 'fail',
            message: 'Promo code not found',
        })
    }

    promoCode.isActive = !promoCode.isActive

    await promoCode.save()

    res.status(200).json({
        status: 'success',
        message: `Promo code ${
            promoCode.isActive ? 'activated' : 'deactivated'
        } successfully`,
        data: promoCode,
    })
})

// ==========================================
// VALIDATE PROMO CODE - USER
// ==========================================

const validatePromoCode = asyncHandler(async (req, res) => {
    const { court, timeSlots, promoCode } = req.body

    if (!court || !timeSlots || !promoCode) {
        return res.status(400).json({
            status: 'fail',
            message: 'Court, time slots and promo code are required',
        })
    }

    const requestedTimeSlots = Array.isArray(timeSlots)
        ? timeSlots
        : [timeSlots]

    if (!requestedTimeSlots.length) {
        return res.status(400).json({
            status: 'fail',
            message: 'At least one time slot is required',
        })
    }

    // ==========================================
    // FIND COURT
    // ==========================================

    const courtDoc = await courtModel.findById(court)

    if (!courtDoc) {
        return res.status(404).json({
            status: 'fail',
            message: 'Court not found',
        })
    }

    // ==========================================
    // FIND SLOTS
    // ==========================================

    const slots = await slotModel.find({
        _id: { $in: requestedTimeSlots },
        court,
    })

    if (slots.length !== requestedTimeSlots.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'One or more slots not found',
        })
    }

    // ==========================================
    // FIND PROMO CODE
    // ==========================================

    const normalizedPromoCode = promoCode
        .trim()
        .toUpperCase()

    const promo = await promoCodeModel.findOne({
        code: normalizedPromoCode,
    })

    if (!promo) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid promo code',
        })
    }

    // ==========================================
    // CHECK ACTIVE
    // ==========================================

    if (!promo.isActive) {
        return res.status(400).json({
            status: 'fail',
            message: 'Promo code is inactive',
        })
    }

    // ==========================================
    // CHECK EXPIRATION
    // ==========================================

    if (new Date() > new Date(promo.expiresAt)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Promo code has expired',
        })
    }

    // ==========================================
    // CALCULATE ORIGINAL PRICE
    // ==========================================

    let originalAmount = 0

    slots.forEach((slot) => {
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
    // CALCULATE DISCOUNT
    // ==========================================

    const discountAmount = Number(
        (
            originalAmount *
            (promo.discountPercentage / 100)
        ).toFixed(2)
    )

    // ==========================================
    // CALCULATE FINAL PRICE
    // ==========================================

    const totalAmount = Number(
        (
            originalAmount - discountAmount
        ).toFixed(2)
    )

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
        status: 'success',
        message: 'Promo code applied successfully',
        data: {
            promoCode: promo.code,
            discountPercentage: promo.discountPercentage,
            originalAmount,
            discountAmount,
            totalAmount,
        },
    })
})

module.exports = {
    createPromoCode,
    getAllPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    togglePromoCode,
    validatePromoCode,
}