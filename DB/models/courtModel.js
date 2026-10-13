const mongoose = require('mongoose')


const courtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Court name is required'],
        unique:[true, 'there is an court with same name'],
        minlength: [3, 'Court name must be at least 3 characters'],
        maxlength: [100, 'Court name must be less than 100 characters'],
    },
    slug: {
        type: String,
        required: [true, 'Court slug is required']
    },
    description: {
        type: String,
        minlength: 10,
        maxlength: 500,
    },
    phone : {
        type:String,
        required: [true, 'Contact phone number is required']
    },
    instapay : {
        instaNumber: {type: String},
        accountName: {type: String}
    },
    terms: {
        type: String,
        minlength: 10,
        maxlength: 1000,
    },
    address: {
        type: String,
        required: true
    },
    // location: { 
    //     type: { type: String, enum: ['Point'], default: 'Point' },
    //     coordinates: { type: [Number], required: true } // [longitude, latitude]
    // },
    size: {
        type: String,
        enum: ['1x1','2x2','5x5','7x7','11x11'],
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['football','padel','tennis','others'],
        default: 'football'
    },
    pricePerHour: {
        type: Number,
        required: true,
        min: 0,
    },
    courtImages: {
        type: [String],
        default: ['https://tse3.mm.bing.net/th/id/OIP.zPRIGFixUUb2fGu7vTv0zwHaE7?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3']    
    },
    amenities: {
        parking: { type: Boolean, default: false },
        lights: { type: Boolean, default: false },
        showers: { type: Boolean, default: false },
        lockerRooms: { type: Boolean, default: false },
        ballRental: { type: Boolean, default: false },
        toilets: { type: Boolean, default: false },
        cafeteria: { type: Boolean, default: false },
    },
    ratingsAverage: {
        type: Number,
        min: [0, 'Rating must be above 0.0'],
        max: [5, 'Rating must be below 5.0'],
        default: 0,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    }

}, { timestamps: true })

courtSchema.index({ location: '2dsphere' }); // For geo queries

module.exports = mongoose.model('Court', courtSchema)