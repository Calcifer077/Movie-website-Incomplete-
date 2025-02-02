const Review = require('../models/reviewModel');
const User = require('../models/userModel');
// const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = factory.getAll(Review);
// exports.getReview = factory.getOne(Review);
// exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
// exports.deleteReview = factory.deleteOne(Review);

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

  // The above query is executed here. Here, Mongoose sends the query to MongoDb, reterives the result and assign the values to 'reviews'.
  const reviews = await query
    .populate({
      path: 'movie',
      select: 'title -_id',
    })
    .populate({
      path: 'user',
      select: 'name email -_id',
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
  const movieId = req.body.movie || req.cookies.movie;
  const userId = req.body.user || req.user._id;

  // console.log(userId);

  // console.log(movieId, userId);

  // Here, we are checking if a review already exists for a particular combination of 'user' and 'movie'.
  const reviewIfAlreadyExists = await Review.findOne({
    user: userId,
    movie: movieId,
  });

  // If the both reviews are same.
  // We are using 'JSON.stringify' here because it is a non-primitive data type and you can't directly compare them.
  // If you tried to do 'reviewByMovieId === reviewByUserId', it will check if the point to the same address in the memory which will not be the case.
  // if (
  //   JSON.stringify(reviewByMovieId) === JSON.stringify(reviewByUserId) &&
  //   reviewByMovieId != null
  // ) {
  //   // If above is the case don't update and return from this point only.
  //   res.status(400).json({
  //     status: 'error',
  //     message: 'You have already created a review for this movie',
  //   });

  //   return next();
  // }

  if (reviewIfAlreadyExists) {
    res.status(400).json({
      status: 'error',
      message: 'You have already created a review for this move',
    });

    return next();
  }

  const newReviewBody = {
    movie: movieId,
    user: userId,
    ...req.body,
  };

  // Create a new review from the body recieved in 'req.body'
  const newReview = await Review.create(newReviewBody);

  // Find the user that created the review so that we can update the user also.
  const user = await User.findById(newReview.user);

  // Creating a updated user body.
  // Doing it the below way because there can be already an review created by user and you don't want to delete that.
  const updatedUserBody = {
    reviews: [...user.reviews, newReview._id],
  };

  // Update user
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

exports.createReviewLikesAndDislikes = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  const userId = req.user._id;
  const reviewId = req.body.reviewId;
  const type = req.body.type;

  const review = await Review.findById(reviewId);
  const user = await User.findById(userId);

  // Check if review and user exist
  if (!review || !user) {
    return res.status(404).json({
      status: 'error',
      message: 'Review or User not found',
    });
  }

  let updatedReview;
  let updatedUser;

  // Function to update review and user
  const updateReviewAndUser = async (
    likes,
    dislikes,
    likedReviews,
    dislikedReviews,
  ) => {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { likes, dislikes },
      { new: true, runValidators: true },
    );

    updatedUser = await User.findByIdAndUpdate(
      userId,
      { likedReviews, dislikedReviews },
      { new: true, runValidators: true },
    );
  };

  if (type === 'like') {
    // If a user have already liked a review and still trying to like it send error.
    if (review.likes.includes(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already liked this review',
      });
    }

    // Spreading already existing likes and adding new one in it.
    const likes = [...review.likes, userId];

    // Removing likes from dislikes.
    const dislikes = review.dislikes.filter((id) => {
      id !== userId;
    });
    const likedReviews = [...user.likedReviews, reviewId];
    const dislikedReviews = user.dislikedReviews.filter((id) => {
      id !== reviewId;
    });

    await updateReviewAndUser(likes, dislikes, likedReviews, dislikedReviews);
  } else if (type === 'dislike') {
    if (review.dislikes.includes(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already disliked this review',
      });
    }

    const likes = review.likes.filter((id) => {
      id !== userId;
    });
    const dislikes = [...review.dislikes, userId];
    const dislikedReviews = [...user.dislikedReviews, reviewId];
    const likedReviews = user.likedReviews.filter((id) => {
      id !== reviewId;
    });

    await updateReviewAndUser(likes, dislikes, likedReviews, dislikedReviews);
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid type. Must be "like" or "dislike".',
    });
  }

  res.status(200).json({
    status: 'success',
    updatedReview,
    updatedUser,
  });

  // res.status(200).json({
  //   status: 'success',
  //   data: null,
  // });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const toBeDeletedReview = await Review.findById(req.params.id);

  if (!toBeDeletedReview) {
    return next(new AppError('No document found with that ID', 404));
  }

  // If we are deleting a review then we also need to update user details of the user who created that review and also the details of user who have liked or disliked that review.

  // First find that user.
  const userToBeUpdated = await User.findOne({ reviews: req.params.id });
  // console.log(userToBeUpdated);

  // console.log(userToBeUpdated._id.toString());
  // console.log(req.user._id);

  // console.log(userToBeUpdated._id.equals(req.user._id));
  if (!userToBeUpdated._id.equals(req.user._id)) {
    return next(new AppError('You are not authorized to do this action', 404));
  }

  // Update his reviews
  userToBeUpdated.reviews = userToBeUpdated.reviews.filter(
    (review) => review.toString() !== req.params.id,
  );

  // Update his liked reviews
  userToBeUpdated.likedReivews = userToBeUpdated.likedReviews.filter(
    (likedReviews) => likedReviews.toString() !== req.params.id,
  );

  // Update his disliked reviews
  userToBeUpdated.dislikedReviews = userToBeUpdated.dislikedReviews.filter(
    (dislikedReivews) => dislikedReivews.toString() !== req.params.id,
  );

  // Save that user to database.
  await userToBeUpdated.save({ validateBeforeSave: false });
  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
