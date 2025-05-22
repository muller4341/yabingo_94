import Distributor from "../model/distributor.js";
import User from "../model/user.js";
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
    if (!req.user || !['gust', 'customer'].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Only gust or customer role can create distributor accounts.",
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


const getDistributors = async (req, res, next) => {
    const allowedRoles = ["distributor"];

    if (!req.user || (req.user.role !== "marketing" && req.user.role !== "admin")) {
        return next(errorHandler(403, 'You are not allowed to get all users'));
    }

    try {
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        let query = Distributor.find({ role: { $in: allowedRoles } }).sort({ createdAt: sortDirection });

        // Apply pagination only if query params exist
        if (req.query.startIndex || req.query.limit) {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 6;
            query = query.skip(startIndex).limit(limit);
        }

        const distributors = await query;

        const  distributorWithoutPassword =  distributors.map( distributor => {
            const { password, ...rest } =  distributor._doc;
            return rest;
        });

        const totalDistributors = await Distributor.countDocuments({ role: { $in: allowedRoles } });

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthDistributors = await Distributor.countDocuments({
            role: { $in: allowedRoles },
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            distributors:  distributorWithoutPassword,
            totalDistributors,
            lastMonthDistributors
        });

    } catch (error) {
        next(error);
    }
};
const migrateDistributorsFromUsers = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "marketing")) {
      return next(errorHandler(403, "You are not allowed to perform this operation"));
    }

    const distributorUsers = await User.find({ role: "distributor" });

    let migratedCount = 0;

    for (const user of distributorUsers) {
      const alreadyExists = await Distributor.findOne({ phoneNumber: user.phoneNumber });

      if (!alreadyExists) {
        await Distributor.create({
          phoneNumber: user.phoneNumber,
          password: user.password, // Make sure this is hashed already in User model
          tinnumber: user.tinnumber || "",
          companyname: user.companyname || "",
          merchantId: user.merchantId || "",
          licensenumber: user.licensenumber || "",
          licenseexipiration: user.licenseexipiration || "",
          region: user.region || "",
          zone: user.zone || "",
          profilePicture: user.profilePicture || "/images/pp.png",
          role: "distributor",
          status: user.status || "active",
          url: "https://default.url/from-migration", // Required field, replace with something meaningful
          approval: "pending", // default state
        });

        migratedCount++;
      }
    }

    res.status(200).json({
      message: `${migratedCount} users migrated to distributors successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export { addDistributor, getDistributors, createDistributor, migrateDistributorsFromUsers}