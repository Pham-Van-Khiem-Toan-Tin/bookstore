import axios from "axios";
import {
  BOOK_LIST_REQUEST,
  BOOK_LIST_SUCCESS,
  BOOK_LIST_FAIL,
  BOOK_DETAILS_REQUEST,
  BOOK_DETAILS_SUCCESS,
  BOOK_DETAILS_FAIL,
  BOOK_DELETE_REQUEST,
  BOOK_DELETE_SUCCESS,
  BOOK_DELETE_FAIL,
  BOOK_CREATE_REQUEST,
  BOOK_CREATE_SUCCESS,
  BOOK_CREATE_FAIL,
  BOOK_UPDATE_REQUEST,
  BOOK_UPDATE_SUCCESS,
  BOOK_UPDATE_FAIL,
  BOOK_CREATE_REVIEW_REQUEST,
  BOOK_CREATE_REVIEW_SUCCESS,
  BOOK_CREATE_REVIEW_FAIL,
  BOOK_TOP_REQUEST,
  BOOK_TOP_SUCCESS,
  BOOK_TOP_FAIL,
  BOOK_RECOMMEND_REQUEST,
  BOOK_RECOMMEND_SUCCESS,
  BOOK_RECOMMEND_FAIL,
} from "../constants/bookConstants";

export const listRecommendedBooks = () => async (dispatch) => {
  try {
    dispatch({ type: BOOK_RECOMMEND_REQUEST });

    const { data } = await axios.get(`/api/books/top`);

    dispatch({ type: BOOK_RECOMMEND_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOK_RECOMMEND_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
}
// Action tìm kiếm sách
export const listBooks = (keyword = "", pageNumber = "") => async (dispatch) => {
  try {
    dispatch({ type: BOOK_LIST_REQUEST });

    const { data } = await axios.get(
      `/api/books?keyword=${keyword}&pageNumber=${pageNumber}`
    );

    dispatch({ type: BOOK_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOK_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Action tìm sách theo thể loại
export const listBooksByCategory = (categoryId, keyword = "", pageNumber = "") => async (dispatch) => {
  try {
    dispatch({ type: BOOK_LIST_REQUEST });

    const { data } = await axios.get(
      `/api/books?category=${categoryId}&keyword=${keyword}&pageNumber=${pageNumber}`
    );

    dispatch({ type: BOOK_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOK_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Action xem chi tiết sách
export const getBookDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: BOOK_DETAILS_REQUEST });

    const { data } = await axios.get(`/api/books/${id}`);

    dispatch({ type: BOOK_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOK_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Action xóa sách
export const deleteBook = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: BOOK_DELETE_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/books/${id}`, config); 

    dispatch({ type: BOOK_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: BOOK_DELETE_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

export const createBook = (bookData) => async (dispatch, getState) => {
  try {
    dispatch({ type: BOOK_CREATE_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post("/api/books", bookData, config);

    dispatch({
      type: BOOK_CREATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: BOOK_CREATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// Action cập nhật sách
export const updateBook = (book) => async (dispatch, getState) => {
  try {
    dispatch({
      type: BOOK_UPDATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Kiểm tra xem category có được cung cấp không
    if (!book.category) {
      throw new Error("Category is required");
    }

    const { data } = await axios.put(`/api/books/${book._id}`, book, config);

    dispatch({ type: BOOK_UPDATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOK_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Action tạo đánh giá sách
export const createBookReview = (bookId, review) => async (dispatch, getState) => {
  try {
    dispatch({
      type: BOOK_CREATE_REVIEW_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.post(`/api/books/${bookId}/reviews`, review, config);

    dispatch({ type: BOOK_CREATE_REVIEW_SUCCESS });
  } catch (error) {
    dispatch({
      type: BOOK_CREATE_REVIEW_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Action lấy danh sách sách phổ biến
export const listTopBooks = () => async (dispatch) => {
  try {
    dispatch({ type: BOOK_TOP_REQUEST });

    const { data } = await axios.get(`/api/books/top`);

    dispatch({ type: BOOK_TOP_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOK_TOP_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
