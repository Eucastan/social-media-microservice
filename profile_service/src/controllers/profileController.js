import { Profile } from '../models/index.js';
import s3 from '../config/s3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '../config/logger.js';
import { publishEvent } from '../config/mq.js';
import { fetchPost } from '../utils/axiosClient.js';
import { getPagination } from '../utils/pagination.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

function buildS3Url(key) {
    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, "") || `https://s3.${process.env.AWS_REGION}.amazonaws.com`;
    const bucket = process.env.S3_BUCKET;
    return `${endpoint}/${bucket}/${key}`;
}

export async function getProfile(req, res, next) {
    try {
        const userId = req.params.userId;

        const profile = await Profile.findByPk(userId);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        
        res.json(profile);
    } catch (err) { next(err); }
}

export async function upsertProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const { displayName, bio, location, socialLinks } = req.body;
        if (!displayName || displayName.length > 100) return res.status(400).json({ message: 'Invalid displayName' });

        const [profile, created] = await Profile.upsert({
            userId,
            displayName,
            bio: bio?.substring(0, 500),
            location: location?.substring(0, 100),
            socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined
        }, { returning: true });
        
        const exchange = process.env.EVENT_EXCHANGE || "social.events";
        await publishEvent(exchange, 'profile.updated', { 
            userId, 
            displayName, 
            updatedAt: new Date().toISOString() 
        });

        res.json(profile);
    } catch (err) { next(err); }
}

export async function presignUpload(req, res, next) {
    try {
        const { filename, contentType, purpose } = req.body;
        if (!filename || !contentType || !['avatar', 'cover'].includes(purpose)) {
            return res.status(400).json({ message: 'filename, contentType, and valid purpose required' });
        }
        const bucket = process.env.S3_BUCKET;
        const key = `${purpose}/${req.user.id}/${Date.now()}-${uuidv4()}-${filename}`;

        const cmd = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
            ACL: 'public-read'
        });

        const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });
        res.json({ url, key });
    } catch (err) { next(err); }
}

export async function finalizeUpload(req, res, next) {
    try {
        const userId = req.user.id;
        const { key, purpose } = req.body;
        if (!key || !['avatar', 'cover'].includes(purpose)) {
            return res.status(400).json({ message: 'key and valid purpose required' });
        }

        const url = buildS3Url(key);
        const update = purpose === 'avatar' ? { avatarKey: key, avatarUrl: url } : { coverKey: key, coverUrl: url };
        await Profile.upsert({ userId, ...update });
        
        const exchange = process.env.EVENT_EXCHANGE || "social.events";
        await publishEvent(exchange, 'profile.updated', { 
            userId, 
            reason: 'media_updated', 
            purpose, 
            updatedAt: new Date().toISOString() 
        });

        const profile = await Profile.findByPk(userId);
        res.json(profile);
    } catch (err) { next(err); }
}

const upload = multer({ 
    storage: multer.memoryStorage(), 
    limits: { fileSize: 50 * 1024 * 1024 }
}); 

export const avatarUploadMiddleware = upload.single('file');

export async function uploadAvatarServer(req, res, next) {
    try {
        if (!req.file) return res.status(400).json({ message: 'file missing' });
        const userId = req.user.id;
        const purpose = req.body.purpose || 'avatar';
        const bucket = process.env.S3_BUCKET;
        const key = `${purpose}/${userId}/${Date.now()}-${uuidv4()}-${req.file.originalname}`;

        const cmd = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read'
        });
        await s3.send(cmd);

        const url = buildS3Url(key);
        const update = purpose === 'avatar' ? { avatarKey: key, avatarUrl: url } : { coverKey: key, coverUrl: url };
        await Profile.upsert({ userId, ...update });

        const exchange = process.env.EVENT_EXCHANGE || "social.events";
        await publishEvent(exchange, 'profile.updated', { 
            userId, 
            reason: 'media_uploaded', 
            purpose, 
            updatedAt: new Date().toISOString() 
        });

        const profile = await Profile.findByPk(userId);
        res.json(profile);
    } catch (err) { next(err); }
}

export async function getGallery(req, res, next) {
    try {
        const userId = req.params.userId;
        const { page, size } = getPagination(req.query);

        const data = await fetchPost(`/posts?authorId=${userId}&page=${page}&size=${size}`);
        if (data === null) return res.status(503).json({ message: 'Post service unavailable' });

        res.json(data);
    } catch (err) { next(err); }
}
