const dotenv = require('dotenv');

const Movie = require('../models/movieModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

dotenv.config({ path: './config.env' });

exports.getAllMovies = factory.getAll(Movie);
exports.getMovie = factory.getOne(Movie);
exports.createMovie = factory.createOne(Movie);
exports.updateMovie = factory.updateOne(Movie);
exports.deleteMovie = factory.deleteOne(Movie);

exports.searchForMovie = catchAsync(async (req, res, next) => {
  if (req.query.i) {
    return getMovieBasedOnId(req, res, next);
  }

  if (req.query.t) {
    return getMovieBasedOnTitle(req, res, next);
  }

  res.status(200).json({
    status: 'success',
  });
});

const getMovieBasedOnId = catchAsync(async (req, res, next) => {
  console.log('url hit');
  const query = req.query.i;
  const searchId = query.replaceAll(' ', '+');

  const result = await fetch(
    `http://www.omdbapi.com/?i=${searchId}&apikey=${process.env.OMDB_KEY}`,
  );
  const data = await result.json();

  const dataToBeSent = {
    title: data.Title,
    year: Number(data.Year),
    released: data.Released,
    runtime: data.Runtime,
    director: data.Director,
    writer: data.Writer,
    actors: data.Actors,
    poster: data.Poster,
    plot: data.Plot,
    genre: data.Genre,
    imdbRating: Number(data.imdbRating),
    imdbId: data.imdbID,
  };

  const checkIfMoviePresent = await Movie.findOne({
    imdbId: dataToBeSent.imdbId,
  });

  if (!checkIfMoviePresent) {
    await Movie.create(dataToBeSent);
  }

  res.status(200).json({
    status: 'success',
    dataToBeSent,
  });
});

const getMovieBasedOnTitle = catchAsync(async (req, res, next) => {
  const query = req.query.t;
  const searchTitle = query.replaceAll(' ', '+');

  const result = await fetch(
    `http://www.omdbapi.com/?apikey=${process.env.OMDB_KEY}&s=${searchTitle}`,
  );

  const data = await result.json();

  const dataToBeSent = data.Search;

  res.status(200).json({
    status: 'success',
    length: dataToBeSent.length,
    dataToBeSent,
  });
});
