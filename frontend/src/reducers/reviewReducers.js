import {
  REVIEW_CREATE_FAIL,
  REVIEW_CREATE_REQUEST,
  REVIEW_CREATE_SUCCESS,
  REVIEW_LIST_FAIL,
  REVIEW_LIST_REQUEST,
  REVIEW_LIST_SUCCESS,
  REVIEW_WATCH_MORE_REQUEST,
  REVIEW_WATCH_MORE_SUCCESS,
  REVIEW_WATCH_MORE_FAIL,
} from "../constants/reviewConstants";

export const reviewListReducer = (state = { reviews: [] }, action) => {
  switch (action.type) {
    case REVIEW_LIST_REQUEST:
      return {
        loading: true,
      };
    case REVIEW_LIST_SUCCESS:
      return {
        loading: false,
        reviews: action.payload.reviewList,
      };
    case REVIEW_LIST_FAIL:
      return { loading: false, error: action.payload };
    case REVIEW_WATCH_MORE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case REVIEW_WATCH_MORE_SUCCESS:
       const oldReview = [ ...state.reviews]
       if (action.payload.reviewList.length > 0) {
           oldReview.push(action.payload.reviewList)
       }
      return {
        ...state,
        reviews: oldReview,
      };
    case REVIEW_WATCH_MORE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export const createReviewReducer = (state = {}, action) => {
  switch (action.type) {
    case REVIEW_CREATE_REQUEST:
      return { loading: true };
    case REVIEW_CREATE_SUCCESS:
      return { loading: false, success: true };
    case REVIEW_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case "REVIEW_CREATE_RESET":
      return {};

    default:
      return state;
  }
};
