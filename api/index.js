import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import userRouter from './routes/userRouter.js';
import distributor from './routes/distributor.js';
import auth from './routes/auth.js';
import cookieParser from 'cookie-parser';
import notification from './routes/notification.js';
import Product from './routes/product.js';
import Price from './routes/price.js';
import Order from './routes/order.js' ;
import driverRouter from './routes/driver.js';
import carRouter from './routes/car.js';
 
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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/user', userRouter);
app.use('/api/distributor', distributor);
app.use('/api/auth', auth);
app.use('/api/notification',  notification)
app.use ('/api/product', Product)
app.use('/api/price', Price)
app.use('/api/order', Order);
  app.use('/api/driver', driverRouter);
  app.use('/api/car', carRouter);
// Serve /results statically for file downloads
app.use('/results', express.static(path.join(__dirname, 'results')));
app.use((error, req, res, next) => {
    console.error("Error Handler:", error.stack || error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({
      success: false,
      statusCode,
      message
    });
  });
app.use(express.static(path.join(__dirname, '/client/dist')));
app.get('*', (
    req, res) => {
    if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
    }

);
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});




