import User from "../model/user.js";
import bcrypt from "bcryptjs";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import crypto from 'crypto';


const signup = async (req, res, next) => {
    console.log("Received signup request:", req.body);

    const { firstname, lastname, email, phoneNumber, password, role, profilePicture } = req.body;

    if (!firstname || !lastname || !email || !phoneNumber || !password ) {
        return next(errorHandler(400, 'All fields are required'));
    }

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return next(errorHandler(400, 'Email already exists'));

        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) return next(errorHandler(400, 'Phone number already exists'));

        const hashPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({
            firstname,
            lastname,
            email,
            phoneNumber,
            password: hashPassword,
            role:"gust",
            profilePicture: profilePicture || undefined,
            status: "active",
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Signup route error:", error);
        next(error);
    }
};



  const add_employee = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      password,
      role,
    } = req.body;

    // Only allow certain roles
    const invalidRoles = ["null", "gust", "customer"];
    if (!role || invalidRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid employee role" });
    }

    // Check if requester is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Only admin can add employees." });
    }

    // Ensure unique email and phone
    const existing = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existing) {
      return res.status(400).json({ message: "User with email or phone already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      isAdmin: role === "admin", // only flag true if role is admin
    });

    await newUser.save();

    res.status(201).json({ message: "Employee added", user: newUser });
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({ message: "Server error" });
  }
};



  
  
// const verifyEmail = async (req, res, next) => {
//     const { token } = req.query;

//     try {
//         const user = await User.findOne({ verificationToken: token });

//         if (!user) {
//             return next(errorHandler(400, "Invalid or expired verification token"));
//         }

//         user.isVerified = true;
//         user.verificationToken = undefined;
//         await user.save();
        

//         res.status(200).json({ message: "Email verified successfully. You can now log in." });
//     } catch (error) {
//         next(error);
//     }
// };


const signin =async(req, res, next) => {
    const {email, password} = req.body;  
    if (!email || !password||email==""||password=="") {
        next(errorHandler(400, 'All fields are required'));
        return;
    }
    try {
        const user = await User.findOne({email});
        if (!user) {
            next(errorHandler(404, 'User not found'));
            return;
        }   
        // Check if the user's email is verified
       
        const validUser = bcrypt.compareSync(password, user.password);
        
        if (!validUser) {
            next(errorHandler(400, 'Invalid credentials'));
            return;
        }
        console.log('validUser =', validUser);
        console.log('user =', user);
        console.log('user._id =', user._id);
        console.log('isadmin =', user.isAdmin);
        const token = jwt.sign(  {id: user._id, role: user.role, isAdmin:user.isAdmin}, process.env.JWT_SECRET);
         const {password: pass, ...userInfo} = user._doc;    
            
        console.log( 'token =', token);
        console.log('userInfo =', userInfo);
        
        res.status(200)
        .cookie('access_token', token, {
                httpOnly: true,
                })
            .json(userInfo);





    }
    catch (error) {
        next(error);
    }


};

const google = async (req, res, next) => {
    const {name, email, googlePhotoUrl} = req.body;
    
    try {
        const user = await User.findOne({email});

        if (user) {
            const token = jwt.sign(  {id: user._id, isAdmin:user.isAdmin}, process.env.JWT_SECRET);
            const {password, ...rest} = user._doc;    
            res.status(200)
            .cookie('access_token', token, {
                httpOnly: true,
                })
                .json(rest);
        }
        else{
            const generatedPassword = Math.random().toString(36).slice(-8)
            + Math.random().toString(36).slice(-8);
            const hashPassword = bcrypt.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split('').join('') + Math.random().toString(9).slice(-4),
                email,
                password: hashPassword,
                profile: googlePhotoUrl,
            });
            const user = await newUser.save();
            const token = jwt.sign(  {id: user._id}, process.env.JWT_SECRET);
            const {password, ...rest} = user._doc;
            res.status(200).cookie('access_token', token, {
                httpOnly: true,
                })
                .json(rest);

        }
    }
    catch (error) {
        next(error);
    }
        

}


export {signup, signin , google, add_employee};

