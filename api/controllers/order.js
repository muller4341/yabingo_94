import Order from "../model/Order.js";
import Price from "../model/price.js";

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

    const pricePerUnit = matchedPrice.price;
    const totalPrice = pricePerUnit * quantity;

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
      totalPrice,
      withShipping: Boolean(withShipping),
      destination: Boolean(withShipping) ? destination : '',
      createdBy: req.user?.id || null, // If you have auth middleware
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
