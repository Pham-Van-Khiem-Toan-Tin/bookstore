const express = require("express");
const router = express.Router();
const {
  getReviewOfProduct,
  createReview,
  getMoreReviewOfProduct,
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

router.route("/:productId").get(getReviewOfProduct);
router.route("/more-review").post(getMoreReviewOfProduct);
router.route("/create").post(protect, createReview);

module.exports = router;
