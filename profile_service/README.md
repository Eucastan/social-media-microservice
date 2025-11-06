# Profile Service

The **Profile Service** manages user profiles for the social media platform.  
It handles profile creation, updates (display name, bio, location, etc.), and image uploads to AWS S3 or LocalStack.  
It also consumes user events from RabbitMQ and interacts with the Post Service to fetch user galleries.

# Features

- Manage user profiles (display name, bio, location, social links)
- Upload avatar and cover images via:
  - Presigned URLs
  - Direct server-side uploads
- Automatically creates blank profiles when a new user registers (via RabbitMQ event)
- Retrieves post galleries from the Post Service with Redis caching
- Fault-tolerant with circuit breaker, retry logic, and fallbacks



# Setup

Install dependencies: npm install
Create .env file based on .env.example
Run: node server.js

# Dependencies

Express, Sequelize, MySQL2, AWS SDK, RabbitMQ, Winston, Redis, Opossum, Jest + Supertest

# Endpoints

GET /api/profiles/:userId: Get user profile
PUT /api/profiles: Update profile
POST /api/profiles/presign: Generate S3 presigned URL
POST /api/profiles/finalize: Finalize S3 upload
POST /api/profiles/upload: Server-side upload
GET /api/profiles/:userId/gallery: Get user posts
GET /health: Check service status

# Testing
Run npm test to execute Jest tests.