import User from "../model/user.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import Distributor from "../model/distributor.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const signup = async (req, res, next) => {
  console.log("Received signup request:", req.body);

  const { firstname, lastname, phoneNumber, password, role, profilePicture } =
    req.body;

  if (!firstname || !lastname || !phoneNumber || !password) {
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
      role: "guest",
      profilePicture: profilePicture || undefined,
      status: "active",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup route error:", error);
    next(error);
  }
};

const add_employee = async (req, res) => {
  try {
    const { firstname, lastname, phoneNumber, password, role, location, email } = req.body;

    const invalidRoles = ["null", "guest", "customer"];
    if (!role || invalidRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid employee role" });
    }

    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admin can add employees." });
    }

    const existing = await User.findOne({ phoneNumber });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with phone already exists" });
    }

    // Validate location only if role is production
    if (role === "production") {
      const validLocations = ["mugher", "tatek", "adama"];
      if (!location || !validLocations.includes(location)) {
        return res.status(400).json({
          message: "Production employees must have a valid location",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      phoneNumber,
      email,
      password: hashedPassword,
      role,
      isAdmin: role === "admin",
      ...(role === "production" && { location }), // Only attach if valid
    });

    await newUser.save();

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save the token and its expiry (24 hours from now)
    newUser.resetPasswordToken = hashedToken;
    newUser.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await newUser.save();

    // Send email with reset token
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4B5563;">Welcome to Cement Management System</h2>
        <p>Hello ${firstname},</p>
        <p>You have been added as an employee to the Cement Management System. To set your password, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Set Your Password
          </a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="color: #6B7280; font-size: 14px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Set Your Password - Cement Management System',
        message,
      });

      res.status(201).json({ 
        message: "Employee added and password reset email sent", 
        user: newUser 
      });
    } catch (error) {
      console.error("Error sending email:", error);
      // Still return success but with a warning about email
      res.status(201).json({ 
        message: "Employee added but failed to send password reset email", 
        user: newUser,
        warning: "Please contact the employee to set their password manually"
      });
    }
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
    let user;
    let userType = "distributor";

    // Try to find distributor first
    if (phoneNumber) {
      user = await Distributor.findOne({ phoneNumber });
    }
    // If not found in Distributor, check User
    if (!user) {
      userType = "user";
      if (phoneNumber) {
        user = await User.findOne({ phoneNumber });
      }
    }
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
      role: user.role || userType,
      location: user.location,
      isAdmin: user.isAdmin || false,
      userType,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    const { password: pass, ...userInfo } = user._doc;

    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(userInfo);
  } catch (error) {
    next(error);
  }
};


export { signup, signin, add_employee };
