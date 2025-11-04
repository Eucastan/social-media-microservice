import { Post, Media, UserRef } from "../models/index.js";
import { pagination } from "../utils/pagination.js";
import { publishEvent } from "../config/mq.js";
import { logger } from "../config/logger.js";

export const createPost = async (req, res) => {
    try{
        const {content} = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });
        const userId = req.user.id;
        const files = req.files;

        const newPost = await Post.create({content, userId});

        if(files && files.length > 0){
            const mediaData = files.map(file => ({
                postId: newPost.id,
                mediaUrl: file.location || file.path || "",
                mediaType: file.mimetype.includes("video") ? "video" : "image",
                storageKey: file.key || file.filename || ''
            }));

            await Media.bulkCreate(mediaData);
        }

        const postWithMedia = await Post.findByPk(newPost.id, {
            include: [
                {model: Media, as: "media"},
                { model: UserRef, as: "userInfo", attributes: ["displayName", "isPrivate"] }
            ]
        });

        await publishEvent('social.events', 'post.created', {
            id: newPost.id,
            targetUserId: newPost.userId,
            content: newPost.content,
            createdAt: newPost.createdAt,
        });

        res.status(201).json(postWithMedia);
    }catch(err){
        logger.error("Post creation failed", err);
        res.status(500).json({ error: "Internal error while creating post" });
    }

}

export const getAllPosts = async (req, res) => {
    try{
        const page = parseInt(req.query.page, 10) || 1; 
        const size = parseInt(req.query.size, 10) || 10;
        const {limit, offset} = pagination(page, size);

        const fetchPosts = await Post.findAndCountAll({
            include: [
                {model: Media, as: "media"},
                { model: UserRef, as: "userInfo", attributes: ["displayName", "isPrivate"] }
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]]
        });

        res.json({
            totalItems: fetchPosts.count,
            totalPages: Math.ceil(fetchPosts.count / limit) || 1,
            currentPage: page,
            posts: fetchPosts.rows
        });
    }catch(err){
        logger.error("Error fetching posts", err)
        res.status(500).json({message: "Error fetching posts" });
    }
}

export const getPostById = async (req, res) => {
    try{
        const {id} = req.params;

        const post = await Post.findByPk(id, {
            include: [
                {model: Media, as: "media"},
                { model: UserRef, as: "userInfo", attributes: ["displayName", "isPrivate"] }
            ]
        });
        
        if(!post) return res.status(404).json({ message: "Post not found" });

            
        res.json(post);
    }catch(err){
        res.status(500).json({message: "Error fetching post" });
    }
}

export const updatePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const {content} = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });
        const userId = req.user.id;

        const post = await Post.findByPk(postId);
        if(!post) return res.status(404).json("Post not found");

        if(post.userId !== userId) return res.status(403).json("Unauthorized access");

        await post.update({content});

        await publishEvent('social.events', 'post.updated', {
            id: postId,
            targetUserId: post.userId,
            content: post.content,
            updatedAt: post.updatedAt,
        });

        res.json({message: "Post updated", post});
    }catch(err){
        logger.error("Error updating post", err);
        res.status(500).json({message: "Error updating post" });
    }
}

export const deletePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const userId = req.user.id;

        const removePost = await Post.findByPk(postId);
        if (!removePost) return res.status(404).json("Post not found");

        if (removePost.userId !== userId) return res.status(403).json("Not authorized");

        await removePost.destroy();

        await publishEvent('social.events', 'post.deleted', {
            id: postId,
            targetUserId: userId,
            deletedAt: new Date(),
        });

        res.json({message: "Post deleted"});
    }catch(err){
        logger.error("Error deleting post", err);
        res.status(500).json({message: "Error deleting post" });
    }
}