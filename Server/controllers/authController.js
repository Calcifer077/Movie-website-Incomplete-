const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // 1. create token
  const token = signToken(user._id);

  // 2. create cookies and sent them using res
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, // only in production
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOption);
  res.cookie('user', user._id, cookieOption);

  // 3. Reset the user password to undefined for security
  user.password = undefined;

  // 4. Send the token with the user data
  res.status(statusCode).json({
    message: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // 1. Get data from the body and create user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // console.log(newUser);

  // 2. Create a token for the user and send it.
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });

  // console.log(token);

  // res.status(200).json({
  //   status: 'success',
  //   data: newUser,
  // });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // 1. Get required fields from body
  const email = req.body.email;
  const password = req.body.password;

  // 2. Check if both email and password are present in the body
  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 404));
  }

  // 3. Find the user using this email
  const user = await User.findOne({ email }).select('+password');

  // 4. Check if the user exists and it it does check if the password is correct.
  if (!user || !(await user.correctPassword(password, user.password))) {
    // 401 -> unauthorized
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 5. Create a token and send it.
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  // 1. Just reset the cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  // 2. Send response
  res.status(200).json({
    message: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // How you will get token. Get it form req.headers.
  // 2. Check if the token is present. If the token is not present it means the user is not logged in.
  if (!token) {
    return next(new AppError('You are not logged in. Please log in.'), 404);
  }

  // console.log(token);

  // 3.Validate token(Verification) do it with the help of 'jwt.verify'
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  // this 'decoded' will have the following properties. user_id, jwt token issued at timestamp and jwt token expiration time stamp.

  const currentUser = await User.findById(decoded.id);
  // 4. Check if the user still exists
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist'),
      401,
    );
  }

  // 5. Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password.', 401));
  }
  // 6. Grant access to protected routes
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1. Get token and check if its there
  // 2.
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // If the roles of the currently logged in user contains the role mentioned in the argument passed to the function grant access.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to access this cotent'),
        404,
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on POSTed email
  const email = req.body.email;

  const user = await User.findOne({ email: email });

  // 2. Check it this user exits
  if (!user) {
    return next(new AppError('Incorrect email'), 404);
  }
  // 3. Create a random token and save that user without running any validators

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 4. Send reset token to the user's email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Send a patch request to the following url: ${resetUrl}. If you think this is a mistake please ignore this.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Forgot password',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    console.log(err);

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('An unexpected error occured while sending you the email'),
      500,
    );
  }

  res.status(200).json({
    message: 'success',
    data: 'successfully sent the email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on token
  console.log(req.params.token);

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has expired and user no longer exits send error
  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 404);
  }

  console.log(user);
  console.log(hashedToken);
  // 3. If token has not expired and user exists set the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 4. Update changedPasswordAt and reset token
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 5. Create and send a new token
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from collection
  const user = await User.findById(req.params.id).select('+password');

  // 2. Check of POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect password'), 401);
  }

  // 3. If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4. Create and send a new token
  createSendToken(user, 200, res);
});
