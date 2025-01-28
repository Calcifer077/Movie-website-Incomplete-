const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewsController.getHomePage);
router.get('/profile', viewsController.getProfile);
router.get('/log-new-review', viewsController.getReviewPage);
router.get('/sign-up', viewsController.signUp);
router.get('/sign-up-email', viewsController.signUpWithEmail);
router.get('/login', viewsController.login);
router.get('/top-movies', viewsController.getTopMoviesPage);
router.get('/recent-reviews', viewsController.getRecentReviewsPage);
router.get('/movie/:search', viewsController.getMoviePage);

module.exports = router;
