import express from "express";
import { createOrder } from "../controllers/order.js";

const router = express.Router();

// POST /api/orders
router.post("/createorder", createOrder);

export default router;
