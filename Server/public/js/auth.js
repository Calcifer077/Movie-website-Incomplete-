/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert.js';
import { showLoading } from './showLoading.js';

export const login = async (email, password) => {
  showLoading(true);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });

    console.log('login route called');
    if (res.data.message === 'success') {
      console.log('Login successfull!');
      showAlert('success', 'Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'An error occured while trying to log you in.');
  } finally {
    showLoading(false);
  }
};

export const signUpWithEmail = async (
  name,
  email,
  password,
  passwordConfirm,
) => {
  showLoading(true);
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
      }, 1000);
    }
    console.log(res);
  } catch (err) {
    console.log(err);
    showAlert('error', 'An error occured while signing up!');
  } finally {
    showLoading(false);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.message === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'An error occured while logging out');
  }
};
