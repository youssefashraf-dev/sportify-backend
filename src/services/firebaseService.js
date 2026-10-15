const admin = require('firebase-admin')

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
} catch (error) {
    console.error('Firebase admin initialization error', error)
}

const sendToTokens = async (tokens, payload) => {
    if (!tokens.length) return

    const validTokens = tokens.filter(
        token =>
            token &&
            typeof token === 'string' &&
            token.trim().length > 0
    )

    if (!validTokens.length) {
        console.warn('[FCM] No valid tokens to send to')
        return null
    }

    try {
        return await admin.messaging().sendEachForMulticast({
            tokens: validTokens,
            ...payload
        })
    } catch (error) {
        console.error(
            '[FCM Error] Failed to send notification:',
            error.code,
            error.message
        )
        throw error
    }
}

module.exports = { sendToTokens }
