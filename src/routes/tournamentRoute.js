
const router = require('express').Router()

const {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournamentById,
    deleteTournamentById
} = require('../controllers/tournamentController')

const {
    createTournamentRequest,
    getMyTournamentRequests,
    getTournamentRequests,
    updateTournamentRequestStatus
} = require('../controllers/tournamentRequestController')

const {
    createTournamentValidator,
    updateTournamentValidator,
    tournamentIdValidator,
    tournamentRequestStatusValidator,
    tournamentRequestIdValidator
} = require('../validators/tournamentValidator')

const { verifyToken, allowedTo } = require('../middlewares/verifyToken')
const { upload } = require('../middlewares/upload')
const processImages = require('../middlewares/imageProcessor')


// ==================== Tournaments ====================

// Get all tournaments
router.route('/')
    .get(getAllTournaments)
    .post(
        verifyToken,
        allowedTo('admin'),
        upload.fields([
            { name: 'tournamentImage', maxCount: 1 }
        ]),
        processImages([
            { name: 'tournamentImage', multiple: false }
        ]),
        createTournamentValidator,
        createTournament
    )


// ==================== Tournament Requests ====================

// User gets his own tournament requests
router.get(
    '/my-requests',
    verifyToken,
    allowedTo('user'),
    getMyTournamentRequests
)

// Admin gets requests for a specific tournament
router.get(
    '/:id/requests',
    verifyToken,
    allowedTo('admin'),
    tournamentIdValidator,
    getTournamentRequests
)

// User submits tournament request + InstaPay receipt
router.post(
    '/:id/requests',
    verifyToken,
    allowedTo('user'),
    tournamentIdValidator,
    upload.single('instaPayReceipt'),
    createTournamentRequest
)

// Admin accepts / rejects a tournament request
router.put(
    '/requests/:requestId/status',
    verifyToken,
    allowedTo('admin'),
    tournamentRequestIdValidator,
    tournamentRequestStatusValidator,
    updateTournamentRequestStatus
)


// ==================== Tournament By ID ====================

// Get / Update / Delete tournament
router.route('/:id')
    .get(
        verifyToken,
        tournamentIdValidator,
        getTournamentById
    )
    .put(
        verifyToken,
        allowedTo('admin'),
        tournamentIdValidator,
        upload.fields([
            { name: 'tournamentImage', maxCount: 1 }
        ]),
        processImages([
            { name: 'tournamentImage', multiple: false }
        ]),
        updateTournamentValidator,
        updateTournamentById
    )
    .delete(
        verifyToken,
        allowedTo('admin'),
        tournamentIdValidator,
        deleteTournamentById
    )


module.exports = router
