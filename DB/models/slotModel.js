const mongoose = require('mongoose')



const slotSchema = new mongoose.Schema({
    court : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: [true, 'Time slot must be associated with a court']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required']
    }
}, { timestamps: true })



module.exports = mongoose.model('TimeSlot', slotSchema)