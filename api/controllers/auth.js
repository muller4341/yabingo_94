import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import crypto from 'crypto';


const signup = async (req, res, next) => {
    const { firstname, lastname, email, phoneNumber, password } = req.body;

    if (!firstname || !lastname || !email || !phoneNumber || !password) {
        return next(errorHandler(400, 'All fields are required'));
    }
    if (password.length < 6) {
        return next(errorHandler(400, 'Password must be at least 6 characters long'));
    }

    try {
        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return next(errorHandler(400, 'Email is already registered'));
        }

        // Check if the phone number already exists
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return next(errorHandler(400, 'Phone number is already registered'));
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        const verificationToken = crypto.randomBytes(32).toString("hex"); // Generate token

        const newUser = new User({ 
            firstname, 
            lastname, 
            email, 
            phoneNumber,
             password: hashPassword,
             verificationToken });

        await newUser.save();
        
         // Send verification email
         const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email provider
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });
        const verificationUrl = `${process.env.BASE_URL}/verifyemail?token=${verificationToken}`;
 // Adjust URL accordingly for production

        await transporter.sendMail({
            from: '"treasur hunt" <mulerwalle@gmail.com>',
            to: email,
            subject: "Email Verification",
            html: `<html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                      <h2 style="color: #FF00FF;">Welcome to  treasur hunt!</h2>
                      <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
                      <p><a href="${verificationUrl}" style="background-color: #FF00FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                      <p>If you did not sign up for this account, you can ignore this email.</p>
                    </body>
                  </html>`
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully, verification email sent."
        });

    } catch (error) {
        next(error);
    }
};
const verifyEmail = async (req, res, next) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return next(errorHandler(400, "Invalid or expired verification token"));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        

        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        next(error);
    }
};


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
        if (!user.isVerified) {
            return next(errorHandler(400, 'Please verify your email before logging in.'));
        }
        const validUser = bcrypt.compareSync(password, user.password);
        
        if (!validUser) {
            next(errorHandler(400, 'Invalid credentials'));
            return;
        }
        console.log('validUser =', validUser);
        console.log('user =', user);
        console.log('user._id =', user._id);
        console.log('isadmin =', user.isAdmin);
        const token = jwt.sign(  {id: user._id, isAdmin:user.isAdmin}, process.env.JWT_SECRET);
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


export {signup, signin , google, verifyEmail};

