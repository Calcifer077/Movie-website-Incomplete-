const axios = require('axios');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { move } = require('../routes/viewRoutes');

exports.getHomePage = catchAsync(async (req, res, next) => {
  console.log('route hit');
  res.status(200).render('index', {
    title: 'moviesite',
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).render('profile', {
    title: 'Profile',
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
  res.status(200).render('recent-reviews', {
    title: 'Recent reviews',
  });
});

exports.getMoviePage = catchAsync(async (req, res, next) => {
  const imdbId = req.params.search.slice(1);
  console.log(imdbId);

  const resultMovie = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3001/api/v1/movies/search/?i=${imdbId}`,
  });

  if (resultMovie.data.status === 'success') {
    const movie = resultMovie.data.dataToBeSent;
    res.status(200).render('movie', {
      title: `Movie | ${movie.title}`,
      movie,
    });
  } else {
    res.status(200).render('movie', {
      title: 'Movie',
    });
  }
});
