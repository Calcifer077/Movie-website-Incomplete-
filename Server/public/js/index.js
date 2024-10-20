/* eslint-disable */

import { showAlert } from './alert.js';
import { login, signUpWithEmail } from './auth.js';
import { searchForMovie } from './reviews.js';

const loginForm = document.querySelector('.sign-in-form');
const signUpForm = document.querySelector('.sign-up-email-form');
const logReviewForm = document.querySelector('.log-new-review-form');

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
