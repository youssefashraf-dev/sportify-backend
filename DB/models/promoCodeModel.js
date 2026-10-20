const mongoose = require('mongoose')

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        discountPercentage: {
            type: Number,
            required: true,
            min: 0.01,
            max: 100,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('PromoCode', promoCodeSchema)