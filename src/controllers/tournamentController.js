const tournamentModel = require('../../DB/models/tournamentModel')
const asyncHandler = require('express-async-handler')
const apiFeatures = require('../utils/apiFeatures')

const createTournament = asyncHandler(async (req, res) => {
    const tournament = await tournamentModel.create(req.body)

    tournament
        ? res.status(201).json({
            status: 'success',
            message: 'Tournament created successfully',
            data: tournament
        })
        : res.status(400).json({
            status: 'fail',
            message: 'Tournament creation failed'
        })
})

const getAllTournaments = asyncHandler(async (req, res) => {
    const mongooseQuery = tournamentModel.find()

    const features = new apiFeatures(req.query, mongooseQuery)
        .search()
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const tournaments = await features.mongooseQuery

    res.status(200).json({
        status: 'success',
        message: 'Tournaments retrieved successfully',
        totalElements: tournaments.length,
        data: tournaments
    })
})

const getTournamentById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const tournament = await tournamentModel.findById(id)

    tournament
        ? res.status(200).json({
            status: 'success',
            data: tournament
        })
        : res.status(404).json({
            status: 'fail',
            message: 'Tournament not found'
        })
})

const updateTournamentById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const tournament = await tournamentModel.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    )

    tournament
        ? res.status(200).json({
            status: 'success',
            message: 'Tournament updated successfully',
            data: tournament
        })
        : res.status(404).json({
            status: 'fail',
            message: 'Tournament not found'
        })
})

const deleteTournamentById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const tournament = await tournamentModel.findByIdAndDelete(id)

    tournament
        ? res.status(200).json({
            status: 'success',
            message: 'Tournament deleted successfully'
        })
        : res.status(404).json({
            status: 'fail',
            message: 'Tournament not found'
        })
})

module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournamentById,
    deleteTournamentById
}