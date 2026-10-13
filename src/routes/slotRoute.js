const { createSlot, getSlots, getAvaliableSlots, getSlotById, updateSlot, deleteSlot } = require('../controllers/slotController')
const { createSlotValidator, updateSlotValidator, slotIdValidator } = require('../validators/slotValidator')
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const router = require('express').Router()


router.route('/')
    .post(verifyToken,allowedTo('admin'),createSlotValidator,createSlot)
    .get(verifyToken,getSlots)
router.route('/available')
    .get(verifyToken,getAvaliableSlots)
router.route('/:id')
    .get(verifyToken,slotIdValidator,getSlotById)
    .put(verifyToken,allowedTo('admin'),slotIdValidator,updateSlotValidator,updateSlot)
    .delete(verifyToken,allowedTo('admin'),slotIdValidator,deleteSlot)

module.exports = router