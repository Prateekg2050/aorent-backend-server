import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const sendNotification = asyncHandler(async (userId, type, title, content) => {
  await User.findOneAndUpdate(
    { _id: userId },
    {
      $push: {
        notification: {
          date: Date.now(),
          type,
          title,
          content,
        },
      },
    }
  );
});

export default sendNotification;
