const { createBooking, getBookings, getMyBookings, getBookingById, updateBookingStatus, cancelBooking, uploadPaymentReceipt }   = require('../controllers/bookingController')
const { createBookingValidator, updateBookingValidator, bookingIdValidator } = require('../validators/bookingValidator')
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const {upload} = require('../middlewares/upload')
const router = require('express').Router()



router.route('/')
    .post(verifyToken,allowedTo('user'),createBookingValidator, createBooking)
    .get(getBookings)
router.route('/:id/payment-receipt')
    .post(verifyToken,bookingIdValidator,upload.single('paymentReceipt'),uploadPaymentReceipt)
router.route('/my-bookings')
    .get(verifyToken,getMyBookings)
router.route('/:id')
    .get(verifyToken,bookingIdValidator, getBookingById)
router.route('/:id/status')
    .put(verifyToken,allowedTo('admin'),bookingIdValidator, updateBookingStatus)
router.route('/:id/cancel')
    .put(verifyToken,allowedTo('admin','user'),bookingIdValidator, cancelBooking)

module.exports = router