const axios = require('axios');

const Movie = require('../models/movieModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { move } = require('../routes/viewRoutes');

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

exports.getHomePage = catchAsync(async (req, res, next) => {
  const id = req.cookies.user;

  if (id !== 'j:null') {
    const data = await getDataForProfilePage(id);

    res.status(200).render('index', {
      title: 'moviesite',
      id,
      data,
    });

    return next;
  }
  const user = null;

  res.status(200).render('index', {
    title: 'moviesite',
    user,
  });
});

// To get movies data
const getMoviesData = async (movies) => {
  return await Movie.findById(movies.movie);
};

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

  if (id === 'j:null') {
    res.status(200).render('sign-up', {
      title: 'Sign up',
    });
  }
  const user = await getDataForProfilePage(id);

  res.status(200).render('recent-reviews', {
    title: 'Recent reviews',
    user: user,
  });
});

exports.getMoviePage = catchAsync(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, // only in production
    httpOnly: true,
  };

  res.cookie('movie', null);

  const imdbId = req.params.search.slice(1);

  // Below call is used to get data about a particular movie based on its imdb title.
  const resultMovie = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3001/api/v1/movies/search/?i=${imdbId}`,
  });

  if (resultMovie.data.status === 'success') {
    const movie = resultMovie.data.movieIfPresent;
    // console.log(movie);
    // Below call gets data about routes for a particular movie.
    const resultReviews = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3001/api/v1/movies/${movie._id}/reviews`,
    });

    // Setting cookie of the current movie.
    res.cookie('movie', movie._id, cookieOption);

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
