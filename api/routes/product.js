import express from 'express';

import  addProduct from '../controllers/product.js'
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.post('/addproduct', verifyUser, addProduct)

export default router;