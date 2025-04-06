import { useEffect, useLayoutEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message/Message";
import Loader from "../../components/Loader/Loader";
import { Modal } from "bootstrap";
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from "../../actions/orderActions";
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from "../../constants/orderConstants";
import "./Order.css";
import { toast } from "react-toastify";
import { createReview } from "../../actions/reviewActions";

const Order = () => {
  const { id } = useParams();
  const [productRating, setProductRating] = useState({
    orderId: "",
    productId: "",
    rating: 0,
    comment: "",
  });

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  const { success: successReview, error: errorReview } = useSelector(
    (state) => state.reviewCreate
  );
  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  if (!loading) {
    // Calculate price
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
    };

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, []);
  useEffect(() => {
    if (successReview) {
      toast.success("Review submitted successfully");
      dispatch({ type: "REVIEW_CREATE_RESET" });
      dispatch(getOrderDetails(id));
    }
    if (errorReview) {
      toast.error(errorReview);
      dispatch({ type: "REVIEW_CREATE_RESET" });
    }
  }, [dispatch, successReview, errorReview]);
  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(id, paymentResult));
  };
  let modalReview = null;
  useLayoutEffect(() => {
    const modalElement = document.getElementById("reviewModal");

    if (modalElement != null) {
      modalReview = new Modal(modalElement, {
        keyboard: false,
      });
    }
  }, [loading]);
  const openModal = (item) => {
    const modalElement = document.getElementById("reviewModal");
    const modal = Modal.getInstance(modalElement);
    modal.show();

    setProductRating({
      orderId: order._id,
      productId: item.book,
      rating: 0,
      comment: "",
    });
  };
  const submitReview = () => {
    const productId = productRating?.productId;
    const rating = productRating?.rating;
    const comment = productRating?.comment?.trim();

    if (!productId || !rating || !comment) {
      toast.error("Please fill all fields");
      return;
    }
    const review = {
      orderId: order._id.trim(),
      productId: productId.trim(),
      rating: productRating.rating,
      comment: productRating.comment.trim(),
    };
    dispatch(createReview(review));
    const modalElement = document.getElementById("reviewModal");
    const modal = Modal.getInstance(modalElement);
    modal.hide();
  };
  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="alert-danger">{error}</Message>
  ) : (
    <>
      <div className="order">
        <h1 className="pb-5">Order {order._id}</h1>
        <div className="row ">
          <div className="col-md-8">
            <div className="list-group-flush">
              <div className="list-group-item">
                <h2>Shipping</h2>
                <p>
                  <strong>Name: </strong> {order.user.name}
                </p>
                <p>
                  <strong>Email: </strong>
                  <a href={`mailto: ${order.user.email}`}>{order.user.email}</a>
                </p>

                <p>
                  <strong>Address: </strong>
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode},{" "}
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <Message variant={"alert-success"}>
                    Delivered on {order.deliveredAt}
                  </Message>
                ) : (
                  <Message variant={"alert-danger"}>Not Delivered</Message>
                )}
              </div>
              <hr />
              <div className="list-group-item pt-4">
                <h2>Payment Method</h2>
                <p>
                  <strong>Method: </strong>
                  {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <Message variant={"alert-success"}>
                    Paid on {order.paidAt}
                  </Message>
                ) : (
                  <Message variant={"alert-danger"}>Not Paid</Message>
                )}
              </div>
              <hr />
              <div className="list-group-item pt-4">
                <h2>Order Items</h2>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Image</th>
                      <th scope="col">Name</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Price</th>
                      <th scope="col">Total</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order && order?.orderItems.length > 0 ? (
                      order.orderItems.map((item, index) => (
                        <tr key={order._id + item._id}>
                          <td>{index + 1}</td>
                          <td>
                            <img width={100} src={item.image} alt="" />
                          </td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{item.price}</td>
                          <td>{item.qty * item.price}</td>
                          <td>
                            {item?.isReviewed ? (
                              <span>Reviewed</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openModal(item)}
                                className="btn btn-primary"
                              >
                                Evaluate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>No order items</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="list-group">
                <div className="list-group-item bg-color">
                  <h2>Order Summary</h2>
                </div>
                <div className="list-group-item bg-color">
                  <div className="row">
                    <div className="col">Items</div>
                    <div className="col">${order.itemsPrice}</div>
                  </div>
                </div>
                <div className="list-group-item bg-color">
                  <div className="row">
                    <div className="col">Shipping</div>
                    <div className="col">${order.shippingPrice}</div>
                  </div>
                </div>
                <div className="list-group-item bg-color">
                  <div className="row">
                    <div className="col">Tax</div>
                    <div className="col">${order.taxPrice}</div>
                  </div>
                </div>
                <div className="list-group-item bg-color">
                  <div className="row">
                    <div className="col">Total</div>
                    <div className="col">${order.totalPrice}</div>
                  </div>
                </div>
                {!order.isPaid && (
                  <div className="list-group-item bg-color">
                    {loadingPay && <Loader />}
                    <span className="btn order-btn">PAID</span>
                  </div>
                )}
                {loadingDeliver && <Loader />}
                {userInfo &&
                  userInfo.isAdmin &&
                  order.isPaid &&
                  !order.isDelivered && (
                    <div className="list-group-item bg-color">
                      <button
                        className="btn order-btn"
                        onClick={deliverHandler}
                      >
                        Mark As Delivered
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="reviewModal"
        tabIndex="-1"
        aria-labelledby="reviewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="reviewModalLabel">
                Modal title
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="rating" className="form-label">
                  Rating
                </label>
                <select
                  id="rating"
                  className="form-select form-control"
                  value={productRating.rating}
                  onChange={(e) =>
                    setProductRating({
                      ...productRating,
                      rating: e.target.value,
                    })
                  }
                >
                  <option value="">Select...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div className="mb-3">
                <label for="comment" className="form-label">
                  Comment
                </label>
                <textarea
                  className="form-control"
                  id="comment"
                  rows="3"
                  value={productRating.comment}
                  placeholder="Enter your comment here"
                  onChange={(e) =>
                    setProductRating({
                      ...productRating,
                      comment: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={submitReview}
                type="button"
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
