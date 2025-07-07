import express from 'express';
import { addDriver, getDrivers } from '../controllers/driver.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// Add driver (POST /api/driver)
router.post('/', verifyUser, addDriver);

// Get all drivers (GET /api/driver)
router.get('/', verifyUser, getDrivers);

export default router; 