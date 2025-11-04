import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const SignToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

export const VerifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}