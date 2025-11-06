import { Router } from 'express';
//import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getProfile, upsertProfile, presignUpload, finalizeUpload,
  avatarUploadMiddleware, uploadAvatarServer, getGallery
} from '../controllers/profileController.js';
import authMiddleware from "../middleware/mockAuth.js";

const router = Router();

router.get('/:userId', authMiddleware, getProfile);
router.put('/', authMiddleware, upsertProfile);             // update own profile
router.post('/presign', authMiddleware, presignUpload);     // presign url
router.post('/finalize', authMiddleware, finalizeUpload);   // finalize after presigned upload
router.post('/upload', authMiddleware, avatarUploadMiddleware, uploadAvatarServer); // server-side
router.get('/:userId/gallery', getGallery);

export default router;
