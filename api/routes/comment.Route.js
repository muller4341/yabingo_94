import express from 'express';
import  commentController from '../controllers/createComment.js';
import verifyUser from '../utils/verifyUser.js';
const {createComment, getPostComments, likeComment, editComment,deleteComment ,getComments} = commentController;
const router = express.Router();

router.post('/create',verifyUser, createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId', verifyUser, likeComment);
router.put('/editComment/:commentId', verifyUser, editComment);
router.delete('/deleteComment/:commentId', verifyUser, deleteComment);
router.get('/getComments',verifyUser, getComments);


export default router;