# Status Service

Manages ephemeral stories (statuses) with media uploads and automatic expiration.
Integrates with the Feed and Notification services through RabbitMQ events for real-time updates.

# Setup

Install dependencies: npm install
Run: node server.js

# Dependencies

Express, Sequelize, MySQL2, AWS SDK, Multer, RabbitMQ, Winston

# Endpoints

POST /api/statuses: Create a status
GET /api/statuses/user/:userId: Get statuses for a user
POST /api/statuses/feed: Get statuses for multiple users
GET /health: Check service status

# Testing
Run npm test to execute Jest tests.