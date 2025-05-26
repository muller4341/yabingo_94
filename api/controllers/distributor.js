import Distributor from "../model/distributor.js";
import User from "../model/user.js"; // adjust path as needed

import bcrypt from "bcryptjs";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";
const addDistributor = async (req, res) => {
  try {
    const {
      companyname,
      tinnumber,
      password,
      merchantId,
      licenseexipiration,
      licensenumber,
      region,
      zone,
      phoneNumber,
      profilePicture,
    } = req.body;

    // Check if the requester is authenticated and has the marketing role
    if (!req.user || req.user.role !== "marketing") {
      console.log("Decoded user from token:", req.user);
      console.log ("user.role", req.user.role);
      return res.status(403).json({
        message: "Access denied. Only marketing role can register distributors.",
      });
    }

    // Check uniqueness of tinnumber, merchantId, licensenumber, or phoneNumber
    const existing = await Distributor.findOne({
      $or: [
        { tinnumber },
        { merchantId },
        { licensenumber },
        { phoneNumber },
      ],
    });

    if (existing) {
      return res.status(400).json({
        message: "A distributor with the same TIN number, Merchant ID, License number, or Phone number already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDistributor = new Distributor({
      companyname,
      tinnumber,
      merchantId,
      licenseexipiration,
      licensenumber,
      region,
      zone,
      phoneNumber,
      password: hashedPassword,
      role: "distributor",
      profilePicture: profilePicture || undefined,
      status: "active",
    });

    await newDistributor.save();

    res.status(201).json({
      message: "Distributor registered successfully",
      user: newDistributor,
    });
  } catch (err) {
    console.error("Error adding distributor:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const createDistributor = async (req, res) => {
  try {
    const {
      companyname,
      tinnumber,
      password,
      merchantId,
      licenseexipiration,
      licensenumber,
      region,
      zone,
      phoneNumber,
      profilePicture,
      url
    } = req.body;

    // Only 'gust' or 'customer' users can create a distributor account
    if (!req.user || !['guest', 'customer'].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Only guest or customer role can create distributor accounts.",
      });
    }

    // Check for uniqueness
    const existing = await Distributor.findOne({
      $or: [
        { tinnumber },
        { merchantId },
        { licensenumber },
        { phoneNumber },
      ],
    });

    if (existing) {
      return res.status(400).json({
        message: "Distributor already exists with the same TIN, Merchant ID, License number, or Phone number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDistributor = new Distributor({
      companyname,
      tinnumber,
      merchantId,
      licenseexipiration,
      licensenumber,
      region,
      zone,
      phoneNumber,
      password: hashedPassword,
      role: req.user.role, // will be 'gust' or 'customer'
      profilePicture: profilePicture || undefined,
      status: "inactive",
      approval: "pending",
      url
    });

    await newDistributor.save();

    res.status(201).json({
      message: "Distributor request submitted successfully. Waiting for approval.",
      user: newDistributor,
    });
  } catch (err) {
    console.error("Error adding distributor:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const createCustomer = async (req, res) => {
  try {
    const {
      password,
      region,
      zone,
      profilePicture,
    } = req.body;

    // Only 'gust' or 'customer' users can create a distributor account
    if (!req.user || !['guest'].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Only guest  role can create customer accounts.",
      });
    }
// Fetch user info from the Users model
    const user = await User.findById(req.user.id); // assuming req.user.id is set

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { firstname, lastname, phoneNumber } = user;

    // Check for uniqueness
     const existing = await Distributor.findOne({ phoneNumber });

    if (existing) {
      return res.status(400).json({
        message: "customer already exists with the same Phone number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Distributor({
      firstname,
      lastname,
      region,
      zone,
      phoneNumber,
      password: hashedPassword,
      role: "customer", // will be 'gust' or 'customer'
      profilePicture: profilePicture || undefined,
      status: "active",
      approval:"accepted"
    });

    await newCustomer.save();

    res.status(201).json({
      message: "Customer account is created you can order since now",
      user: newCustomer,
    });
  } catch (err) {
    console.error("error during creating customer account :", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getCustomers = async (req, res, next) => {
    // Ensure only 'admin' and 'marketing' roles can access this route
    if (!req.user || (req.user.role !== "marketing" && req.user.role !== "admin")) {
        return next(errorHandler(403, 'You are not allowed to get all users'));
    }

    try {
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        // Filter for customers with approval status 'accepted'
        let query = Distributor.find({ 
            role: "customer", 
            approval: "accepted" 
        }).sort({ createdAt: sortDirection });

        // Apply pagination if query params exist
        if (req.query.startIndex || req.query.limit) {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 6;
            query = query.skip(startIndex).limit(limit);
        }

        const customers = await query;

        const customerWithoutPassword = customers.map(distributor => {
            const { password, ...rest } = distributor._doc;
            return rest;
        });

        // Count total accepted customers
        const totalCustomers = await Distributor.countDocuments({ 
            role: "customer", 
            approval: "accepted" 
        });

        // Count accepted customers created in the last month
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthCustomers = await Distributor.countDocuments({
            role: "customer",
            approval: "accepted",
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            customers: customerWithoutPassword,
            totalCustomers,
            lastMonthCustomers
        });

    } catch (error) {
        next(error);
    }
};

const getDistributorsByApprovalStatus = async (req, res, next) => {
  const allowedMarketingRoles = ["admin", "marketing"];
  const allowedDistributorRoles = ["distributor"];
  const allowedPendingRoles = ["guest", "customer"];
  const { approval } = req.query; // "pending", "accepted", "rejected", or undefined
  const sortDirection = req.query.sort === 'asc' ? 1 : -1;

  // Access Control
  if (!req.user || !allowedMarketingRoles.includes(req.user.role)) {
    return next(errorHandler(403, 'You are not allowed to fetch distributors'));
  }

  try {
    let filter = {};
    
    // Determine role and approval-based filtering
    if (approval === 'rejected') {
      filter = {
        approval: 'rejected',
        role: { $in: allowedDistributorRoles }
      };
    } else if (approval === 'pending') {
      // Only marketers can access pending
      if (req.user.role !== 'marketing') {
        return next(errorHandler(403, 'Only marketers can fetch pending distributors'));
      }
      filter = {
        approval: 'pending',
        role: { $in: allowedPendingRoles }
      };
    } else if (approval === 'accepted') {
      filter = {
        approval: 'accepted',
        role: { $in: allowedDistributorRoles }
      };
    } else {
      // No approval param, return all distributors
      filter = {
        role: { $in: allowedDistributorRoles }
      };
    }

    // Base query
    let query = Distributor.find(filter).sort({ createdAt: sortDirection });

    // Pagination
    if (req.query.startIndex || req.query.limit) {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 6;
      query = query.skip(startIndex).limit(limit);
    }

    const distributors = await query;

    const distributorWithoutPassword = distributors.map(distributor => {
      const { password, ...rest } = distributor._doc;
      return rest;
    });

    const totalDistributors = await Distributor.countDocuments(filter);

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const lastMonthDistributors = await Distributor.countDocuments({
      ...filter,
      createdAt: { $gte: oneMonthAgo }
    });

    res.status(200).json({
      distributors: distributorWithoutPassword,
      totalDistributors,
      lastMonthDistributors
    });
  } catch (error) {
    next(error);
  }
};



const getRejectedDistributors = async (req, res, next) => {
    const allowedRoles = ["distributor"];

    // Only allow access if user is either marketing OR admin
    if (!req.user || (req.user.role !== "marketing" && req.user.role !== "admin")) {
        return next(errorHandler(403, 'You are not allowed to get rejected users'));
    }

    try {
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        // Query to find rejected users with roles 'gust' or 'customer'
        let query = Distributor.find({
            role: { $in: allowedRoles },
            approval: "rejected"
        }).sort({ createdAt: sortDirection });

        // Apply pagination if params exist
        if (req.query.startIndex || req.query.limit) {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 6;
            query = query.skip(startIndex).limit(limit);
        }

        const distributors = await query;

        const distributorWithoutPassword = distributors.map(distributor => {
            const { password, ...rest } = distributor._doc;
            return rest;
        });

        const totalDistributors = await Distributor.countDocuments({
            role: { $in: allowedRoles },
            approval: "rejected"
        });

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthDistributors = await Distributor.countDocuments({
            role: { $in: allowedRoles },
            approval: "rejected",
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            distributors: distributorWithoutPassword,
            totalDistributors,
            lastMonthDistributors
        });

    } catch (error) {
        next(error);
    }
};

const getPendingDistributors = async (req, res, next) => {
    const allowedRoles = ["guest", "customer"]; // roles you want to fetch

    // Allow only marketing users to access this endpoint
    if (!req.user || req.user.role !== "marketing") {
        return next(errorHandler(403, 'You are not allowed to get pending distributors'));
    }

    try {
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        // Find distributors with approval pending and role in allowedRoles
        let query = Distributor.find({
            approval: "pending",
            role: { $in: allowedRoles }
        }).sort({ createdAt: sortDirection });

        // Apply pagination
        if (req.query.startIndex || req.query.limit) {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 6;
            query = query.skip(startIndex).limit(limit);
        }

        const distributors = await query;

        // Remove password before sending response
        const distributorWithoutPassword = distributors.map(distributor => {
            const { password, ...rest } = distributor._doc;
            return rest;
        });

        const totalDistributors = await Distributor.countDocuments({
            approval: "pending",
            role: { $in: allowedRoles }
        });

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthDistributors = await Distributor.countDocuments({
            approval: "pending",
            role: { $in: allowedRoles },
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            distributors: distributorWithoutPassword,
            totalDistributors,
            lastMonthDistributors
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/distributors/update-approval
const updateDistributorApproval = async (req, res) => {
  const { userId, action } = req.body;

  // Log input for debugging
  console.log("Updating approval for distributor:", userId);
  console.log("Action to perform:", action);

  // Validate request data
  if (!userId || !action) {
    return res.status(400).json({ message: 'Missing userId or action.' });
  }

  try {
    // Find distributor by ID
    const distributor = await Distributor.findById(userId);

    // Validate distributor existence and role
    if (
      !distributor ||
      distributor.approval !== 'pending' ||
      !['gust', 'customer'].includes(distributor.role)
    ) {
      return res.status(400).json({
        message: 'Invalid distributor or already processed.',
      });
    }

    // Normalize and apply action
    const normalizedAction = action.toLowerCase();
    if (normalizedAction === 'accept') {
      distributor.approval = 'accepted';
      distributor.status = 'active';
      distributor.role = 'distributor';
      
    } else if (normalizedAction === 'reject') {
      distributor.approval = 'rejected';
      distributor.role = 'distributor';
    } else {
      return res.status(400).json({ message: 'Invalid action type.' });
    }

    await distributor.save();

    // Remove password before sending response
    const { password, ...distributorWithoutPassword } = distributor._doc;

    res.status(200).json({
      message: 'Distributor approval status updated successfully.',
      distributor: distributorWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating distributor approval:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};
const updateRejectedToAccepted = async (req, res) => {
  const { userId, action } = req.body;

  // Log input for debugging
  console.log("Updating approval for distributor:", userId);
  console.log("Action to perform:", action);

  // Validate request data
  if (!userId || !action) {
    return res.status(400).json({ message: 'Missing userId or action.' });
  }

  try {
    // Find distributor by ID
    const distributor = await Distributor.findById(userId);

    // Validate distributor existence and role
    if (
      !distributor ||
      distributor.approval !== 'rejected' ||
      !['distributor'].includes(distributor.role)
    ) {
      return res.status(400).json({
        message: 'Invalid distributor or already processed.',
      });
    }

    // Normalize and apply action
    const normalizedAction = action.toLowerCase();
    if (normalizedAction === 'accept') {
      distributor.approval = 'accepted';
      distributor.status = 'active';
    }  else {
      return res.status(400).json({ message: 'Invalid action type.' });
    }

    await distributor.save();

    // Remove password before sending response
    const { password, ...distributorWithoutPassword } = distributor._doc;

    res.status(200).json({
      message: 'Distributor approval status updated successfully.',
      distributor: distributorWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating distributor approval:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};





export { addDistributor, createDistributor, 
   getPendingDistributors, getRejectedDistributors, 
   updateDistributorApproval
  ,updateRejectedToAccepted
,createCustomer, getCustomers
,getDistributorsByApprovalStatus}