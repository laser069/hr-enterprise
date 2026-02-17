# HR Enterprise Backend - Production Implementation

## Overview
This is a production-ready HR Management System backend built with NestJS, featuring:

- **Complete API Documentation** with Swagger/OpenAPI
- **Email Service** with Nodemailer (password reset, verification, notifications)
- **File Upload** with AWS S3 integration
- **Real-time Notifications** with WebSocket
- **Health Checks** with Terminus
- **Job Queue** with Bull and Redis
- **Security** with Helmet, compression, rate limiting
- **Structured Logging** with Winston
- **Account Lockout** protection against brute force attacks

## Features Implemented

### 1. Authentication & Security
- JWT-based authentication
- Password reset via email
- Email verification
- Account lockout after 5 failed attempts
- Refresh token rotation
- Secure password hashing with bcrypt

### 2. File Management
- Upload files to AWS S3
- Multiple categories (resume, contract, ID proof, etc.)
- File type and size validation
- Secure signed URLs for file access

### 3. Notifications
- Real-time WebSocket notifications
- In-app notification center
- Email notifications for important events
- Unread notification count

### 4. Health Monitoring
- Health check endpoint (`/health`)
- Kubernetes liveness probe (`/health/liveness`)
- Kubernetes readiness probe (`/health/readiness`)
- Database connectivity check
- Memory and disk usage monitoring

### 5. API Documentation
- Swagger UI at `/api/docs`
- Complete API specifications
- Authentication with JWT
- All endpoints documented with examples

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure:

```env
# Required
DATABASE_URL=postgresql://postgres:password@localhost:5432/hr_enterprise
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-long

# Optional (for full functionality)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
REDIS_HOST=localhost
```

### 3. Database Setup
```bash
# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

### 4. Start the Server
```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/verify-email` - Verify email address
- `GET /auth/me` - Get current user profile

### File Upload
- `POST /upload` - Upload file (multipart/form-data)
- `DELETE /upload/:id` - Delete file

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

### Health
- `GET /health` - Full health check
- `GET /health/liveness` - Kubernetes liveness
- `GET /health/readiness` - Kubernetes readiness

### WebSocket
- Connect to `ws://localhost:3002/notifications`
- Authenticate with JWT token
- Real-time notifications

## Testing

### Using Swagger UI
1. Open http://localhost:3002/api/docs
2. Click "Authorize" and enter JWT token
3. Test all endpoints interactively

### Using Test Interface
1. Open http://localhost:3002 (serves the test interface)
2. Use the forms to test authentication, file upload, etc.
3. Check responses in real-time

### Default Credentials
- **Admin**: admin@hrenterprise.com / Admin@123
- **HR Manager**: sarah.johnson@hrenterprise.com / HrManager@123
- **Manager**: michael.chen@hrenterprise.com / Manager@123

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | JWT signing secret (min 32 chars) |
| JWT_REFRESH_SECRET | Yes | Refresh token secret (min 32 chars) |
| SMTP_HOST | No | SMTP server host |
| SMTP_USER | No | SMTP username |
| SMTP_PASS | No | SMTP password |
| AWS_ACCESS_KEY_ID | No | AWS access key for S3 |
| AWS_SECRET_ACCESS_KEY | No | AWS secret key |
| AWS_S3_BUCKET | No | S3 bucket name |
| REDIS_HOST | No | Redis host for Bull queue |
| SENTRY_DSN | No | Sentry error tracking DSN |

## Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   ├── modules/
│   │   ├── upload/          # File upload module
│   │   ├── notifications/   # Notifications & WebSocket
│   │   └── health/          # Health checks
│   ├── shared/
│   │   └── email/           # Email service
│   ├── config/              # Configuration
│   └── main.ts              # Application entry
├── prisma/
│   └── schema.prisma        # Database schema
└── public/
    └── index.html           # Test interface
```

## Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production SMTP credentials
- [ ] Set up AWS S3 bucket with proper permissions
- [ ] Configure Redis for Bull queues
- [ ] Set up Sentry for error tracking
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up log rotation
- [ ] Configure database backups
- [ ] Set up monitoring and alerting

## Support

For issues and questions, please refer to:
- API Documentation: http://localhost:3002/api/docs
- Health Status: http://localhost:3002/health
