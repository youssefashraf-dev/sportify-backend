const userModel = require('../../DB/models/userModel')
const asyncHandler = require('express-async-handler')
const notificationModel = require('../../DB/models/notificationModel')



const registerToken = asyncHandler(async (req, res) => {
    const { token, platform } = req.body

    if (!token) return res.status(400).json({ status: 'fail', message: 'FCM token is required' })
    if (!['android', 'ios', 'web'].includes(platform)) {
        return res.status(400).json({ status: 'fail', message: 'Valid platform is required' })
    }

    // 1) Remove this token from every OTHER user (a device belongs to one account at a time)
    await userModel.updateMany(
        { _id: { $ne: req.user.id }, 'fcmTokens.token': token },
        { $pull: { fcmTokens: { token } } }
    )

    // 2) Update the token if it exists on the current user, otherwise add it
    const updated = await userModel.updateOne(
        { _id: req.user.id, 'fcmTokens.token': token },
        {
            $set: {
                'fcmTokens.$.lastUsedAt': new Date(),
                'fcmTokens.$.platform': platform,
            },
        }
    )

    if (updated.matchedCount === 0) {
        const result = await userModel.updateOne(
            { _id: req.user.id },
            { $push: { fcmTokens: { token, platform, lastUsedAt: new Date() } } }
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ status: 'fail', message: 'User not found' })
        }
    }

    res.status(200).json({ status: 'success', message: 'FCM token registered successfully' })
})

const getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const notifications = await notificationModel.find({ userId: userId}).sort('-createdAt')

    res.status(200).json({status: 'success',message: 'Notifications fetched successfully',data: notifications})   
})

const markAsRead = asyncHandler(async (req, res) => {
    const id = req.params.id
    const notification = await notificationModel.findById(id)
    if(!notification){
        return res.status(404).json({ status: 'fail', message: 'Notification not found' })
    }
    if(notification.userId.toString() !== req.user.id){
        return res.status(403).json({ status: 'fail', message: 'Unauthorized' })
    }
    notification.isRead = true
    await notification.save()
    res.status(200).json({status: 'success',message: 'Notification marked as read'})
})

const toggleNotifications = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id)
    if (!user) return res.status(404).json({status: 'fail',message: 'User not found'})
    user.notificationEnabled = !user.notificationEnabled
    await user.save()
    res.status(200).json({status: 'success',notificationEnabled: user.notificationEnabled,message: `Notifications ${user.notificationEnabled ? 'enabled' : 'disabled'}`})
})

module.exports = { registerToken ,getMyNotifications , markAsRead , toggleNotifications }