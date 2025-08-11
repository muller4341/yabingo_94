import express from "express";
import { setPrice, getMyPrice, upsertAllPrice, getAllPrice, deletePrice } from "../controllers/price.js";
import verifyUser from '../utils/verifyUser.js'
const router = express.Router();

// Set or update price for current user
router.post("/set", verifyUser, setPrice);

// Get price for current user
router.get("/me", verifyUser, getMyPrice);
router.post('/allprice', verifyUser, upsertAllPrice);
router.get('/allprice', verifyUser, getAllPrice);
router.delete('/delete/:id', verifyUser, deletePrice);

export default router; 