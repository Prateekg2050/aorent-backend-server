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
import { notFound } from './middleware/errorMiddleware.js';
import gloabalErrorHandler from './controllers/errorController.js';

// routes import
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

connectDb();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/upload', uploadRoutes);

app.get('/config/razorpay', (req, res) =>
  res.send(process.env.RAZORPAY_CLIENT_ID)
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to AORent server');
});

// Middleware
app.use(notFound);
// app.use(errorHandler);
app.use(gloabalErrorHandler);

//PORT
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on ${PORT}`.yellow.bold
  )
);
