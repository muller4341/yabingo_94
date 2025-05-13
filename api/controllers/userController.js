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

const getUsers = async (req, res, next) => {
    if(!req.user.isAdmin){
        return next(errorHandler(403, 'you are not allowed to get all users'));
    }
    try {
const startIndex = parseInt(req.query.startIndex) || 0;
const limit = parseInt(req.query.limit) || 9;
const sortDirection = req.query.sort ==='asc' ? 1 : -1;
const users = await User.find()
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


const saveLuckyNumber = async (req, res, next) => {
    const { userId } = req.body;

    if (!userId) {
        return next(errorHandler(400, 'Missing required field: userId'));
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        // If user already has a lucky number, just return it
        if (user.luckyNumber) {
            return res.status(200).json({
                success: true,
                message: 'Lucky number already exists for user.',
                userData: {
                    fullName: `${user.firstname} ${user.lastname}`,
                    phoneNumber: user.phoneNumber,
                    luckyNumber: user.luckyNumber,
                },
            });
        }

        let uniqueLuckyNumber;
        let maxAttempts = 10;
        let attempts = 0;

        // Try to generate a unique lucky number
        while (attempts < maxAttempts) {
            const generated = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit number
            const exists = await User.findOne({ luckyNumber: generated });
            if (!exists) {
                uniqueLuckyNumber = generated;
                break;
            }
            attempts++;
        }

        if (!uniqueLuckyNumber) {
            return next(errorHandler(500, 'Failed to generate a unique lucky number. Please try again.'));
        }

        // Save the lucky number to user
        user.luckyNumber = uniqueLuckyNumber;
        await user.save();

        const { password, ...rest } = user._doc;
        res.status(200).json({
            success: true,
            message: 'Lucky number generated and saved successfully!',
            userData: {
                fullName: `${user.firstname} ${user.lastname}`,
                phoneNumber: user.phoneNumber,
                luckyNumber: user.luckyNumber,
            },
        });
    } catch (error) {
        console.error('Error saving lucky number:', error);
        next(error);
    }
};



export {updateUser , deleteUser, signOut, getUsers, getUser, saveLuckyNumber};

// Compare this snippet from client/src/pages/Projects/Projects.jsx:
