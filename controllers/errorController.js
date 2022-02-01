import AppError from '../utils/appError.js';

const handleCastErrorDB = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
};

const handleDuplicatFieldDB = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(
    `Duplicate field value : ${value}. Please use another value`,
    400
  );
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token.Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please login again ', 401);

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, res) => {
  // Operational , trusted error : send message to the client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // Programming or other unknown error : don't leak error details
  } else {
    // 1) Log error
    console.error(error);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

export default (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    let err = { ...error };

    if (error.name == 'CastError') err = handleCastErrorDB(error);
    if (error.code == 11000) err = handleDuplicatFieldDB(error);
    if (error.name == 'ValidationError') err = handleValidationErrorDB(error);
    if (error.name == 'JsonWebTokenError') err = handleJWTError();
    if (error.name == 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorProd(err, res);
  }
};
