const matchModel = require('../../DB/models/matchModel')
const bookingModel = require('../../DB/models/bookingModel')
const userModel = require('../../DB/models/userModel')
const asyncHandler = require('express-async-handler')
const apiFeatures = require('../utils/apiFeatures')
const NotificationService = require('../services/notificationService')



const createMatch = asyncHandler(async(req,res)=>{
    const {booking,court,matchType,teamSize,description,matchDate,matchTimeSlots} = req.body

    const match = await matchModel.create({
        booking,
        court,
        createdBy: req.user.id,
        matchType,
        description,
        teamSize,
        matchDate,
        matchTimeSlots,
        participants: matchType === 'needPlayers' ? [req.user.id] : []
    })
    res.status(201).json({status:'success',message:'Match created successfully',data: match})
})

const getMatch = asyncHandler(async(req,res)=>{
    const { id } = req.params
    const match = await matchModel.findById(id).populate({path:'booking',select:'_id bookingDate'}).populate({path:'court' ,select:'_id name location'}).populate({path:'createdBy' ,select:'_id name email phone'}).populate({path:'participants' ,select:'_id name email phone'}).populate({path:'waitingList' ,select:'_id name email phone'}).populate({path:'matchTimeSlots',select:'_id startTime endTime'})
    match ? res.status(200).json({ status: 'success',message:'Match fetched successfully', data: match }) : res.status(404).json({ status: 'fail', message: 'Match not found' })    
})

const getMatches = asyncHandler(async(req,res)=>{
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const mongooseQuery = matchModel.find({createdBy: { $ne: req.user.id }, status: 'open',matchDate: { $gte: today } })
    const features = new apiFeatures(req.query,mongooseQuery)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()

    const matches = await features.mongooseQuery.populate({path:'booking',select:'_id bookingDate'}).populate({path:'court' ,select:'_id name location'}).populate({path:'createdBy' ,select:'_id name email phone'}).populate({path:'participants' ,select:'_id name email phone position level'}).populate({path:'waitingList' ,select:'_id name email phone  position level'}).populate({path:'matchTimeSlots',select:'_id startTime endTime'}).lean()
    res.status(200).json({status:'success',message:'Matches fetched successfully',totalElements:matches.length,data: matches}) 
})

const getMyMatches = asyncHandler(async(req,res)=>{
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const mongooseQuery = matchModel.find({createdBy: req.user.id, matchDate: { $gte: today } })
    const features = new apiFeatures(req.query,mongooseQuery)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate()

    const matches = await features.mongooseQuery.populate({path:'booking',select:'_id bookingDate'}).populate({path:'court' ,select:'_id name location'}).populate({path:'createdBy' ,select:'_id name email phone'}).populate({path:'participants' ,select:'_id name email phone position level'}).populate({path:'waitingList' ,select:'_id name email phone  position level'}).populate({path:'matchTimeSlots',select:'_id startTime endTime'}).lean()
    res.status(200).json({status:'success',message:'My matches fetched successfully',totalElements:matches.length,data: matches}) 
})

const updateMatch = asyncHandler(async(req,res)=>{
    const { id } = req.params
    const updates = req.body
    const match = await matchModel.findByIdAndUpdate(id,updates,{new:true,runValidators:true})
    match ? res.status(200).json({ status: 'success', message: 'Match updated successfully', data: match }) : res.status(404).json({ status: 'fail', message: 'Match not found' }) 
})

const deleteMatch = asyncHandler(async(req,res)=>{
    const { id } = req.params
    const match = await matchModel.findByIdAndDelete(id)
    match ? res.status(200).json({ status: 'success', message: 'Match deleted successfully' }) : res.status(404).json({ status: 'fail', message: 'Match not found' })   
})

const applyToMatch = asyncHandler(async(req,res)=>{
    const match = await matchModel.findById(req.params.id)
    match.waitingList.push(req.user.id)
    await match.save()

    await NotificationService.send({
        userId: match.createdBy,
        type: 'MATCH_APPLIED',
        title: 'New Match Application',
        body: 'Someone has applied to your match',
        data: {
            matchId: match._id,
            applicantId: req.user.id
        }
    })

    res.status(200).json({status:'success',message:'Applied to match successfully',data:match})
})

const acceptApplication = asyncHandler(async(req,res)=>{
    const { matchId, userId } = req.params

    const user = await userModel.findById(userId)
    if(!user) return res.status(404).json({status:'fail',message:'User not found'})
    const match = await matchModel.findById(matchId)
    if(!match) return res.status(404).json({status:'fail',message:'Match not found'})
    if(!match.createdBy.equals(req.user.id)) return res.status(403).json({status:'fail',message:'You are not allowed to accept applications for this match'})
    if(match.status !== 'open') return res.status(400).json({status:'fail',message:'Cannot accept applications for this match'})
    if (!match.waitingList.includes(userId)) return res.status(400).json({ status: 'fail', message: 'User has not applied to this match' })
    
    // remove from waiting list
    match.waitingList = match.waitingList.filter(id => id.toString() !== userId)

    // add to participants and update status
    match.participants.push(userId)
    if (match.matchType === 'needPlayers') {
        if (match.participants.length === match.teamSize) {
            match.status = 'ready'
        }
    } else if (match.matchType === 'needTeam') {
        match.status = 'ready'
    }
    await match.save()

    await NotificationService.send({
        userId: userId,
        type: 'MATCH_ACCEPTED',
        title: 'Application Accepted',
        body: 'Your application to join the match has been accepted',
        data: {
            matchId: match._id
        }
    })

    res.status(200).json({status:'success',message:'Application accepted successfully',data: match})
})

const rejectApplication = asyncHandler(async(req,res)=>{
    const { matchId, userId } = req.params

    const user = await userModel.findById(userId)
    if(!user) return res.status(404).json({status:'fail',message:'User not found'})
    const match = await matchModel.findById(matchId)
    if(!match) return res.status(404).json({status:'fail',message:'Match not found'})
    if(!match.createdBy.equals(req.user.id)) return res.status(403).json({status:'fail',message:'You are not allowed to reject applications for this match'})
    if(match.status !== 'open') return res.status(400).json({status:'fail',message:'Cannot reject applications for this match'})
    if (!match.waitingList.includes(userId)) return res.status(400).json({ status: 'fail', message: 'User has not applied to this match' })

    // remove from waiting list
    match.waitingList = match.waitingList.filter(id => id.toString() !== userId)
    await match.save()

    await NotificationService.send({
        userId: userId,
        type: 'MATCH_REJECTED',
        title: 'Application Rejected',
        body: 'Your application to join the match has been rejected',
        data: {
            matchId: match._id
        }
    })

    res.status(200).json({status:'success',message:'Application rejected successfully',data:match})
})

const cancelMatch = asyncHandler(async(req,res)=>{
    const match = await matchModel.findById(req.params.id)
    if(!match) return res.status(404).json({status:'fail',message:'Match not found'})
    if(!match.createdBy.equals(req.user.id)) return res.status(403).json({status:'fail',message:'You are not allowed to cancel this match'})
    if(match.status === 'cancelled') return res.status(400).json({status:'fail',message:'Match is already cancelled'})
    match.status = 'cancelled'
    await match.save()

    // Notify all participants and waiting list users
    const allUsers = [...match.participants, ...match.waitingList].filter(id => id.toString() !== req.user.id)
    for (const userId of allUsers) {
        await NotificationService.send({
            userId: userId,
            type: 'MATCH_CANCELLED',
            title: 'Match Cancelled',
            body: 'A match you were involved in has been cancelled',
            data: {
                matchId: match._id
            }
        })
    }

    res.status(200).json({status:'success',message:'Match cancelled successfully',data: match})
})

module.exports = {createMatch,getMatch,getMatches,getMyMatches,updateMatch,deleteMatch,applyToMatch,acceptApplication,rejectApplication,cancelMatch}