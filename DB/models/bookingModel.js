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
        enum: ['pending','under review', 'confirmed', 'rejected', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required']
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