// packages imports
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// dev dependencies
import colors from 'colors';
import morgan from 'morgan';

// database imports
import connectDb from './config/db.js';

// middleware imports
import gloabalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';

// routes import
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

connectDb();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.get('/config/razorpay', (req, res) =>
  res.send(process.env.RAZORPAY_CLIENT_ID)
);

app.get('/', (req, res) => {
  res.send(`Welcome to AORent ${process.env.NODE_ENV} server`);
});

// Not Found Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Gloabal Error Handler
app.use(gloabalErrorHandler);

//PORT
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in`.yellow,
    `${process.env.NODE_ENV}`.red.bold,
    `mode on ${PORT}`.yellow
  )
);

process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
