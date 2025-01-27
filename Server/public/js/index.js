/* eslint-disable */

import { showAlert } from './alert.js';
import { login, signUpWithEmail, logout } from './auth.js';
import { searchForMovie } from './movies.js';
import { createReview, likeAndDislikeReview } from './review.js';

const logoutBtn = document.querySelector('.navbar-logout');
const loginForm = document.querySelector('.sign-in-form');
const signUpForm = document.querySelector('.sign-up-email-form');
const logReviewForm = document.querySelector('.log-new-review-search');
const profileItems = document.querySelector('.profile-recent-reviews-items');
const writeReview = document.querySelector('.movie-container-write-review');
const movieReviewSection = document.querySelector(
  '.movie-container-reviews-section',
);

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.querySelector('.sign-in-form-email-input').value;
    const password = document.querySelector(
      '.sign-in-form-password-input',
    ).value;

    login(email, password);
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.querySelector('.sign-up-email-form-name-input').value;
    const email = document.querySelector(
      '.sign-up-email-form-email-input',
    ).value;
    const password = document.querySelector(
      '.sign-up-email-form-password-input',
    ).value;
    const passwordConfirm = document.querySelector(
      '.sign-up-email-form-password-confirm-input',
    ).value;

    // console.log(name, email, password, passwordConfirm);
    signUpWithEmail(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', function () {
    logout();
  });
}

if (logReviewForm) {
  const searchIconReviewForm = document.querySelector(
    '.log-new-review-search-image',
  );

  searchIconReviewForm.addEventListener('click', function () {
    const searchQuery = document.querySelector(
      '.log-new-review-search-input',
    ).value;

    console.log(searchQuery);
    searchForMovie(searchQuery);
  });

  logReviewForm.addEventListener('submit', function (e) {
    e.preventDefault();
  });
}

if (profileItems) {
  profileItems.addEventListener('click', function () {});
}

if (writeReview) {
  const writeReviewSubmitBtn = document.querySelector(
    '.movie-container-write-review-btn',
  );

  writeReviewSubmitBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const writeReviewInput = document.querySelector(
      '.movie-container-write-review-container-textarea',
    ).value;
    const writeReviewRating = document.querySelector(
      '.movie-container-write-review-container-input-rating',
    ).value;

    if (writeReviewRating > 5 || writeReviewRating < 1) {
      showAlert('error', 'Please enter a value that is between 1 and 5');
    } else if (!writeReviewInput) {
      showAlert(
        'error',
        'Please tell us something about movie in review section',
      );
    } else {
      console.log(writeReviewInput, writeReviewRating);
      createReview(writeReviewInput, writeReviewRating);
    }
  });
}

if (movieReviewSection) {
  const movieReviewItems = document.querySelectorAll(
    '.movie-container-reviews-item',
  );

  movieReviewItems.forEach((element) => {
    const upVote = element.querySelector(
      '.movie-container-reviews-item-votes-up',
    );
    const downVote = element.querySelector(
      '.movie-container-reviews-item-votes-down',
    );
    const reviewId = element.querySelector(
      '.movie-container-reviews-item-id',
    ).textContent;

    upVote.addEventListener('click', function () {
      likeAndDislikeReview(reviewId, 'like');
    });

    downVote.addEventListener('click', function () {
      likeAndDislikeReview(reviewId, 'dislike');
    });
  });
}
