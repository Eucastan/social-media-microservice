import dotenv from 'dotenv';
dotenv.config();

import { Status } from '../models/index.js';
import { Op } from 'sequelize';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../config/s3.js';
import logger from '../config/logger.js';
import { publishEvent } from '../config/mq.js';


const BUCKET = process.env.S3_BUCKET;

if (!BUCKET) throw new Error('S3_BUCKET not set in env');

// multerS3 storage
const upload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      const key = `statuses/${req.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      cb(null, key);
    }
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB, configurable
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid media type'));
  }
});

// create status (upload via server-side)
export const uploadStatusMiddleware = upload.single('media');

export async function createStatus(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'media file required' });

    const { caption } = req.body;
    if (caption && caption.length > 500) return res.status(400).json({ message: 'Caption too long' });
    
    const mediaUrl = req.file.location || `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT.replace('http://','') : 's3.amazonaws.com'}/${req.file.key}`;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const ttlHours = Number(process.env.STATUS_TTL_HOURS || 24);
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);

    const status = await Status.create({
      userId: req.user.id,
      mediaUrl,
      mediaType,
      caption: caption || null,
      expiresAt
    });

    // publish event
    const exchange = process.env.EVENT_EXCHANGE || "social.events";
    await publishEvent(exchange, 'status.created', {
      id: status.id, 
      userId: status.userId, 
      mediaUrl: status.mediaUrl, 
      expiresAt: status.expiresAt 
    });


    logger.info('Status created %s by user %s', status.id, req.user.id);
    res.status(201).json({ success: true, status });
  } catch (err) {
    next(err);
  }
}

// list statuses for a specific user (non-expired)
export async function getStatusesByUser(req, res, next) {
  try {
    const userId = req.params.userId;
    const rows = await Status.findAll({
      where: { userId, expired: false, expiresAt: { 
        [Op.gt]: new Date() 
      } },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, items: rows });
  } catch (err) {
    next(err);
  }
}


export async function getStatusesForUsers(req, res, next) {
  try {
    const userIds = []
      .concat(req.body.userIds || [])
      .concat(req.query.userIds ? req.query.userIds.split(',') : [])
      .filter(Boolean);

    if (userIds.length === 0) {
      return res.status(400).json({ message: 'userIds required' });
    }

    const rows = await Status.findAll({
      where: {
        userId: userIds,
        expired: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, items: rows });
  } catch (err) {
    next(err);
  }
}

