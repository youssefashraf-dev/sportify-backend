const {createMatch,getMatch,getMatches,getMyMatches,updateMatch,deleteMatch,applyToMatch,acceptApplication,rejectApplication,cancelMatch} = require('../controllers/matchController') 
const {createMatchValidator,updateMatchValidator,checkIdValdidator,applyToMatchValidator} = require('../validators/matchValidator')
const {verifyToken,allowedTo} = require('../middlewares/verifyToken')
const router = require('express').Router({mergeParams:true})


router.route('/')
    .post(verifyToken,allowedTo('user'),createMatchValidator,createMatch)
    .get(verifyToken,allowedTo('user','admin'),getMatches)
    
router.route('/my-matches')
    .get(verifyToken,getMyMatches)

router.route('/:id')
    .get(verifyToken,allowedTo('user','admin'),checkIdValdidator,getMatch)
    .put(verifyToken,allowedTo('user','admin'),updateMatchValidator,updateMatch)
    .delete(verifyToken,allowedTo('admin'),checkIdValdidator,deleteMatch)

router.post('/:id/apply',verifyToken,allowedTo('user'),applyToMatchValidator,applyToMatch)

router.put('/:matchId/applications/:userId/accept',verifyToken,allowedTo('user'),acceptApplication)
router.put('/:matchId/applications/:userId/reject',verifyToken,allowedTo('user'),rejectApplication)

router.put('/:id/cancel',verifyToken,allowedTo('user'),checkIdValdidator,cancelMatch)

module.exports = router