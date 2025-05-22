import express from 'express';

import  { addDistributor, getDistributors, createDistributor, migrateDistributorsFromUsers} from '../controllers/distributor.js'
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

//router.post('/signup',signup )
router.post('/adddistributor', verifyUser, addDistributor )
router.get('/getdistributors', verifyUser, getDistributors)
router.post('/createdistributor', verifyUser, createDistributor )
router.post('/migrate', verifyUser, migrateDistributorsFromUsers )

// router.post('/addemployee', verifyUser, add_employee )
//router.post('/signin',signin )
//router.post('/google',google )
// router.get('/verifyemail',verifyEmail )

export default router;