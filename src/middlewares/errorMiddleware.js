const util = require('util')
const logger = require('../utils/logger')


const globalError = (err,req,res,next)=>{
    const errorInfo = {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        statusCode: err?.statusCode,
        path: req?.originalUrl,
        method: req?.method,
        errorType: typeof err,
        errorString: (() => { try { return String(err) } catch (e) { return '[String(err) failed]' } })(),
        errorInspect: (() => { try { return util.inspect(err, { depth: 5, showHidden: true }) } catch (e) { return '[util.inspect failed]' } })()
    }

    try {
        logger.error(errorInfo)
    } catch (logErr) {
        // never let logging failures hide the original error
    }
    console.error(errorInfo)

    if(res.headersSent){
        return next(err)
    }

    const statusCode = Number.isInteger(err?.statusCode) && err.statusCode >= 400 && err.statusCode <= 599
        ? err.statusCode
        : 500
    const status = err?.status || "error"

    if(process.env.NODE_ENV === "development"){
        return developmentError(err,res,statusCode,status)
    }
    return productionError(err,res,statusCode,status)
}

const developmentError = (err,res,statusCode,status)=>{
    return res.status(statusCode).json({
        message:err?.message,
        status:status,
        stack:err?.stack,
        trace:err?.trace
    })
}
const productionError = (err,res,statusCode,status)=>{
    return res.status(statusCode).json({
        message:err?.message,
        status:status,
    })
}

module.exports = globalError
