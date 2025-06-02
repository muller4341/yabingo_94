import express from 'express';

import { signup, signin,  add_employee, requestPasswordReset, resetPassword } from '../controllers/auth.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

router.post('/signup',signup )
router.post('/addemployee', verifyUser, add_employee )
router.post('/signin',signin )
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)
export default router;