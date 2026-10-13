const {createCourt,getAllCourts,getCourtById,updateCourtById,updateCourtLocation,deleteCourtById} = require('../controllers/courtController')
const {createCourtValidator,updateCourtValidator,courtIdValidator} = require('../validators/courtValidator')
const reviewRoute = require('./reviewRoute')
const { upload } = require('../middlewares/upload')
const processImages = require('../middlewares/imageProcessor')
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const router = require('express').Router()


// const setLocation = (req,res,next)=>{
//     req.body.location = JSON.parse(req.body.location)
//     next()
// }

router.route('/')
    .post(verifyToken,allowedTo('admin'),upload.fields([{ name: "courtImages", maxCount: 5 }]),processImages([{ name: "courtImages", multiple: true }]),createCourtValidator,createCourt)
    .get(getAllCourts)
router.route('/:id')
    .get(courtIdValidator,getCourtById)
    .put(verifyToken,allowedTo('admin'),upload.fields([{ name: "courtImages", maxCount: 5 }]),courtIdValidator,updateCourtValidator,updateCourtById)
    .delete(verifyToken,allowedTo('admin'),courtIdValidator,deleteCourtById)
router.route('/:id/location')
    .put(verifyToken,allowedTo('admin'),courtIdValidator,updateCourtLocation)

router.use('/:courtId/reviews',reviewRoute)
router.use('/:courtId/reviews/:id',reviewRoute)


module.exports = router