import express from 'express';

import { signup, signin, google, verifyEmail } from '../controllers/auth.js';
const router = express.Router();

router.post('/signup',signup )
router.post('/signin',signin )
router.post('/google',google )
router.get('/verifyemail',verifyEmail )

export default router;