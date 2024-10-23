const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = factory.getAll(Review);
// exports.getReview = factory.getOne(Review);
// exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

exports.getAllReviews = catchAsync(async (req, res) => {
  // If there is 'moviesId' in the parameters go to another function
  if (req.params.movieId) {
    return getReviewsForAMovie(req, res);
  }

  // If there is 'userId' in the parameters go to another function
  if (req.params.userId) {
    return getAllReviewsForUser(req, res);
  }

  const reviews = await Review.find();

  if (!reviews) {
    return next(new AppError('No review found!'), 404);
  }

  res.status(200).json({
    status: 'success',
    length: reviews.length,
    data: { reviews },
  });
});

exports.getReview = catchAsync(async (req, res) => {
  // Below we are populating. Meaning that get data from different collections only using the objectId.
  // In the below case, we have written 'user' and 'movie' in 'reviewModel' which are a type of objectId and take reference from their respective models which we have written in path.
  // Here, we are populating them. The second argument is telling only which fields to include.
  const reviews = await Review.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name -_id',
    })
    .populate({
      path: 'movie',
      select: 'title -_id',
    });

  if (!reviews) {
    return next(new AppError('No reviews found!'), 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

const filterQuery = function (query) {
  const queryObj = { ...query };
  let queryStr = JSON.stringify(queryObj);

  // Here, we are updating the queryStr in such a way that mongoose can work on it.
  // We are basically adding '$' in front of it. gt -> $gt
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  return queryStr;
};

const getReviewsForAMovie = catchAsync(async (req, res) => {
  // Getting 'movieId' from 'req.params'
  // On the right hand side of the equation, 'movie' is a field in the model which is a must for this to work.
  let filteredMovieId = { movie: req.params.movieId };

  const queryStr = filterQuery(req.query);

  // Making a combined query.
  // Will look something like this:
  // { movie: 'filteredMovieId', rating: { '$gte': '4' } }
  const combinedQuery = { ...filteredMovieId, ...JSON.parse(queryStr) };

  // Here, you are not executing the query. You are creating a query object. Mongoose query are not executed until you use 'then' or 'await'
  let query = Review.find(combinedQuery);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('rating');
  }

  console.log(query);

  // The above query is executed here. Here, Mongoose sends the query to MongoDb, reterives the result and assign the values to 'reviews'.
  const reviews = await query.populate({
    path: 'movie',
    select: 'title -_id',
  });

  if (!reviews) {
    return next(new AppError('No reviews found'), 404);
  }

  res.status(200).json({
    status: 'success',
    length: reviews.length,
    data: {
      reviews,
    },
  });
});

const getAllReviewsForUser = catchAsync(async (req, res) => {
  let filteredUserId = { user: req.params.userId };

  const queryStr = filterQuery(req.query);

  const combinedQuery = { ...filteredUserId, ...JSON.parse(queryStr) };

  let query = Review.find(combinedQuery);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('rating');
  }

  const reviews = await query.populate({
    path: 'user',
    select: 'name -_id',
  });

  res.status(200).json({
    status: 'success',
    length: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const reviewByMovieId = await Review.findOne({
    movie: req.body.movie,
  });

  const reviewByUserId = await Review.findOne({
    user: req.body.user,
  });

  if (
    JSON.stringify(reviewByMovieId) === JSON.stringify(reviewByUserId) &&
    reviewByMovieId != null
  ) {
    res.status(400).json({
      status: 'error',
      message: 'You have already created a review for this movie',
    });
  }

  const newReview = await Review.create(req.body);

  const user = await User.findById(newReview.user);

  const updatedUserBody = {
    reviews: [...user.reviews, newReview._id],
  };

  await User.findByIdAndUpdate(newReview.user, updatedUserBody);

  if (!newReview) {
    return next(
      new AppError('Something went wrong while creating a new review', 404),
    );
  }

  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});
