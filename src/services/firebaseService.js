const admin = require('firebase-admin')

try {
    admin.initializeApp({
        credential: admin.credential.cert(
            require('../config/sportify-5b326-firebase-adminsdk-fbsvc-d4bfca2448.json')
        )
    })
} catch (error) {
    console.error('Firebase admin initialization error', error)
}


const sendToTokens = async (tokens, payload) => {
    if (!tokens.length) return
    
    // Filter out invalid tokens (null, undefined, empty strings)
    const validTokens = tokens.filter(token => token && typeof token === 'string' && token.trim().length > 0)
    
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
        console.error('[FCM Error] Failed to send notification:', error.code, error.message)
        throw error
    }
}

module.exports = {sendToTokens}
