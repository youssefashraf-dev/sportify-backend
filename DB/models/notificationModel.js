const mongoose = require('mongoose')


const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
       
enum: [
    'BOOKING_REQUESTED',
    'RECEIPT_UPLOADED',
    'BOOKING_CONFIRMED',
    'BOOKING_CANCELLED',
    'BOOKING_REJECTED',
    'MATCH_APPLIED',
    'MATCH_ACCEPTED',
    'MATCH_REJECTED',
    'MATCH_CANCELLED',
    'TOURNAMENT_REQUEST',
    'TOURNAMENT_REQUEST_STATUS'
],


        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
},{timestamps: true})

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })

module.exports = mongoose.model('Notification', notificationSchema)