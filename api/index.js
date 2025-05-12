
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import userRouter from './routes/userRouter.js';
import auth from './routes/auth.js';
import cookieParser from 'cookie-parser';
import postRoute from './routes/postRoute.js';
import comment from './routes/comment.Route.js';
import media from './routes/media.js';
import complatedUsers from './routes/complatedUsers.js';

const app = express();
app.use(cors());

dotenv.config();


//mongoose connection

mongoose.connect(process.env.MONGO_URL)
.then (() => {
    console.log('Database connected');
})
.catch((err) => {
    console.log(err);
});
const __dirname = path.resolve();
//middleware
app.use(express.json());
app.use(cookieParser());
app.use('/api/user', userRouter);
app.use('/api/media', media);
app.use('/api/auth', auth);
app.use('/api/post', postRoute);
app.use('/api/comment', comment);
app.use('/api/admin', complatedUsers);
app.use(express.static(path.join(__dirname, '/client/dist')));
app.get('*', (
    req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
    }

);
app.listen(process.env.PORT,'0.0.0.0', () => {
    console.log(`Server is running on port ` + process.env.PORT);
    }
);


// creation of middleware 
app.use((error, req, res, next) => {

    const statusCode = error.statusCode || 500;
    const message = error.message|| 'internal server error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })


});



