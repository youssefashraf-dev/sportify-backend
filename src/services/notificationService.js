const userModel = require('../../DB/models/userModel')
const notificationModel = require('../../DB/models/notificationModel')
const firebaseService = require('./firebaseService')

class NotificationService {

    static async sendToAllAdmins({
        type,
        title,
        body,
        data = {}
    }) {
        try {
            const admins = await userModel.find({
                role: 'admin',
                notificationEnabled: true
            })

            if (!admins.length) {
                return
            }

            for (const admin of admins) {
                await this.send({
                    userId: admin._id,
                    type,
                    title,
                    body,
                    data
                })
            }
        } catch (error) {
            console.error(
                'Error sending notification to admins:',
                error
            )
        }
    }

    static async send({
        userId,
        type,
        title,
        body,
        data = {}
    }) {
        try {
            const user = await userModel.findById(userId)

            if (!user || !user.fcmTokens) {
                return
            }

            const exists = await notificationModel.findOne({
                userId: userId,
                type,
                'data.bookingId': data.bookingId,
                createdAt: {
                    $gte: new Date(
                        Date.now() - 1000 * 60
                    )
                }
            })

            if (exists) {
                return
            }

            const notification =
                await notificationModel.create({
                    userId: userId,
                    type,
                    title,
                    body,
                    data
                })

            if (!user.notificationEnabled) {
                return
            }

            const fcmData = {
                type: String(type),
                notificationId:
                    notification._id.toString()
            }

            if (data && typeof data === 'object') {
                Object.keys(data).forEach((key) => {
                    if (
                        data[key] !== null &&
                        data[key] !== undefined
                    ) {
                        fcmData[key] =
                            typeof data[key] === 'object'
                                ? JSON.stringify(data[key])
                                : String(data[key])
                    }
                })
            }

            const response =
                await firebaseService.sendToTokens(
                    user.fcmTokens.map(
                        (t) => t.token
                    ),
                    {
                        notification: {
                            title,
                            body
                        },
                        data: fcmData
                    }
                )

            if (response) {
                console.log(
                    '[FCM]',
                    'success:',
                    response.successCount,
                    'fail:',
                    response.failureCount
                )

                const invalidTokenIndexes = []

                response.responses.forEach(
                    (res, index) => {
                        if (!res.success) {
                            console.error(
                                `[FCM Error] Token ${index}:`,
                                res.error?.code,
                                res.error?.message
                            )

                            invalidTokenIndexes.push(
                                index
                            )
                        }
                    }
                )

                user.fcmTokens =
                    user.fcmTokens.filter(
                        (_, index) =>
                            !invalidTokenIndexes.includes(
                                index
                            )
                    )

                await user.save()
            }

        } catch (error) {
            console.error(
                'Error sending notification:',
                error
            )
        }
    }
}

module.exports = NotificationService
