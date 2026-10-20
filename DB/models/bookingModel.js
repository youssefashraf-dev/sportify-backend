const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must be associated with a user']
    },

    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: [true, 'Booking must be associated with a court']
    },

    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },

    timeSlots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: [true, 'Time slot is required']
    }],

    status: {
        type: String,
        enum: ['pending', 'under review', 'confirmed', 'rejected', 'cancelled'],
        default: 'pending'
    },

    // Price before applying promo code
    originalAmount: {
        type: Number,
        required: [true, 'Original amount is required'],
        min: 0
    },

    // Discount value
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    // Promo code used for this booking
    promoCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: null
    },

    // Final amount after discount
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },

    paymentReceipt: {
        type: String
    },

    isPaid: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)