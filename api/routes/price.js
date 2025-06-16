import express from 'express';

import {setPriceForProduct, getPrices,  getAllProductsWithPriceHistory, getAllProductsWithCurrentprice} from '../controllers/price.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.post('/addprice', verifyUser,setPriceForProduct)
router.get('/getprice', verifyUser,getPrices)
router.get('/getallprices', verifyUser, getAllProductsWithPriceHistory)
router.get('/getcurrentprices', verifyUser, getAllProductsWithCurrentprice)


export default router;