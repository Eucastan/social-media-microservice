import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import postsRouter from './routes/postRoutes.js';
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// health check
app.get('/health', (req, res) => res.json({ 
    status: 'ok', 
    service: "post-service",
    uptime: process.uptime(),
    timestamp: new Date()
}));

// APIs
app.use('/api/posts', postsRouter);

// Error handler
app.use(errorMiddleware);

export default app;
