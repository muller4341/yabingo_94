import Price from "../model/price.js";
import { errorHandler } from "../utils/error.js";
import AllPrice from '../model/allprice.js';
import IdempotencyRecord from "../model/IdempotencyRecord.js";
import crypto from "crypto";
// Helper: short hash of payload to stabilize dedupe key
function hashPayload({ createdBy, Total, WinnerPrize, HostingRent }) {
  const str = `${createdBy}|${Total}|${WinnerPrize}|${HostingRent}`;
  return crypto.createHash("sha256").update(str).digest("hex");
}


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
// export const upsertAllPrice = async (req, res, next) => {
//   try {
//     const { createdBy, Total, WinnerPrize, HostingRent, round } = req.body;
//     if (!createdBy || !Total || !WinnerPrize || !HostingRent || !round) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }
//     // Always create a new price record (history)
//     const doc = new AllPrice({ createdBy, Total, WinnerPrize, HostingRent, round });
//     await doc.save();
//     res.status(200).json({ success: true, data: doc });
//   } catch (err) {
//     next(err);
//   }
// };


/// Upsert AllPrice for a user (add to existing values, but prevent duplicate round per day per user)
// export const upsertAllPrice = async (req, res, next) => {
//   try {
//     const { createdBy, Total, WinnerPrize, HostingRent, round } = req.body;

//     if (!createdBy || !Total || !WinnerPrize || !HostingRent || !round) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const existingRound = await AllPrice.findOne({
//       createdBy,
//       round,
//       createdAt: { $gte: todayStart, $lte: todayEnd }
//     });

//     if (existingRound) {
//       return res.status(400).json({
//         message: `Round ${round} has already been recorded for this user today.`,
//       });
//     }

//     const doc = new AllPrice({ createdBy, Total, WinnerPrize, HostingRent, round });
//     await doc.save();

//     res.status(200).json({ success: true, data: doc });
//   } catch (err) {
//     console.error("Error in upsertAllPrice:", err);  // <-- Add this line
//     next(err);
//   }
// };
export const upsertAllPrice = async (req, res, next) => {
  try {
    const { createdBy, Total, WinnerPrize, HostingRent, round, winRemains } = req.body;

    if (!createdBy || !Total || !WinnerPrize || !HostingRent || !round || !winRemains) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Convert round to number for consistency
    const roundNumber = Number(round);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    try {
      // Use findOneAndUpdate with upsert to make it atomic
      const doc = await AllPrice.findOneAndUpdate(
        {
          createdBy,
          round: roundNumber,
          createdAt: { $gte: todayStart, $lte: todayEnd }
        },
        {
          createdBy,
          Total,
          WinnerPrize,
          HostingRent,
          winRemains,
          round: roundNumber,
          // Don't update createdAt if document exists
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      // Handle duplicate key error from the unique index
      if (err.code === 11000) {
        return res.status(200).json({ 
          success: true, 
          duplicate: true,
          message: `Round ${roundNumber} has already been recorded for this user today.`
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("Error in upsertAllPrice:", err);
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
        round: (parseFloat(acc.round) + parseFloat(p.round)).toString(),
        winRemains: (parseFloat(acc.winRemains) + parseFloat(p.winRemains)).toString(),
      }), { Total: "0", WinnerPrize: "0", HostingRent: "0", round: "0", winRemains: "0" });
    }

    function sumFieldsByUser(prices) {
      const userSums = {};
      prices.forEach(p => {
        const userId = p.createdBy;
        if (!userSums[userId]) {
          userSums[userId] = { Total: "0", WinnerPrize: "0", HostingRent: "0", r: "0" };
        }
        userSums[userId].Total = (parseFloat(userSums[userId].Total) + parseFloat(p.Total)).toString();
        userSums[userId].WinnerPrize = (parseFloat(userSums[userId].WinnerPrize) + parseFloat(p.WinnerPrize)).toString();
        userSums[userId].HostingRent = (parseFloat(userSums[userId].HostingRent) + parseFloat(p.HostingRent)).toString();
        

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



// POST /api/price/allprice
// export const upsertAllPrice = async (req, res, next) => {
//   try {
//     const { createdBy, Total, WinnerPrize, HostingRent, idempotencyKey } = req.body;

//     if (!createdBy || !Total || !WinnerPrize || !HostingRent) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // 1) Strong idempotency path (if client provides a key)
//     if (idempotencyKey) {
//       try {
//         const doc = await AllPrice.create({ createdBy, Total, WinnerPrize, HostingRent, idempotencyKey });
//         return res.status(200).json({ success: true, data: doc });
//       } catch (err) {
//         if (err && err.code === 11000) {
//           // Already inserted before for this key
//           return res.status(200).json({ success: true, duplicate: true });
//         }
//         throw err;
//       }
//     }

//     // 2) Network-safe fallback (no idempotencyKey): use TTL lock record
//     // Configure window (in ms) to absorb retries/timeouts; adjust as needed
//     const WINDOW_MS = 2 * 60 * 1000; // 2 minutes
//     const payloadHash = hashPayload({ createdBy, Total, WinnerPrize, HostingRent });
//     const lockKey = `allprice:${createdBy}:${payloadHash}`;

//     // Try to reserve this operation (upsert lock if not exists)
//     // If another request reserved it moments earlier, we treat this as duplicate.
//     const now = new Date();
//     const expireAt = new Date(now.getTime() + WINDOW_MS);

//     try {
//       await IdempotencyRecord.create({ key: lockKey, createdBy, expireAt });
//       // We got the reservation -> first request in the window: perform insert
//     } catch (err) {
//       if (err && err.code === 11000) {
//         // Lock already exists in window => a previous attempt won (or is in-flight)
//         return res.status(200).json({ success: true, duplicate: true });
//       }
//       throw err;
//     }

//     // Perform the insert. If insert fails, we keep the lock to avoid duplicates caused by retry storms.
//     // This favors "no duplicates" over "guaranteed insertion" under severe flakiness.
//     const doc = await AllPrice.create({ createdBy, Total, WinnerPrize, HostingRent });

//     return res.status(200).json({ success: true, data: doc });
//   } catch (err) {
//     next(err);
//   }
// };


const deletePrice = async (req, res) => {
  try {
    const priceId = req.params.id;
    const user = req.user;

    const price = await AllPrice.findById(priceId);

    if (!price) {
      return res.status(404).json({ success: false, message: 'Price not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await AllPrice.findByIdAndDelete(priceId);

    res.status(200).json({ success: true, message: 'Price deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { setPrice, getMyPrice , getAllPrice, deletePrice };
