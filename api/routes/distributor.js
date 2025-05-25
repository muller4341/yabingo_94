import express from 'express';

import  { 
      addDistributor, getDistributors, createDistributor,
     getRejectedDistributors,getPendingDistributors,
      updateDistributorApproval, updateRejectedToAccepted,
createCustomer, getCustomers} from '../controllers/distributor.js'
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

//router.post('/signup',signup )
router.post('/adddistributor', verifyUser, addDistributor )
router.get('/getdistributors', verifyUser, getDistributors)
router.get('/getcustomers', verifyUser, getCustomers)
router.get('/getpendingdistributors', verifyUser, getPendingDistributors)
router.post('/createdistributor', verifyUser, createDistributor )
router.post('/createcustomer', verifyUser, createCustomer )
router.get('/getrejecteddistributors', verifyUser, getRejectedDistributors )
router.post('/update-approval',verifyUser, updateDistributorApproval);
router.post('/rejecttoaccepted',verifyUser, updateRejectedToAccepted);



// router.post('/addemployee', verifyUser, add_employee )
//router.post('/signin',signin )
//router.post('/google',google )
// router.get('/verifyemail',verifyEmail )

export default router;