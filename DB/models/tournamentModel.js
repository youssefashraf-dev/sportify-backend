const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tournament title is required'],
        minlength: [3, 'Tournament title must be at least 3 characters'],
        maxlength: [100, 'Tournament title must be less than 100 characters'],
    },

    description: {
        type: String,
        required: [true, 'Tournament description is required'],
        minlength: [10, 'Tournament description must be at least 10 characters'],
        maxlength: [1000, 'Tournament description must be less than 1000 characters'],
    },

    image: {
        type: String,
        default: ''
    },

    date: {
        type: Date,
        required: [true, 'Tournament date is required']
    },

    location: {
        type: String,
        required: [true, 'Tournament location is required']
    },

    price: {
        type: Number,
        required: [true, 'Tournament price is required'],
        min: [0, 'Tournament price cannot be negative']
    },

    instructions: {
        type: String,
        required: [true, 'Tournament instructions are required'],
        minlength: [10, 'Tournament instructions must be at least 10 characters'],
        maxlength: [2000, 'Tournament instructions must be less than 2000 characters'],
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }

}, { timestamps: true })

module.exports = mongoose.model('Tournament', tournamentSchema)