import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../model/user.js';
import { parse } from 'path';
import mongoose from 'mongoose';


// Admin: Get all users
const getUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can access this resource.' });
    }
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Update updateUser and deleteUser to allow admin to update/delete any user
const updateUser = async (req, res) => {
  try {
    const { firstname, lastname, phoneNumber, location, status } = req.body;
    const userId = req.params.userId;

    // Only admin or the user themselves can update
    if (!req.user.isAdmin && req.user.id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to update this account.' });
    }

    // Validate input
    if (!firstname || !lastname || !phoneNumber || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if phone number is already taken by another user
    const existingUser = await User.findOne({ phoneNumber, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Build update object
    const updateObj = { firstname, lastname, phoneNumber, location };
    if (req.user.isAdmin && status) {
      updateObj.status = status;
    }
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateObj,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in updateUser controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'you are not allowed to delete this account,you can delete only your account'));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json('Account has been deleted successfully');
  } catch (error) {
    next(error);
  }
};


const signOut = ( req, res, next) => {
      try {
        res.clearCookie('token')
        res.status(200)
        .json('user signed out successfully');                                  
       }
         catch (error) {
              next(error);
         }
};


const getUser = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const {password, ...rest} = user._doc;
        res.status(200).json(rest);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};






export { updateUser, deleteUser, signOut, getUser, getUsers };

// Compare this snippet from client/src/pages/Projects/Projects.jsx:
