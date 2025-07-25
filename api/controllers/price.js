import Price from "../model/price.js";
import { errorHandler } from "../utils/error.js";
import AllPrice from '../model/allprice.js';

// Create or update price for the current user
const setPrice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, rentpercent } = req.body;

    // Only allow user to set their own price
    let price = await Price.findOne({ createdBy: userId });
    if (price) {
      price.amount = amount;
      price.rentpercent = rentpercent;
      await price.save();
    } else {
      price = new Price({ createdBy: userId, amount, rentpercent });
      await price.save();
    }
    res.status(200).json({ success: true, data: price });
  } catch (err) {
    next(errorHandler(500, err.message || "Server error"));
  }
};

// Get price for the current user
const getMyPrice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const price = await Price.findOne({ createdBy: userId });
    if (!price) return res.status(404).json({ success: false, message: "No price set" });
    res.status(200).json({ success: true, data: price });
  } catch (err) {
    next(errorHandler(500, err.message || "Server error"));
  }
};

// Upsert AllPrice for a user (add to existing values)
export const upsertAllPrice = async (req, res, next) => {
  try {
    const { createdBy, Total, WinnerPrize, HostingRent, service } = req.body;
    if (!createdBy || !Total || !WinnerPrize || !HostingRent || !service) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    let doc = await AllPrice.findOne({ createdBy });
    if (doc) {
      // Add to existing values (convert to numbers)
      doc.Total = (parseFloat(doc.Total) + parseFloat(Total)).toString();
      doc.WinnerPrize = (parseFloat(doc.WinnerPrize) + parseFloat(WinnerPrize)).toString();
      doc.HostingRent = (parseFloat(doc.HostingRent) + parseFloat(HostingRent)).toString();
      doc.service = (parseFloat(doc.service) + parseFloat(service)).toString();
      doc.createdAt = new Date(); // Update createdAt to now for filtering by day/week/month
      await doc.save();
    } else {
      doc = new AllPrice({ createdBy, Total, WinnerPrize, HostingRent, service });
      await doc.save();
    }
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// Get AllPrice for all users (admin) or current user (user), categorized by day, week, month
export const getAllPrice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    let prices;
    if (isAdmin) {
      // Admin: get all prices, populate user info
      prices = await AllPrice.find({}).lean();
      // Get user info for all users
      const User = (await import('../model/user.js')).default;
      const userIds = prices.map(p => p.createdBy);
      const users = await User.find({ _id: { $in: userIds } }).lean();
      const userMap = {};
      users.forEach(u => {
        userMap[u._id.toString()] = u;
      });
      prices = prices.map(p => ({
        ...p,
        user: userMap[p.createdBy] ? {
          firstname: userMap[p.createdBy].firstname,
          lastname: userMap[p.createdBy].lastname,
          id: userMap[p.createdBy]._id,
        } : null
      }));
    } else {
      // User: only their own prices
      prices = await AllPrice.find({ createdBy: userId }).lean();
    }
    // Categorize by day, week, month
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const byDay = prices.filter(p => new Date(p.updatedAt) >= startOfDay);
    const byWeek = prices.filter(p => new Date(p.updatedAt) >= startOfWeek);
    const byMonth = prices.filter(p => new Date(p.updatedAt) >= startOfMonth);
    res.status(200).json({ success: true, data: { byDay, byWeek, byMonth, all: prices } });
  } catch (err) {
    next(err);
  }
};

export { setPrice, getMyPrice }; 