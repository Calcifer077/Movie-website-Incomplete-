const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllUsers = factory.getAll(User);
// exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getAllUsers = catchAsync(async (req, res) => {
  // Don't include friends array
  const users = await User.find().select('-friends');

  if (!users) {
    return next(new AppError('No user found'), 404);
  }

  res.status(200).json({
    status: 'success',
    length: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'friends',
      select: 'name',
    })
    .populate({
      path: 'reviews',
    });

  if (!user) {
    return next(new AppError('No user found with that ID'), 404);
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// How the below function will work:
// Will get current user id in the req.body
// Will get to be friend email. As its id will not be available on the frontend, we will search for it in the database.
exports.createFriends = catchAsync(async (req, res, next) => {
  const userId = req.body.user;
  const toBeFriendEmail = req.body.friendEmail;

  // Check if both are same user meaning that a user tries to friend himself.
  const user = await User.findById(userId);

  const toBeFriend = await User.findOne({
    email: toBeFriendEmail,
  });

  if (!user || !toBeFriend) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (JSON.stringify(user) === JSON.stringify(toBeFriend)) {
    res.status(400).json({
      status: 'error',
      message: `You can't add yourself as your friend`,
    });
  }

  // Check if you are already friend with that user.
  let alreadyFriend = false;

  user.friends.forEach((friend) => {
    if (String(friend) === String(toBeFriend._id)) {
      alreadyFriend = true;
    }
  });

  if (alreadyFriend) {
    return next(new AppError('You are already friend with this user', 404));
  }

  const updatedUser = {
    friends: [...user.friends, toBeFriend._id],
  };

  const updatedFriend = {
    friends: [...toBeFriend.friends, userId],
  };

  await User.findByIdAndUpdate(userId, updatedUser);
  await User.findByIdAndUpdate(toBeFriend._id, updatedFriend);

  res.status(200).json({
    status: 'success',
  });
});
