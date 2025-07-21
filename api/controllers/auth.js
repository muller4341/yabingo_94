import User from "../model/user.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const signup = async (req, res, next) => {
  console.log("Received signup request:", req.body);

  const { firstname, lastname, phoneNumber, password, location } = req.body;

  if (!firstname || !lastname || !phoneNumber || !password || !location) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone)
      return next(errorHandler(400, "Phone number already exists"));

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      phoneNumber,
      password: hashPassword,
      location,
      // profilePicture, isAdmin, status will use schema defaults
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id
    });
  } catch (error) {
    console.error("Signup route error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const add_employee = async (req, res) => {
  try {
    const { firstname, lastname, phoneNumber, password, location } = req.body;

    if (!req.user || !req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Only admin can add employees." });
    }

    if (!firstname || !lastname || !phoneNumber || !password || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ phoneNumber });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      phoneNumber,
      password: hashedPassword,
      location,
      // profilePicture, isAdmin, status will use schema defaults
    });

    await newUser.save();

    res.status(201).json({ 
      message: "Employee added successfully", 
      user: newUser 
    });
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const signin = async (req, res, next) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return next(errorHandler(400, "phone number and password are required"));
  }

  try {
    // Only check User model
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(errorHandler(404, "Account not found"));
    }

    // Password check
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const tokenPayload = {
      id: user._id,
      // role, location, isAdmin, status from user model
      role: user.role,
      location: user.location,
      isAdmin: user.isAdmin || false,
      status: user.status,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    const { password: pass, ...userInfo } = user._doc;

    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(userInfo);
  } catch (err) {
    next(err);
  }
};


export { signup, signin, add_employee };
