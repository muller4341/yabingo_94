import express from 'express';
import { addDriver, getDrivers, getAvailableDrivers, updateDriverOnworkStatus, updateDriver } from '../controllers/driver.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// Add driver (POST /api/driver)
router.post('/', verifyUser, addDriver);

// Get all drivers (GET /api/driver)
router.get('/', verifyUser, getDrivers);

// Get available drivers (GET /api/driver/available)
router.get('/available', verifyUser, getAvailableDrivers);

// Update driver onwork status (PATCH /api/driver/:id/onwork)
router.patch('/:id/onwork', verifyUser, updateDriverOnworkStatus);

// Update driver (PATCH /api/driver/:id)
router.patch('/:id', verifyUser, updateDriver);

export default router; 