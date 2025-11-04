## User Service

This service handles **user authentication** and **registration** for the social media platform. It also communicates asynchronously with other microservices such as the **Profile Service** and **Post Service** through **RabbitMQ**.

## Setup

Install dependencies: npm install
Run: node server.js

## Dependencies

Express, Sequelize, MySQL2, bcrypt, JWT, RabbitMQ, Winston

## Endpoints

POST /api/auth/register: Register a new user
POST /api/auth/login: Login and receive JWT
GET /health: Check service status

## Testing
Run npm test to execute Jest tests.