# Sportify - Football Booking Platform

A comprehensive backend API for managing football court bookings, matches, and user interactions. Built with Express.js and MongoDB, featuring real-time notifications, image management, and robust security.

## 📋 Features

- **User Management**: Registration, authentication, profile management with role-based access
- **Court Booking System**: Browse and book football courts with time slots
- **Match Organization**: Create and join football matches with real-time updates
- **Review System**: Rate and review courts and matches with detailed feedback
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Image Upload**: Cloudinary integration for image management and optimization
- **Email Notifications**: SendGrid and Nodemailer integration for automated notifications
- **Firebase Integration**: Real-time messaging and push notifications
- **Advanced Logging**: Winston-based logging with daily rotation
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Input Validation**: Comprehensive request validation and sanitization

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for image management)
- Firebase project (for real-time features)
- SendGrid account (for email notifications)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kora-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values:
   - `DB_STRING`: Your MongoDB connection string
   - `JWT_SECRET`: Strong secret key (min 32 characters for production)
   - `JWT_EXPIRE`: JWT token expiration time
   - `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET`: Cloudinary credentials
   - `SENDGRID_API_KEY`: SendGrid API key for email notifications
   - `FIREBASE_CONFIG`: Firebase configuration for real-time features
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs
   - `NODE_ENV`: Environment (development/production)
   - Email SMTP configuration (optional for Nodemailer)

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🏗️ Project Structure

```
kora-app/
├── DB/
│   ├── dbConfig.js                # Database configuration
│   └── models/                    # Mongoose data models
│       ├── userModel.js
│       ├── courtModel.js
│       ├── bookingModel.js
│       ├── slotModel.js
│       ├── matchModel.js
│       ├── reviewModel.js
│       └── notificationModel.js
├── src/
│   ├── config/                    # Configuration files
│   │   ├── cloudinary.js
│   │   ├── firebase.js
│   │   └── firebase-key.json
│   ├── controllers/               # Request handlers and business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── courtController.js
│   │   ├── bookingController.js
│   │   ├── matchController.js
│   │   ├── slotController.js
│   │   ├── reviewController.js
│   │   └── notificationController.js
│   ├── middlewares/               # Express middlewares
│   │   ├── verifyToken.js         # JWT authentication
│   │   ├── errorMiddleware.js     # Error handling
│   │   ├── validatorMiddleware.js # Request validation
│   │   ├── rateLimiter.js         # Rate limiting
│   │   ├── imageProcessor.js      # Image optimization
│   │   ├── upload.js              # File upload configuration
│   │   ├── sanatizeMiddleware.js  # NoSQL injection prevention
│   │   └── uploadImages.js        # Image upload handler
│   ├── routes/                    # API route definitions
│   │   ├── authRoute.js
│   │   ├── userRoute.js
│   │   ├── courtRoute.js
│   │   ├── bookingRoute.js
│   │   ├── matchRoute.js
│   │   ├── slotRoute.js
│   │   ├── reviewRoute.js
│   │   ├── notificationRoute.js
│   │   └── mountRoute.js
│   ├── services/                  # Business logic services
│   │   ├── firebaseService.js     # Firebase integration
│   │   └── notificationService.js # Notification handling
│   ├── utils/                     # Utility functions
│   │   ├── apiError.js            # Custom error handling
│   │   ├── apiFeatures.js         # Query features (pagination, sorting)
│   │   ├── logger.js              # Winston logging
│   │   ├── sendEmails.js          # Email utility
│   │   └── sendGrid.js            # SendGrid integration
│   ├── validators/                # Input validation schemas
│   │   ├── userValidator.js
│   │   ├── courtValidator.js
│   │   ├── bookingValidator.js
│   │   ├── matchValidator.js
│   │   ├── slotValidator.js
│   │   ├── reviewValidator.js
│   │   └── notificationValidator.js
│   └── uploads/                   # User-uploaded files (organized by type)
├── logs/                          # Application logs (daily rotation)
├── .env.example                   # Environment variables template
├── server.js                      # Application entry point
├── package.json                   # Project dependencies
└── README.md                      # This file
```

## 🔒 Security Features

- **Helmet**: Security headers and protection against common vulnerabilities
- **CORS**: Configurable cross-origin resource sharing with origin whitelist
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **MongoDB Sanitization**: Prevention of NoSQL injection attacks
- **HPP**: HTTP parameter pollution protection
- **JWT**: Secure token-based authentication with expiration
- **Password Hashing**: Bcrypt encryption for secure password storage
- **Input Validation**: Comprehensive request validation using express-validator
- **Compression**: Response compression for improved performance
- **Error Handling**: Secure error messages without exposing sensitive info
- **Firebase Security**: Secure real-time communication
- **Upload Security**: File type validation and size limits

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/profile` - Get logged-in user profile
- `PUT /api/users/:id` - Update user (Admin)
- `PUT /api/users/profile` - Update own profile
- `DELETE /api/users/:id` - Delete user (Admin)

### Courts
- `GET /api/courts` - Get all courts
- `GET /api/courts/:id` - Get court details
- `POST /api/courts` - Create court (Admin)
- `PUT /api/courts/:id` - Update court (Admin)
- `DELETE /api/courts/:id` - Delete court (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match
- `POST /api/matches/:id/join` - Join a match

### Slots
- `GET /api/slots` - Get available slots
- `GET /api/slots/:id` - Get slot details
- `POST /api/slots` - Create slot
- `PUT /api/slots/:id` - Update slot
- `DELETE /api/slots/:id` - Delete slot

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get notification details
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Health Check
- `GET /health` - Server health status

## 🛠️ Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables
- `NODE_ENV`: Set to `production` for production deployment
- `JWT_SECRET`: Must be at least 32 characters in production
- `JWT_EXPIRE`: Token expiration time (e.g., "7d")
- `DB_STRING`: MongoDB connection string
- `ALLOWED_ORIGINS`: Whitelist your frontend domains (comma-separated)

### Email & Notifications
- `SENDGRID_API_KEY`: SendGrid API key for email notifications
- `SENDGRID_SENDER_EMAIL`: Sender email address
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Nodemailer configuration

### File Upload & Storage
- `CLOUDINARY_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_SECRET`: Cloudinary API secret

### Firebase
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY_ID`: Firebase private key ID
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Firebase client email
- `FIREBASE_CLIENT_ID`: Firebase client ID

## 📝 Logging

Application logs are stored in the `logs/` directory with daily rotation:
- `combined-YYYY-MM-DD.log`: All logs
- `error-YYYY-MM-DD.log`: Error logs only
- `warn-YYYY-MM-DD.log`: Warning logs only
- Logs rotate daily and are retained for 14-30 days

### Log Levels
- `error`: Critical errors
- `warn`: Warnings
- `info`: General information
- `debug`: Debug information (development only)

## 🚀 Production Deployment

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong-secret-min-32-chars>
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Use a process manager** (PM2 recommended)
   ```bash
   npm install -g pm2
   pm2 start server.js --name kora-app
   pm2 save
   pm2 startup
   ```

3. **Set up reverse proxy** (Nginx recommended)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL/TLS** (Let's Encrypt)
   ```bash
   certbot --nginx -d yourdomain.com
   ```

5. **Monitor and manage**
   ```bash
   pm2 logs kora-app
   pm2 status
   pm2 restart kora-app
   ```

6. **Database optimization**
   - Create indexes on frequently queried fields
   - Set up regular backups
   - Monitor database performance

7. **Monitoring & Analytics**
   - Set up error tracking (e.g., Sentry)
   - Monitor server performance
   - Track API response times

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting (when configured)
npm run lint
```

## 📦 Dependencies Overview

### Core Framework
- **express**: Web application framework
- **express-async-handler**: Error handling for async routes

### Database
- **mongoose**: MongoDB object modeling

### Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing
- **helmet**: Security headers
- **cors**: Cross-Origin Resource Sharing
- **hpp**: HTTP Parameter Pollution protection
- **express-validator**: Request validation and sanitization
- **mongo-sanitize**: NoSQL injection prevention

### File Upload & Processing
- **cloudinary**: Cloud image storage
- **multer**: File upload middleware
- **multer-storage-cloudinary**: Cloudinary storage engine
- **sharp**: Image optimization and processing

### Email & Notifications
- **@sendgrid/mail**: SendGrid email service
- **nodemailer**: Email sending
- **firebase-admin**: Firebase real-time database and messaging

### Utilities
- **dotenv**: Environment variable management
- **morgan**: HTTP request logging
- **winston**: Application logging
- **winston-daily-rotate-file**: Log file rotation
- **compression**: Response compression
- **cookie-parser**: Cookie parsing
- **moment**: Date/time utilities
- **slugify**: URL slug generation
- **uuid**: Unique ID generation

### Development
- **nodemon**: Development server auto-reload

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes before submitting PR
- Update README if adding new features
- Add input validation for all endpoints
- Handle errors gracefully with proper status codes

## 📧 Support

For support, please:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce
4. Contact: support@sportify.com

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Core features: User management, court booking, matches, reviews
- Firebase integration for real-time features
- Comprehensive logging and error handling
- Production-ready security features
