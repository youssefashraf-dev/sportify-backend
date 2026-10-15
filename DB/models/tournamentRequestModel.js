const mongoose = require('mongoose')

const tournamentRequestSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: [true, 'Tournament is required']
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },

    paymentReceipt: {
        type: String,
        required: [true, 'Payment receipt is required']
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }

}, { timestamps: true })

module.exports = mongoose.model('TournamentRequest', tournamentRequestSchema)