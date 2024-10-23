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
  const user = await User.findById(req.params.id).populate({
    path: 'friends',
    select: 'name',
  });

  if (!user) {
    return next(new AppError('No user found with that ID'), 404);
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.createFriends = catchAsync(async (req, res, next) => {});
