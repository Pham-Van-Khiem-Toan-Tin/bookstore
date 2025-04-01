const reviewModel = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");

module.exports.getReviewOfProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  if (!productId || productId.trim().length == 0) {
    throw new Error("Product is not exists");
  }
  const reviewList = await reviewModel
    .find({ product: productId })
    .populate("User", "name")
    .sort({ createdAt: 1 })
    .limit(10);
    
});
