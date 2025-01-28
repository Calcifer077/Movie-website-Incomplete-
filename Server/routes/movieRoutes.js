const express = require('express');
const movieController = require('../controllers/movieController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

router.route('/search').get(movieController.searchForMovie);
// router.route('/search/:title').get(movieController.searchForMovie);

router
  .route('/')
  .get(movieController.getAllMovies)
  .post(movieController.createMovie);

router
  .route('/:id')
  .get(authController.protect, movieController.getMovie)
  .patch(movieController.updateMovie)
  .delete(movieController.deleteMovie);

router.use('/:movieId/reviews', reviewRouter);

module.exports = router;
