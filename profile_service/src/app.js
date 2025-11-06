import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();

// Global middleware
app.use(cors()); 
app.use(express.json({ limit: '1mb' })); // JSON middleware per your request

// Routes
app.use('/api/profiles', profileRoutes);

// health route
app.get('/health', (req, res) => res.json({ 
    ok: true, 
    service: 'profile-service',
    uptime: process.uptime(),
    timestamp: new Date() 
}));

// Error handler
app.use(errorMiddleware);

export default app;

