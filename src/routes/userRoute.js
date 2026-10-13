const {getAllUsers,getUserById,createUser,updateUserById,deleteUserById,verifyUser,suspendUser
    ,getUserProfile,updateUserProfile,changeUserPassword,deleteUserProfile} = require('../controllers/userController') 
const {createUserValidator,updateUserValidator,changeUserPasswordValidator,userIdValidator} = require('../validators/userValidator')
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const router = require('express').Router()


// logged user routes
router.route('/profile')
    .get(verifyToken, allowedTo('user','admin'), getUserProfile)
    .put(verifyToken, allowedTo('user','admin'),updateUserValidator,updateUserProfile)
    .delete(verifyToken, allowedTo('user','admin'), deleteUserProfile)

router.route('/profile/change-password')
    .put(verifyToken, allowedTo('user','admin'),changeUserPasswordValidator, changeUserPassword)



// admin routes
router.route('/')
    .get(verifyToken, allowedTo('admin'), getAllUsers)
    .post(verifyToken, allowedTo('admin'), createUserValidator, createUser)

router.route('/:id')
    .get(verifyToken, allowedTo('admin','user'), userIdValidator, getUserById)
    .put(verifyToken, allowedTo('admin'), userIdValidator, updateUserValidator, updateUserById)
    .delete(verifyToken, allowedTo('admin'), userIdValidator, deleteUserById)

router.route('/:id/verify')
    .put(verifyToken, allowedTo('admin'), userIdValidator, verifyUser)

router.route('/:id/suspend')
    .put(verifyToken, allowedTo('admin'), userIdValidator, suspendUser)


module.exports = router