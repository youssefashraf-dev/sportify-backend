const courtModel = require('./courtModel')
const mongoose = require('mongoose')


const reviewSchema = new mongoose.Schema({
    courtId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Court',
        required : [true,'Review Must Belong To court']
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true,'Review Must Belong To User']
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Review Must Belong To A Booking'],
        unique: [true, 'You Have Already Reviewed This Booking']
    },
    ratings : {
        type:Number,
        required : [true,'Review Must Have A Rating'],
        min:0,
        max:5
    },
    comment : {
        type:String,
        trim:true,
        maxlength:500
    }
},{timestamps:true})


// reviewSchema.pre(/^find/,function(next){
//     this.populate({path:'user',select:'first_name last_name email'})
//     next()
// })

reviewSchema.statics.calcAverageRatings = async function(courtId){
    const result = await this.aggregate([
        {
            $match : { courtId: courtId }
        },
        {
            $group : {
                _id : '$courtId',
                ratingsQuantity : {$sum:1},
                ratingsAverage : {$avg:'$ratings'}
            }
        }
    ])

    if(result.length > 0) {
        await courtModel.findByIdAndUpdate(courtId,{
            ratingsQuantity : result[0].ratingsQuantity,
            ratingsAverage : result[0].ratingsAverage})
    }else {
        await courtModel.findByIdAndUpdate(courtId,{
            ratingsQuantity : 0,
            ratingsAverage : 0
        })
    }
}

reviewSchema.post('save',async function(){
    await this.constructor.calcAverageRatings(this.courtId)
})

reviewSchema.pre('findOneAndUpdate',async function(doc){
    if (doc) await doc.constructor.calcAverageRatings(doc.courtId);
})

reviewSchema.post('findOneAndDelete',async function(doc){
    if (doc) await doc.constructor.calcAverageRatings(doc.courtId);
})


module.exports = mongoose.model('Review',reviewSchema)