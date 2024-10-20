const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A movie must have a title'],
    },
    director: {
      type: String,
      required: [true, 'A movie must have a director'],
    },
    writer: {
      type: String,
      required: [true, 'A movie must have a writer'],
    },
    released: {
      type: String,
      required: [true, 'A movie must have a release year'],
    },
    poster: {
      type: String,
    },
    imdbRating: {
      type: Number,
      default: 2.5,
      min: [1.0, 'Rating must be above 1.0'],
      max: [10.0, 'Rating must be less than 10.0'],
    },
    year: {
      type: Number,
    },
    imdbId: {
      type: String,
      required: [true, 'Must have a ID'],
    },
    actors: {
      type: String,
    },
    plot: {
      type: String,
    },
    runtime: {
      type: String,
    },
    genre: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
