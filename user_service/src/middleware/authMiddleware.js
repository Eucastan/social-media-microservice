import logger from "../configs/logger.js";
import { VerifyToken } from "../utils/authvalidate.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"] ||  req.headers['Authorization'];
    if(!authHeader) return res.status(401).json("No token provided");

    const parts = authHeader.split(" ");
    const token = parts.length === 2 ? parts[1] : null;
    if(!token) return res.status(401).json("Invalid token");

    try{
        const decoded = VerifyToken(token);
        req.user = {id: decoded.id, username: decoded.username};
        return next();
    }catch(err){
        logger.error("JWT verification failed", err);
        return res.status(401).json("Unauthorized");
    }
}