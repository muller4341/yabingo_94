import express from "express";
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrder, 
  cancelOrder, 
  reviewOrder, 
  approveOrder 
} from "../controllers/order.js";
import verifyUser from "../utils/verifyUser.js";

const router = express.Router();

// Create order
router.post("/createorder", verifyUser, createOrder);

// Get all orders (filtered by user role)
router.get("/", verifyUser, getOrders);

// Get single order
router.get("/:orderId", verifyUser, getOrder);

// Update order (for customers and distributors)
router.put("/:orderId", verifyUser, updateOrder);

// Cancel order (for customers and distributors)
router.put("/:orderId/cancel", verifyUser, cancelOrder);

// Review order (for marketing)
router.put("/:orderId/review", verifyUser, reviewOrder);

// Approve/Reject order (for admin)
router.put("/:orderId/approve", verifyUser, approveOrder);

export default router;
