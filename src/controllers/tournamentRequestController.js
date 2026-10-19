const tournamentRequestModel = require('../../DB/models/tournamentRequestModel')
const tournamentModel = require('../../DB/models/tournamentModel')
const asyncHandler = require('express-async-handler')
const NotificationService = require('../services/notificationService')

const createTournamentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!req.file) {
        return res.status(400).json({
            status: 'fail',
            message: 'No payment receipt uploaded'
        })
    }

    const tournament = await tournamentModel.findById(id)

    if (!tournament) {
        return res.status(404).json({
            status: 'fail',
            message: 'Tournament not found'
        })
    }

    if (tournament.status !== 'active') {
        return res.status(400).json({
            status: 'fail',
            message: 'Tournament is not active'
        })
    }

    const existingRequest = await tournamentRequestModel.findOne({
        tournament: id,
        user: req.user.id,
        status: { $in: ['pending', 'accepted'] }
    })

    if (existingRequest) {
        return res.status(400).json({
            status: 'fail',
            message: 'You already have an active request for this tournament'
        })
    }

    const request = await tournamentRequestModel.create({
        tournament: id,
        user: req.user.id,
        paymentReceipt: req.file.path,
        status: 'pending'
    })

    await NotificationService.sendToAllAdmins({
        type: 'TOURNAMENT_REQUEST',
        title: 'New Tournament Registration',
        body: 'A user has submitted a tournament registration request',
        data: {
            requestId: request._id.toString(),
            tournamentId: id,
            userId: req.user.id
        }
    })

    res.status(201).json({
        status: 'success',
        message: 'Tournament request submitted successfully',
        data: request
    })
})

const getMyTournamentRequests = asyncHandler(async (req, res) => {
    const requests = await tournamentRequestModel
        .find({ user: req.user.id })
        .populate('tournament')

    res.status(200).json({
        status: 'success',
        message: 'Tournament requests retrieved successfully',
        totalElements: requests.length,
        data: requests
    })
})

const getTournamentRequests = asyncHandler(async (req, res) => {
    const { id } = req.params

    const requests = await tournamentRequestModel
        .find({ tournament: id })
        .populate('user', 'username first_name last_name phone')
        .populate('tournament', 'title date price')

    res.status(200).json({
        status: 'success',
        message: 'Tournament requests retrieved successfully',
        totalElements: requests.length,
        data: requests
    })
})

const updateTournamentRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params
    const { status } = req.body

    const request = await tournamentRequestModel
        .findById(requestId)
        .populate('tournament', 'title')

    if (!request) {
        return res.status(404).json({
            status: 'fail',
            message: 'Tournament request not found'
        })
    }

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Status must be accepted or rejected'
        })
    }

    if (request.status !== 'pending') {
        return res.status(400).json({
            status: 'fail',
            message: 'Tournament request has already been processed'
        })
    }

    request.status = status
    await request.save()

    const tournamentTitle =
        request.tournament?.title || 'Tournament'

    const isAccepted = status === 'accepted'

    await NotificationService.send({
        userId: request.user,
        type: 'TOURNAMENT_REQUEST_STATUS',
        title: isAccepted
            ? 'Tournament Registration Accepted'
            : 'Tournament Registration Rejected',
        body: isAccepted
            ? `Your registration for ${tournamentTitle} has been accepted`
            : `Your registration for ${tournamentTitle} has been rejected`,
        data: {
            requestId: request._id.toString(),
            tournamentId:
                request.tournament?._id?.toString() || '',
            status
        }
    })

    res.status(200).json({
        status: 'success',
        message: `Tournament request ${status} successfully`,
        data: request
    })
})

module.exports = {
    createTournamentRequest,
    getMyTournamentRequests,
    getTournamentRequests,
    updateTournamentRequestStatus
}
