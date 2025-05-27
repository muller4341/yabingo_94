import Product from "../model/product.js";

const addProduct = async (req, res) => {
  try {
    const {
      salesLocation,
      productName,
      productType,
      withHolding,
      quantity,
    } = req.body;

    // ✅ Ensure the user is authenticated and has the 'production' role
    if (!req.user || req.user.role !== "production") {
      console.log("Decoded user from token:", req.user);
      return res.status(403).json({
        message: "Access denied. Only users with 'production' role can add products.",
      });
    }

    // ✅ Validate required fields
    if (!salesLocation || !productName || !productType || !withHolding || !quantity ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // ✅ Create new product
    const newProduct = new Product({
      salesLocation,
      productName,
      productType,
      withHolding,
      quantity,
      unit: "quintal",
      createdBy: req.user._id, // store creator's ObjectId for traceability
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default addProduct;
