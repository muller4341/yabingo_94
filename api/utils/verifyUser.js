import jwt from 'jsonwebtoken';
import User from '../model/user.js'; // Make sure to import your User model
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

        // Fetch complete user from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return next(errorHandler(404, "User not found", 'User not found'));
        }

        // Attach full user object to request
        req.user = {
            _id: user._id,
           location:user.location,
            role: user.role,
            // Add any other user properties you need
            ...decoded // Include any additional claims from the token
        };

        console.log('req.user after attachment:', req.user);
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        return next(errorHandler(401, 'Invalid token', 'Unauthorized'));
    }
};

export default verifyUser;