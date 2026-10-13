const logger = require('../utils/logger')


const globalError = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"


    if(process.env.NODE_ENV === "development"){
        developmentError(err,res)
    } else {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    })
        productionError(err,res)
    }
}

const developmentError = (err,res)=>{
    return res.status(err.statusCode).json({
        message:err.message,
        status:err.status,
        stack:err.stack,
        trace:err.trace
    })
}
const productionError = (err,res)=>{
    return res.status(err.statusCode).json({
        message:err.message,
        status:err.status,
    })
}

module.exports = globalError