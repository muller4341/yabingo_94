import express from 'express';

import { signup, signin  } from '../controllers/auth.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

router.post('/signup',signup )
router.post('/signin',signin )
export default router;