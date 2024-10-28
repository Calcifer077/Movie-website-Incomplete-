const axios = require('axios');

const Movie = require('../models/movieModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { move } = require('../routes/viewRoutes');

exports.getHomePage = catchAsync(async (req, res, next) => {
  console.log('route hit');
  res.status(200).render('index', {
    title: 'moviesite',
  });
});

// To get movies data
const getMoviesData = async (movies) => {
  return await Movie.findById(movies.movie);
};

async function getDataForProfilePage(id) {
  const user = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3001/api/v1/users/${id}`,
  });

  // The below statement is used so that we can use async inside map method.
  // 'Promise.all' takes some promises and returns a single promise, which we are awaiting for result which will be the final result.
  const movies = await Promise.all(
    user.data.data.reviews.map(async (el) => getMoviesData(el)),
  );

  const finalUser = {
    user: user.data.data,
    movies: movies,
    reviews: user.data.data.reviews,
  };

  return finalUser;
}

exports.getProfile = catchAsync(async (req, res, next) => {
  const id = req.cookies.user;
  const user = await getDataForProfilePage(id);

  res.status(200).render('profile', {
    title: 'Profile',
    user: user,
  });
});

exports.getReviewPage = catchAsync(async (req, res, next) => {
  res.status(200).render('log-new-review', {
    title: 'Log new review',
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  res.status(200).render('sign-up', {
    title: 'Sign up',
  });
});

exports.signUpWithEmail = catchAsync(async (req, res, next) => {
  res.status(200).render('sign-up-email', {
    title: 'Sign up with your email',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

exports.getTopMoviesPage = catchAsync(async (req, res, next) => {
  res.status(200).render('top-movies', {
    title: 'Top movies',
  });
});

exports.getRecentReviewsPage = catchAsync(async (req, res, next) => {
  const id = req.cookies.user;
  const user = await getDataForProfilePage(id);

  res.status(200).render('recent-reviews', {
    title: 'Recent reviews',
    user: user,
  });
});

exports.getMoviePage = catchAsync(async (req, res, next) => {
  const imdbId = req.params.search.slice(1);

  const resultMovie = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3001/api/v1/movies/search/?i=${imdbId}`,
  });

  // console.log(resultMovie.data.dataToBeSent.imdbId);

  const movie = await Movie.findOne({
    imdbId: resultMovie.data.dataToBeSent.imdbId,
  });

  const resultReviews = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3001/api/v1/movies/${movie._id}/reviews`,
  });

  // console.log(resultReviews.data.data.review);
  console.log(resultReviews.data.data.reviews);

  if (resultMovie.data.status === 'success') {
    const movie = resultMovie.data.dataToBeSent;
    res.status(200).render('movie', {
      title: `Movie | ${movie.title}`,
      reviews: resultReviews.data.data.reviews,
      movie,
    });
  } else {
    res.status(200).render('movie', {
      title: 'Movie',
    });
  }
});
