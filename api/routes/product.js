import express from 'express';

import  {addProduct, getProducts} from '../controllers/product.js'
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.post('/addproduct', verifyUser, addProduct)
router.get('/getproduct',  getProducts)

export default router;