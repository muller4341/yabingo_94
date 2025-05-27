import express from 'express';

import {setPriceForProduct, getPrices} from '../controllers/price.js'
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.post('/addprice', verifyUser,setPriceForProduct)
router.get('/getprice', verifyUser,getPrices)

export default router;