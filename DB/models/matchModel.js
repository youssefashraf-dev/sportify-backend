const mongoose = require('mongoose')


const matchSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true,'match must be associated with a booking'],
        unique: [true,'A booking can have only one match']
    },
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: [true,'match must be associated with a court']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true,'match must have a creator']
    },
    matchType: {
        type: String,
        enum: ['needPlayers', 'needTeam'],
        required: [true,'match must have a type']
    },
    description: {
        type: String,
    },
    matchDate: {
        type: Date,
        required: true
    },
    matchTimeSlots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot'
    }],
    teamSize: {
        type: Number,
        required: [true, 'Team size is required'],
    },
    // if matchtype is needMatch, this field will store the captin of opponent team and if matchtype is needPlayers will fill with players who joined the match 
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    waitingList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['open', 'ready', 'cancelled'],
        default: 'open'
    }
}, { timestamps: true })


module.exports = mongoose.model('Match', matchSchema)
