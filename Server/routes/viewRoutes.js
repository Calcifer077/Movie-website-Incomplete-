const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/sign-up', viewsController.signUp);
router.get('/login', viewsController.login);
router.get('/sign-up-email', viewsController.signUpWithEmail);
router.get('/top-movies', viewsController.getTopMoviesPage);
router.get('/', viewsController.getHomePage);

router.get('/profile', authController.protect, viewsController.getProfile);
router.get(
  '/log-new-review',
  authController.protect,
  viewsController.getReviewPage,
);

router.get(
  '/recent-reviews',
  authController.isLoggedIn,
  viewsController.getRecentReviewsPage,
);
router.get('/movie/:search', viewsController.getMoviePage);

module.exports = router;
