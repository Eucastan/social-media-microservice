import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadStatusMiddleware, createStatus, getStatusesByUser, getStatusesForUsers } from '../controller/statusController.js';

const router = express.Router();

router.post('/', authMiddleware, uploadStatusMiddleware, createStatus);

router.get('/user/:userId', authMiddleware, getStatusesByUser);

router.post('/feed', authMiddleware, getStatusesForUsers);

export default router;
