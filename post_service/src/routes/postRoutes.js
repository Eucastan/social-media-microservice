import express from "express";
const router = express.Router();
import upload from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from "../controllers/postControllers.js";

router.post("/", authMiddleware, upload.array("media", 10), createPost);
router.get("/", authMiddleware, getAllPosts);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;