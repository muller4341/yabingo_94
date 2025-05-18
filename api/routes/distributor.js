import express from 'express';

import  add_distributor from '../controllers/distributor.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

//router.post('/signup',signup )
router.post('/adddistributor', verifyUser, add_distributor )

// router.post('/addemployee', verifyUser, add_employee )
//router.post('/signin',signin )
//router.post('/google',google )
// router.get('/verifyemail',verifyEmail )

export default router;