import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../model/user.js';
import { parse } from 'path';


const updateUser =async (req, res,next) => {

    console.log("userId", req.params.userId); 
    console.log("req.user.id", req.user.id);
    if(req.user.id!==req.params.userId){

        return next(errorHandler(403, 'you are not allowed to update this account,you can update only your account'));

    }
    if(req.body.password){
    if ( req.body.password.length<6) {
        return next(errorHandler(400, 'password must be at least 6 characters long'));
    
    }
    req.body.password = bcrypt.hashSync(req.body.password , 10);
}

        if(req.body.username){
    if (req.body.username<5) {
        return next(errorHandler(400, 'username must be at least 5 characters long'));
    }
    
    if ( req.body.username.includes(' ')) {
        return next(errorHandler(400, 'username must not contain spaces'));
    }
    if (req.body.username!==req.body.username.toLowerCase()) {
        return next(errorHandler(400, 'username must be in lowercase'));
    }
    if(!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
        return next(errorHandler(400, 'username must contain only letters and numbers'));
    }
}
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
            $set:{
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                profilePicture: req.body.profilePicture,

            },
    }, {new: true});
    const {password, ...rest} = updatedUser._doc
    console.log("password rest", rest)
    res.status(200).json( rest);
    
}
catch (error) {
    console.log('error', error);
    next(error);
}

}
;
const deleteUser = async (req, res, next) => {  

    if(!req.user.isAdmin && req.user.id!==req.params.userId){
        return next(errorHandler(403, 'you are not allowed to delete this account,you can delete only your account'));

    }
        try {
            await User.findByIdAndDelete(req.params.userId);
            res.status(200).json('Account has been deleted successfully');
        }
        catch (error) {
            next(error);
        }
        

}
;

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

const getEmployees = async (req, res, next) => {
    const allowedRoles = ["admin", "finance", "marketing", "production", "cashier", "dispatcher"];

    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to get all users'));
    }

    try {
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        let query = User.find({ role: { $in: allowedRoles } }).sort({ createdAt: sortDirection });

        // Apply pagination only if query params exist
        if (req.query.startIndex || req.query.limit) {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 6;
            query = query.skip(startIndex).limit(limit);
        }

        const users = await query;

        const userWithoutPassword = users.map(user => {
            const { password, ...rest } = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments({ role: { $in: allowedRoles } });

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthUsers = await User.countDocuments({
            role: { $in: allowedRoles },
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            users: userWithoutPassword,
            totalUsers,
            lastMonthUsers
        });

    } catch (error) {
        next(error);
    }
};

const getCustomers = async (req, res, next) => {
    const allowedRoles = ["customer"];
    if(!req.user.isAdmin){
        return next(errorHandler(403, 'you are not allowed to get all users'));
    }
    try {
const startIndex = parseInt(req.query.startIndex) || 0;
const limit = parseInt(req.query.limit) || 9;
const sortDirection = req.query.sort ==='asc' ? 1 : -1;
 const allowedRoles = ["admin", "finance", "marketing", "production", "cashier", "dispatcher"];
const users = await User.find({ role: { $in: allowedRoles } })
.sort({createdAt: sortDirection})
.skip(startIndex)
.limit(limit);
const userWithoutPassword = users.map(user => {
    const {password, ...rest} = user._doc;
    return rest;
    }
);
const totalUsers = await User.countDocuments(); 
const now = new Date();
const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
        createdAt: {$gte: oneMonthAgo}
    });

    res.status(200).json({
        users: userWithoutPassword, totalUsers, lastMonthUsers});


    }
    catch (error) {
        next(error);
    }
};
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        const {password, ...rest} = user._doc;
        res.status(200).json(rest);
    }
    catch (error) {
        next(error);
    }
};






export {updateUser , deleteUser, signOut, getCustomers, getUser, getEmployees};

// Compare this snippet from client/src/pages/Projects/Projects.jsx:
