const express  = require('express')
const app = express()
require('dotenv').config()
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const hpp = require('hpp')
// const sanatize = require('mongo-sanitize')
const compression = require('compression')
const qs = require('qs')


console.log('BOOT VERSION: tournament-debug-1')
app.use((req, res, next) => {
  console.log('REQ:', req.method, req.originalUrl)
  console.log('CT:', req.headers['content-type'])
  console.log('CL:', req.headers['content-length'])
  next()
})




// middlewares
app.use(cookieParser())
app.use(helmet())
app.set('query parser', str => qs.parse(str, { allowDots: true }))
app.use(express.json({limit:'20kb'}))
app.use(express.urlencoded({ extended: true }))
app.use("/uploads",express.static(path.join(__dirname, "src", "uploads")))

// security middlewares
app.use(compression())
app.use(hpp())
app.use(cors({origin: true,credentials: true}))
// const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

// rate limiting middleware
app.set('trust proxy', 1); // trust first proxy
// const {limiter} = require('./src/middlewares/rateLimiter')
// app.use(limiter)

// logging middleware
const logger = require('./src/utils/logger')
if (process.env.NODE_ENV === 'production') {
    app.use(
        morgan('combined', {
        stream: {
            write: message => logger.info(message.trim())
        }
        })
    )
} else {
    app.use(morgan('dev'))
}

// calling routes
const dbConnect = require('./DB/dbConfig')
const errorMiddleware = require('./src/middlewares/errorMiddleware')
const mountRoute = require('./src/routes/mountRoute')

// mounting routes
mountRoute(app)

// health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working' })
})
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// error handling middleware
app.use((req, res, next) => {
    res.status(404).json({ message: `Page not found - ${req.originalUrl}` })
})
app.use(errorMiddleware)



const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    dbConnect()
})

process.on('unhandledRejection', (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    server.close(() => {
        console.error(`Shutting down....`);
        logger.error('Unhandled Rejection', err)
        process.exit(1);
    });
});