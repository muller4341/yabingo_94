import Price from "../model/price.js";

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
      price,
    } = req.body;

    // 2. Basic validation
    if (
      !salesLocation ||
      !productName ||
      !productType ||
      !withHolding ||
      !unit ||
      typeof price !== "number" ||
      price < 0
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // 3. Check if an active price already exists with the same value
    const existingActivePrice = await Price.findOne({
      salesLocation,
      productName,
      productType,
      withHolding,
      unit,
      isArchived: false,
    });

    // If price has not changed, skip the update
    if (existingActivePrice && existingActivePrice.price === price) {
      return res.status(200).json({ message: "Price already up to date." });
    }

    // 4. Archive previous active price
    if (existingActivePrice) {
      await Price.updateMany(
        {
          salesLocation,
          productName,
          productType,
          withHolding,
          unit,
          isArchived: false,
        },
        { $set: { isArchived: true } }
      );
    }

    // 5. Create and save new price
    const newPrice = new Price({
      salesLocation,
      productName,
      productType,
      withHolding,
      unit,
      price,
      isArchived: false,
      createdBy: user._id,
    });

    await newPrice.save();

    res.status(201).json({
      message: "Price set successfully",
      data: newPrice,
    });

  } catch (err) {
    console.error("Error setting price:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPrices = async (req, res) => {
  try {
    const user = req.user;

    // Optional: restrict access to finance role only
    if (!user || user.role !== "finance") {
      return res.status(403).json({ message: "Access denied. Finance only." });
    }

    // Fetch all prices, you can sort by created date descending if you want
    const prices = await Price.find().sort({ createdAt: -1 });

    res.status(200).json(prices);

  } catch (err) {
    console.error("Error fetching prices:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export {setPriceForProduct, getPrices};
