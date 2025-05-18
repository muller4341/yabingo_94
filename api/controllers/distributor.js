import Distributor from "../model/distributor.js";
import bcrypt from "bcryptjs";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";
const add_distributor = async (req, res) => {
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

export default add_distributor