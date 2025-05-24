import User from "../model/user.js";
import bcrypt from "bcryptjs";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";
import Distributor from "../model/distributor.js";
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


// const signin =async(req, res, next) => {
//     const {email, password} = req.body;  
//     if (!email || !password||email==""||password=="") {
//         next(errorHandler(400, 'All fields are required'));
//         return;
//     }
//     try {
//         const user = await User.findOne({email});
//         if (!user) {
//             next(errorHandler(404, 'User not found'));
//             return;
//         }   
//         // Check if the user's email is verified
       
//         const validUser = bcrypt.compareSync(password, user.password);
        
//         if (!validUser) {
//             next(errorHandler(400, 'Invalid credentials'));
//             return;
//         }
//         console.log('validUser =', validUser);
//         console.log('user =', user);
//         console.log('user._id =', user._id);
//         console.log('isadmin =', user.isAdmin);
//         const token = jwt.sign(  {id: user._id, role: user.role, isAdmin:user.isAdmin}, process.env.JWT_SECRET);
//          const {password: pass, ...userInfo} = user._doc;    
            
//         console.log( 'token =', token);
//         console.log('userInfo =', userInfo);
        
//         res.status(200)
//         .cookie('access_token', token, {
//                 httpOnly: true,
//                 })
//             .json(userInfo);





//     }
//     catch (error) {
//         next(error);
//     }


// };

const signin = async (req, res, next) => {
    const { email,phoneNumber, password } = req.body;

     if ((!email && !phoneNumber) || !password) {
    return next(errorHandler(400, 'Email or phone number and password are required'));
  }

    try {
        let user;
    let userType = 'distributor';

    // Try to find distributor first
    if (email) {
      user = await Distributor.findOne({ email });
    } else if (phoneNumber) {
      user = await Distributor.findOne({ phoneNumber });
    }
// If not found in Distributor, check User
    if (!user) {
      userType = 'user';
      if (email) {
        user = await User.findOne({ email });
      } else if (phoneNumber) {
        user = await User.findOne({ phoneNumber });
      }
    }
        if (!user) {
            return next(errorHandler(404, 'Account not found'));
        }

        // Password check
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid credentials'));
    }

        // Token payload
    const tokenPayload = {
      id: user._id,
      role: user.role || userType,
      isAdmin: user.isAdmin || false,
      userType,
    };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

        const { password: pass, ...userInfo } = user._doc;

        res
            .status(200)
            .cookie('access_token', token, { httpOnly: true })
            .json(userInfo);
    } catch (error) {
        next(error);
    }
};


export {signup, signin, add_employee};

