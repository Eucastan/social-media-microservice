# Post Service

Manages **post creation**, **retrieval**, and **media uploads** for the social media platform.
It integrates with **RabbitMQ** for event publishing and **AWS S3 (via LocalStack)** for file storage.

# Setup

Install dependencies: npm install
Run: node server.js

# Dependencies

Express, Sequelize, MySQL2, AWS SDK, Multer, RabbitMQ, Winston

# Endpoints

POST /api/posts: Create a post
GET /api/posts: Get all posts
GET /api/posts/:id: Get post by ID
PUT /api/posts/:id: Update post
DELETE /api/posts/:id: Delete post
GET /health: Check service status

# Testing
Run npm test to execute Jest tests.