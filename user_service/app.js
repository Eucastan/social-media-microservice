import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes.js";
import { errorMiddleware } from "./src/middleware/errorMiddleware.js";


const app = express();

// Global Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.json({ 
    ok: true, 
    service: 'user-service',
    uptime: process.uptime(),
    timestamp: new Date() 
}));

// Error Handler
app.use(errorMiddleware);

  
export default app;
