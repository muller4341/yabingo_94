import express from 'express';
import { createDispatch, getDispatches, updateDispatch } from '../controllers/dispatch.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// Create a new dispatch
router.post('/', verifyUser, createDispatch);

// Get all dispatches
router.get('/', verifyUser, getDispatches);

// Update a dispatch by id
router.patch('/:id', verifyUser, updateDispatch);

export default router; 