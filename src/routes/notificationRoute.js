const { registerToken ,getMyNotifications , markAsRead,toggleNotifications } = require('../controllers/notificationController')
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const { registerTokenValidator, markAsReadValidator } = require('../validators/notificationValidator')
const router = require('express').Router()


router.post('/register-token',verifyToken,allowedTo('user','admin'),registerTokenValidator,registerToken)
router.get('/my-notifications',verifyToken,allowedTo('user','admin'),getMyNotifications)
router.put('/:id/mark-as-read',verifyToken,allowedTo('user','admin'),markAsReadValidator,markAsRead)
router.put('/toggle-notifications',verifyToken,allowedTo('user','admin'),toggleNotifications)


module.exports = router

