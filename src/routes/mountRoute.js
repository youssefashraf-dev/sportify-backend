const userRoute = require('./userRoute')
const authRoute = require('./authRoute')
const courtRoute = require('./courtRoute')
const slotRoute = require('./slotRoute')
const bookingRoute = require('./bookingRoute')
const reviewRoute = require('./reviewRoute')
const matchRoute = require('./matchRoute')
const notificationRoute = require('./notificationRoute')



const mountRoute = (app) => {
    app.use('/api/users', userRoute)
    app.use('/api/auth', authRoute)
    app.use('/api/courts', courtRoute)
    app.use('/api/slots', slotRoute)
    app.use('/api/bookings', bookingRoute)
    app.use('/api/reviews', reviewRoute)
    app.use('/api/matches', matchRoute)
    app.use('/api/notifications', notificationRoute)
}

module.exports = mountRoute