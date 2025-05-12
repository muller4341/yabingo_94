import express from 'express';
import { uploadMedia, getUserUploadedSlugs } from '../controllers/media.js';

const router = express.Router();

router.post('/upload', uploadMedia);
router.get('/user-slugs/:userId', getUserUploadedSlugs);

export default router;