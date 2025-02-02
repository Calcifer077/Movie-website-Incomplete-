/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';
import { showLoading } from './showLoading';

export const createReview = async (review, rating) => {
  showLoading(true);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review created successfully');

      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  } finally {
    showLoading(false);
  }
};

export const likeAndDislikeReview = async (reviewId, type) => {
  try {
    showLoading(true);
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/reviews/updateLikesAndDislikes',
      data: {
        reviewId,
        type,
      },
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  } finally {
    showLoading(false);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    showLoading(true);
    let id = reviewId;
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${id}`,
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  } finally {
    showLoading(false);
  }
};
