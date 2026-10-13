const {createReview,getReview,getReviews,updateReview,deleteReview} = require('../controllers/reviewController')
const {createReviewValidator,updateReviewValidator,deleteReviewValidator,checkIdValdidator} = require('../validators/reviewValidator')  
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const router = require('express').Router({mergeParams:true})


router.route('/')
    .post(verifyToken,allowedTo('user'),createReviewValidator,createReview)
    .get(verifyToken,allowedTo('admin','user'),getReviews)

router.route('/:id')
    .get(verifyToken,allowedTo('admin','user'),checkIdValdidator,getReview)
    .put(verifyToken,allowedTo('user'),checkIdValdidator,updateReviewValidator,updateReview)
    .delete(verifyToken,allowedTo('user'),deleteReviewValidator,deleteReview)

module.exports = router