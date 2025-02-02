const axios = require('axios');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Movie = require('../models/movieModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const { move } = require('../routes/viewRoutes');
const { decode } = require('punycode');

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
  if (req.cookies.jwt) {
    res.status(200).render('index', {
      title: 'moviesite',
      user: 'user',
    });
    return next;
  } else {
    res.status(200).render('index', {
      title: 'moviesite',
      user: null,
    });
  }
});

// To get movies data
const getMoviesData = async (movies) => {
  return await Movie.findById(movies.movie);
};

exports.getProfile = catchAsync(async (req, res, next) => {
  if (req.user) {
    const user = await getDataForProfilePage(req.user._id);

    res.status(200).render('profile', {
      title: 'Profile',
      user: user,
    });
  } else {
    res.status(200).render('sign-up', {
      title: 'Sign up',
    });
  }
});

exports.getReviewPage = catchAsync(async (req, res, next) => {
  if (req.user) {
    res.status(200).render('log-new-review', {
      title: 'Log new review',
    });
  } else {
    res.status(200).render('sign-up', {
      title: 'Sign up',
    });
  }
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
  if (req.user) {
    const user = await getDataForProfilePage(req.user._id);

    res.status(200).render('recent-reviews', {
      title: 'Recent reviews',
      user: user,
    });
  } else {
    res.redirect('/sign-up');
  }
});

async function specialControllerForMoviesPage(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return false;
    // return next(new AppError('You are not logged in. Please log in.', 404));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return false;
    // return next(
    //   new AppError('The user belonging to this token no longer exist.'),
    //   401,
    // );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return false;
    // return next(new AppError('User recently changed password.', 401));
  }
  // 6. Grant access to protected routes
  return true;
}

exports.getMoviePage = catchAsync(async (req, res, next) => {
  const isUserPrsent = specialControllerForMoviesPage(req, res, next);

  if (isUserPrsent) {
    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      // secure: true, // only in production
      httpOnly: true,
    };

    const imdbId = req.params.search.slice(1);

    // Below call is used to get data about a particular movie based on its imdb title.

    // console.log(req.headers, 'something');
    const resultMovie = await axios({
      method: 'GET',
      url: `http://localhost:3001/api/v1/movies/search/?i=${imdbId}`,
      headers: req.headers,
    });

    if (resultMovie.data.status === 'success') {
      const movie = resultMovie.data.movieIfPresent;
      // console.log(movie);
      // Below call gets data about routes for a particular movie.
      const resultReviews = await axios({
        method: 'GET',
        url: `http://localhost:3001/api/v1/movies/${movie._id}/reviews`,
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
  } else {
    res.status(200).render('sign-up', {
      title: 'Sign up',
    });
  }
});
