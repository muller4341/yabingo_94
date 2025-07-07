import express from 'express';
import { addDriver } from '../controllers/driver.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// Add driver (POST /api/driver)
router.post('/', verifyUser, addDriver);

export default router; 