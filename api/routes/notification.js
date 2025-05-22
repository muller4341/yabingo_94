import express from 'express';
import {
  createNotification,
  getNotifications,
  markAllAsRead
} from '../controllers/notification.js';

import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

// POST /api/notifications
router.post('/postnotification',verifyUser, createNotification);

// GET /api/notifications
router.get('/getnotification', verifyUser , getNotifications);

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', verifyUser, markAllAsRead);

export default router;
