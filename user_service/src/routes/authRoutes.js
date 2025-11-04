import express from "express";
const router = express.Router();
import * as authController from "../controllers/authController.js";
import  rateLimiter from "../configs/rateLimiter.js";

router.post("/register", rateLimiter, authController.Register);
router.post("/login", rateLimiter, authController.Login);

export default router;