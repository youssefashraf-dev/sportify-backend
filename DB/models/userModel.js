const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'First name is required']
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required']
    },
    username : {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must be unique']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique']
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: ['GK','defender','midfielder','striker', 'winger','allrounder'],
    },
    level: {
        type: String,
        required: [true, 'Level is required'],
        enum: ['beginner','casual','intermediate','advanced','pro'],
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male','female'],
        default: 'male'
    },
    date_of_birth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: [true, 'Phone number must be unique']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        required: [true, 'Password is required']
    },
    personalIdImage: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    fcmTokens : [{
        token: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            enum: ['android', 'ios', 'web'],
            required: true
        },
        lastUsedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notificationEnabled: {
        type: Boolean,
        default: false,
    },
    refreshToken: String,
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpires: Date,
    passwordResetCodeVerified: Boolean,
}, { timestamps: true })


// hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema)