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
    const { createdBy, Total, WinnerPrize, HostingRent } = req.body;
    if (!createdBy || !Total || !WinnerPrize || !HostingRent) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Always create a new price record (history)
    const doc = new AllPrice({ createdBy, Total, WinnerPrize, HostingRent });
    await doc.save();
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// Get AllPrice for all users (admin) or current user (user), categorized by day, week, month
const getAllPrice = async (req, res, next) => {
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
    const sumAll = isAdmin ? sumFieldsByUser(prices) : sumFields(prices);


    function sumFields(prices) {
      return prices.reduce((acc, p) => ({
        Total: (parseFloat(acc.Total) + parseFloat(p.Total)).toString(),
        WinnerPrize: (parseFloat(acc.WinnerPrize) + parseFloat(p.WinnerPrize)).toString(),
        HostingRent: (parseFloat(acc.HostingRent) + parseFloat(p.HostingRent)).toString(),
        service: (parseFloat(acc.service) + parseFloat(p.service)).toString(),
      }), { Total: "0", WinnerPrize: "0", HostingRent: "0", service: "0" });
    }

    function sumFieldsByUser(prices) {
      const userSums = {};
      prices.forEach(p => {
        const userId = p.createdBy;
        if (!userSums[userId]) {
          userSums[userId] = { Total: "0", WinnerPrize: "0", HostingRent: "0", service: "0" };
        }
        userSums[userId].Total = (parseFloat(userSums[userId].Total) + parseFloat(p.Total)).toString();
        userSums[userId].WinnerPrize = (parseFloat(userSums[userId].WinnerPrize) + parseFloat(p.WinnerPrize)).toString();
        userSums[userId].HostingRent = (parseFloat(userSums[userId].HostingRent) + parseFloat(p.HostingRent)).toString();
        userSums[userId].service = (parseFloat(userSums[userId].service) + parseFloat(p.service)).toString();
      });
      return userSums;
    }

    const sumByDay = isAdmin ? sumFieldsByUser(byDay) : sumFields(byDay);
    const sumByWeek = isAdmin ? sumFieldsByUser(byWeek) : sumFields(byWeek);
    const sumByMonth = isAdmin ? sumFieldsByUser(byMonth) : sumFields(byMonth);

    res.status(200).json({
      success: true,
      data: {
        byDay, byWeek, byMonth, all: prices,
        sumByDay, sumByWeek, sumByMonth,sumAll
      }
    });
  } catch (err) {
    next(err);
  }
};

export { setPrice, getMyPrice , getAllPrice }; 