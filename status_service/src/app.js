import express from "express";
import dotenv from "dotenv";
import statusRoutes from "./routes/statusRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ 
    ok: true, 
    service: "status-service",
    uptime: process.uptime(),
    timestamp: new Date() 
}));

app.use("/api/statuses", statusRoutes);

app.use(errorMiddleware);

export default app;
