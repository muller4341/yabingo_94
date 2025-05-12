import jwt from 'jsonwebtoken';
//import { User } from '../../models';
import { errorHandler } from './error.js';

const verifyUser = async (req, res, next) => {
    console.log('cookies:', req.cookies);
    const token = req.cookies.access_token
    console .log('token of verifyUser', token);
    if (!token) {
        return next(errorHandler(401,"this does not get the token" ,'Unauthorized man'));
    }

    jwt.verify(token, process.env.JWT_SECRET,  (err, user) => {
        if (err) {
            return next(errorHandler(401, 'Unauthorized '));
        }
        req.user = user

        console.log('req.user:', req.user);
        console.log('req.user.isAdmin:', req.user.isAdmin);
        next();
    

    }
    );
   
}

export default verifyUser;

