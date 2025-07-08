import express from 'express';
import { addCar, getCars, updateCarOnworkStatus } from '../controllers/car.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// Add car (POST /api/car)
router.post('/', verifyUser, addCar);

// Get all cars (GET /api/car)
router.get('/', verifyUser, getCars);

// Update car onwork status (PATCH /api/car/:id/onwork)
router.patch('/:id/onwork', verifyUser, updateCarOnworkStatus);

export default router; 