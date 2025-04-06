import axios from "axios";
import {
  REVIEW_CREATE_FAIL,
  REVIEW_CREATE_REQUEST,
  REVIEW_CREATE_SUCCESS,
  REVIEW_LIST_FAIL,
  REVIEW_LIST_REQUEST,
  REVIEW_LIST_SUCCESS,
  REVIEW_WATCH_MORE_REQUEST,
  REVIEW_WATCH_MORE_SUCCESS,
  REVIEW_WATCH_MORE_FAIL
} from "../constants/reviewConstants";


export const watchMoreReview = (bookId, userIds, pageNumber = "") => async (dispatch) => {
  try {
    dispatch({ type: REVIEW_WATCH_MORE_REQUEST });
    const { data } = await axios.post(
      `/api/review/${bookId}?page=${pageNumber}`,
      {
        userIds: userIds
      }
    );
    dispatch({
      type: REVIEW_WATCH_MORE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: REVIEW_WATCH_MORE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
}

export const listReviews = (bookId) => async (dispatch) => {
  try {
    dispatch({ type: REVIEW_LIST_REQUEST });
    const { data } = await axios.get(
      `/api/review/${bookId}`,
    );
    dispatch({
      type: REVIEW_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: REVIEW_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
}

export const createReview = (review) => async (dispatch, getState) => {
  try {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("tk");
    if (!isAuthenticated) {
      alert("Please login to view cart");
      return;
    }
    const config = {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    dispatch({
      type: REVIEW_CREATE_REQUEST,
    });


    const { data } = await axios.post(
      `/api/review/create`,
      review,
      config
    );

    dispatch({
      type: REVIEW_CREATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: REVIEW_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
