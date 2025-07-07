import express from 'express';
import { addCar } from '../controllers/car.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// Add car (POST /api/car)
router.post('/', verifyUser, addCar);

export default router; 