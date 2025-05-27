// controllers/priceController.js
import Price from "../model/price.js";
import {
  salesLocationEnum,
  productNameEnum,
  productTypeEnum,
  withHoldingEnum,
  unitEnum,
} from "../model/product.js";

// Middleware-style controller
const setPriceForProduct = async (req, res) => {
  try {
    const user = req.user;

    // 1. Only finance role can access
    if (!user || user.role !== "finance") {
      return res.status(403).json({ message: "Access denied. Finance only." });
    }

    const {
      salesLocation,
      productName,
      productType,
      withHolding,
      unit,
      status,
      amount,
    } = req.body;

    // 2. Validate enums
    if (!salesLocationEnum.includes(salesLocation)) {
      return res.status(400).json({ message: "Invalid sales location" });
    }

    if (!productNameEnum.includes(productName)) {
      return res.status(400).json({ message: "Invalid product name" });
    }

    if (!productTypeEnum.includes(productType)) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    if (!withHoldingEnum.includes(withHolding)) {
      return res.status(400).json({ message: "Invalid withHolding option" });
    }

    if (!unitEnum.includes(unit)) {
      return res.status(400).json({ message: "Invalid unit" });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 3. Check for existing price
    const existingPrice = await Price.findOne({
      salesLocation,
      productName,
      productType,
      withHolding,
      unit,
      status,
    });

    if (existingPrice) {
      return res.status(400).json({ message: "Price already set for this product combination" });
    }

    // 4. Create new price entry
    const newPrice = new Price({
      salesLocation,
      productName,
      productType,
      withHolding,
      unit,
      status,
      amount,
      createdBy: user._id,
    });

    await newPrice.save();

    res.status(201).json({ message: "Price set successfully", data: newPrice });

  } catch (err) {
    console.error("Error setting price:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default setPriceForProduct
