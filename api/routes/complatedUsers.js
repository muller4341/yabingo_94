import express from 'express';
import { getCompletedUsers, getMediaByLuckyNumber, approveMedia,rejectMedia, 
    updateUserStatusByLuckyNumber, getEligibleUsers, 
    getRejectedUsers, updateUserStatus, getTotalPendingUsers,
     getTotalRejectedUsers, getTotalAcceptedUsers 
 } from '../controllers/complatedUsers.js';
 import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.get('/completed-users', getCompletedUsers);
// Approve media
router.patch('/media/:id/approve', approveMedia);

// Reject media
router.patch('/media/:id/reject', rejectMedia);
router.patch('/update-user-status/:id', updateUserStatus);


router.get('/media-by-lucky-number/:luckyNumber', getMediaByLuckyNumber);
router.patch('/user-task-status/:luckyNumber', updateUserStatusByLuckyNumber);
router.get('/users/eligible', getEligibleUsers);
router.get('/users/rejected', getRejectedUsers);
router.get('/users/totalpending',verifyUser , getTotalPendingUsers);
router.get('/users/totalrejected',verifyUser, getTotalRejectedUsers);
router.get('/users/totalaccepted', verifyUser, getTotalAcceptedUsers);



export default router;
