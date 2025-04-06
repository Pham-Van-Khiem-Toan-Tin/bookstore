import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Rating from "../../components/Book/Rating";
import Loader from "../../components/Loader/Loader";
import Message from "../../components/Message/Message";
import { getBookDetails, createBookReview } from "../../actions/bookActions";
import { BOOK_CREATE_REVIEW_RESET } from "../../constants/bookConstants";
import "./BookDetail.css";
import { addToCart } from "../../actions/cartActions";
import { toast } from "react-toastify";
import { listReviews, watchMoreReview } from "../../actions/reviewActions";

const BookDetail = () => {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();

  const bookDetails = useSelector((state) => state.bookDetails);
  const { loading, error, book } = bookDetails;
  const {
    loading: loadingReview,
    error: errorReview,
    reviews,
  } = useSelector((state) => state.reviewList);
  const userLogin = useSelector((state) => state.userLogin);
  const cart = useSelector((state) => state.cart);
  const { success: successCart, error: errorCart } = cart;
  const { userInfo } = userLogin;

  const bookCreateReview = useSelector((state) => state.bookCreateReview);
  const { success: successBookReview, error: errorBookReview } =
    bookCreateReview;
  useEffect(() => {
    dispatch(getBookDetails(id));
    dispatch(listReviews(id));
  }, [dispatch, id]);
  useEffect(() => {
    if (successCart) {
      toast.success("Add to cart successfully!");
      dispatch({ type: "CART_RESET" });
    }
    if (errorCart) {
      alert(errorCart);
      dispatch({ type: "CART_RESET_ERROR" });
    }
  }, [dispatch, successCart, errorCart]);
  const addToCartHandler = (e) => {
    e.preventDefault();
    dispatch(addToCart(book._id, qty));
  };
  // Hàm này chỉ cho nhập số
  const handleQuantityKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    const isNumber = /[0-9]/.test(e.key);
    // Chỉ cho phép số (0-9) hoặc các phím điều hướng/xóa
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    // Loại bỏ số 0 ở đầu nếu có
    if (newValue.startsWith("0")) {
      newValue = newValue.replace(/^0+/, "");
    }
    if (newValue > book.countInStock) {
      newValue = book.countInStock;
    }
    setQty(newValue);
  };
  const watchMore = () => {
    const userIds = reviews.map((item) => item.userId);
    dispatch(watchMoreReview(id, userIds, page + 1));
    setPage(page + 1);
  };
  return (
    <div className="container book-detail">
      <Link className="btn back-btn" to="/">
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="alert-danger">{error}</Message>
      ) : (
        <>
          <div className="row book-item">
            <div className="col md-6 book-img bg-color">
              <img src={book.image} alt={book.name} className="img-fluid" />
            </div>
            <div className="col md-3 bg-color">
              <div className="list-group">
                <div className="list-group-item bg-color">
                  <h3>{book.name}</h3>
                </div>
                <div className="list-group-item bg-color">
                  <Rating
                    value={book.rating}
                    text={` ${book.numReviews} reviews`}
                    color={"#faeddf"}
                  />
                </div>
                <div className="list-group-item bg-color">
                  <strong>Price:</strong> ${book.price}
                </div>
                <div className="list-group-item bg-color">
                  <strong>Status:</strong>{" "}
                  {book.countInStock > 0 ? "In Stock" : "Out of Stock"}
                </div>
                <div className="list-group-item bg-color">
                  <strong>Category:</strong>{" "}
                  {book.category ? book.category.name : "N/A"}
                </div>
                <div className="list-group-item bg-color">
                  {book != null && book.countInStock > 0 ? (
                    <>
                      <strong>Qty: </strong>
                      <input
                        type="text"
                        className="form-control d-inline-block w-auto"
                        value={qty}
                        onKeyDown={handleQuantityKeyDown}
                        onChange={handleChange}
                      />
                    </>
                  ) : (
                    <strong className="text-danger">Out of stock</strong>
                  )}
                </div>

                <div className="list-group-item bg-color">
                  <strong>Description:</strong> {book.description}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-add-to-cart"
                onClick={addToCartHandler}
                disabled={book.countInStock === 0}
              >
                Add To Cart
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <h2>Reviews</h2>
              {reviews && reviews.length > 0 ? (
                <>
                  <div className="list-group">
                    {reviews.map((review) => (
                      <div
                        className="list-group-item bg-color border-secondary rounded-0"
                        key={review.name}
                      >
                        <strong>{review.name}</strong>
                        <Rating value={review.rating} />
                        <p>{review.createdAt.substring(0, 10)}</p>
                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-100 my-2 d-flex align-items-center justify-content-center">
                    <button onClick={watchMore} className="btn btn-primary">Watch more</button>
                  </div>
                </>
              ) : (
                <Message>No reviews</Message>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookDetail;
