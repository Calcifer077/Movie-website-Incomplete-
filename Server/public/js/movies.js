/* eslint-disable */

// tt0816692

import axios from 'axios';
import { showAlert } from './alert';
import { showLoading } from './showLoading';

export const searchForMovie = async (search) => {
  showLoading(true);
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/movies/search/?i=${search}`,
    });

    if (res.data.status === 'success') {
      location.assign(`/movie/:${search}`);
    }
  } catch (err) {
    showAlert('error', 'Something went wrong!');
  } finally {
    showLoading(false);
  }
};
