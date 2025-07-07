import Order from "../model/Order.js";
import Price from "../model/price.js";
import User from "../model/user.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      salesLocation,
      productName,
      productType,
      withHolding,
      quantity,
      withShipping,
      destination,
      createdBy,
      createdByName,
      pricePerUnit,
      totalPrice,
      role,
    } = req.body;

    // ✅ 1) Validate required fields
    if (!salesLocation || !productName || !productType || !withHolding || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ 2) Find latest valid price
    const matchedPrice = await Price.findOne({
      salesLocation,
      productName,
      productType,
      withHolding: String(withHolding), // match saved value
      isArchived: false,
    }).sort({ createdAt: -1 });

    if (!matchedPrice) {
      return res.status(404).json({ message: "No matching price found" });
    }


     // ✅ 2) Enforce customer-specific limit
    const parsedQuantity = Number(quantity);
    if (role === "customer") {
      if (parsedQuantity > 50) {
        return res
          .status(400)
          .json({ message: "Customers cannot order more than 50 units." });
      }
    } else if (role === "distributor") {
      // Distributors: no limit
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ 4) Create and save order
    const order = new Order({
      salesLocation,
      productName,
      productType,
      withHolding: String(withHolding),
      unit: matchedPrice.unit,
      quantity,
      role,
      totalPrice,
      pricePerUnit,
      withShipping: Boolean(withShipping),
      destination: Boolean(withShipping) ? destination : '',
      createdBy,
      createdByName,
      status: "pending", // Default status
      createdAt: new Date(),
    });

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders for a user
export const getOrders = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query = {};

    // Filter orders based on user role
    if (role === 'customer' || role === 'distributor') {
      query.createdBy = _id;
    } else if (role === 'marketing') {
      query.status = 'pending';
    } else if (role === 'admin') {
      query.status = 'reviewed';
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order (for customers and distributors)
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { role, _id } = req.user;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.createdBy.toString() !== _id.toString()) {
  return res.status(403).json({ message: "You can only update your own orders" });
}

if (!['customer', 'distributor'].includes(role)) {
  return res.status(403).json({ message: "Only customers or distributors can update orders" });
}


    // Only allow updates if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ message: "Can only update pending orders" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { ...req.body, lastModifiedBy: _id },
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { role, _id } = req.user;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.createdBy.toString() !== _id.toString()) {
  return res.status(403).json({ message: "You can only update your own orders" });
}

if (!['customer', 'distributor'].includes(role)) {
  return res.status(403).json({ message: "Only customers or distributors can update orders" });
}


    // Only allow cancellation if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ message: "Can only cancel pending orders" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'cancelled', lastModifiedBy: _id },
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Review order (for marketing)
export const reviewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { _id } = req.user;
    
    // Get the user's information
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: "Can only review pending orders" });
    }

    const reviewerName = `${user.firstname} ${user.lastname}`;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: 'reviewed',
        reviewedBy: reviewerName,
        lastModifiedBy: reviewerName
      },
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Review Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve/Reject order (for admin)
export const approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { _id } = req.user;
    const { action, rejectionReason } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'reviewed') {
      return res.status(400).json({ message: "Can only approve/reject reviewed orders" });
    }

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approvedBy: _id,
      lastModifiedBy: _id
    };

    if (action === 'reject') {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Approve Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get orders with status 'paid' and withShipping true (only for dispatchers)
export const getPaidShippedOrders = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ message: 'Only dispatchers can view these orders.' });
  }
  try {
    const orders = await Order.find({ status: 'paid', withShipping: true }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Get Paid & Shipped Orders Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
