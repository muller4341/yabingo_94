import express from 'express';

import  setPriceForProduct from '../controllers/price.js'
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.post('/addprice', verifyUser,setPriceForProduct)

export default router;