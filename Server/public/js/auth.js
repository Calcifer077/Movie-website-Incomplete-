/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert.js';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.message === 'success') {
      console.log('Login successfull!');
      showAlert('success', 'Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'An error occured while trying to log you in.');
  }
};

export const signUpWithEmail = async (
  name,
  email,
  password,
  passwordConfirm,
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: { name, email, password, passwordConfirm },
    });

    if (res.data.message === 'success') {
      showAlert('success', 'Signed up successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
    console.log(res);
  } catch (err) {
    console.log(err);
    showAlert('error', 'An error occured while signing up!');
  }
};
