import jwt from 'jsonwebtoken';
import User from '../model/user.js'; 
import { errorHandler } from './error.js';

const verifyUser = async (req, res, next) => {
  console.log('cookies:', req.cookies);
  const token = req.cookies.access_token;
  console.log('token of verifyUser', token);

  if (!token) {
    return next(errorHandler(401, "Token not found", 'Unauthorized'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Try to find distributor first
    let user = await Distributor.findById(decoded.id).select('-password');

    let userType = "distributor";

    // If not found in distributor, try User
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
      userType = "user";
    }

    if (!user) {
      return next(errorHandler(404, "User not found", 'User not found'));
    }

    req.user = {
      _id: user._id,
      location: user.location,
      role: user.role,
      userType,          // add userType from which model found
      ...decoded         // include any other token claims
    };

    console.log('req.user after attachment:', req.user);
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return next(errorHandler(401, 'Invalid token', 'Unauthorized'));
  }
};

export default verifyUser;
