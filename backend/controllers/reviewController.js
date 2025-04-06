const { Order } = require("../models/orderModel");
const reviewModel = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
module.exports.getMoreReviewOfProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.productId;
    const page = Number(req.query.page) || 1;
    const userIds = req.body.userIds;
    const userObjectIds = userIds && userIds.length > 0 ? userIds.map((item) => ObjectId.createFromHexString(item)) : [];
    if (!productId || productId.trim().length == 0) {
      throw new Error("Product is not exists");
    }
    const reviewList = await reviewModel.aggregate([
      {
        $match: {
          product: ObjectId.createFromHexString(productId),
          user: { $nin: userObjectIds }
        },
      },
      {
        $sort: {
          createdAt: -1,
        }
      },
      {
        $group: {
          _id: "$user",
          reviewId: { $first: "$_id" },
          createdAt: { $first: "$createdAt" },
          comment: { $first: "$comment" },
          rating: { $first: "$rating" }
        }
      },
      {
        $sort: {
          createdAt: -1,
        }
      },
      {
        $skip: (page - 1) * 5
      },
      {
        $limit: 5 // Giới hạn số lượng bản ghi trả về
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: "$reviewId",
          comment: 1,
          rating: 1,
          userName: "$userDetails.name",
          userId: "$userDetails._id",
          createdAt: 1
        }
      }
    ])

    console.log(reviewList);
  
    res.status(200).json({
      reviewList,
    });
  } catch (error) {
    console.log(error);
    
  }
});
module.exports.getReviewOfProduct = asyncHandler(async (req, res) => {
  try {
    
    const productId = req.params.productId;
    if (!productId || productId.trim().length == 0) {
      throw new Error("Product is not exists");
    }
    const reviewList = await reviewModel.aggregate([
      {
        $match: {
          product: ObjectId.createFromHexString(productId), // Lọc theo productId
        },
      },
      {
        $sort: {
          createdAt: -1,
        }
      },
      {
        $group: {
          _id: "$user",
          reviewId: { $first: "$_id" },
          createdAt: { $first: "$createdAt" },
          comment: { $first: "$comment" },
          rating: { $first: "$rating" }
        }
      },
      {
        $sort: {
          createdAt: -1,
        }
      },
      {
        $limit: 5 // Giới hạn số lượng bản ghi trả về
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: "$reviewId",
          comment: 1,
          rating: 1,
          userName: "$userDetails.name",
          userId: "$userDetails._id",
          createdAt: 1
        }
      }
    ])

    console.log(reviewList);
  
    res.status(200).json({
      reviewList,
    });
  } catch (error) {
    console.log(error);
    
  }
});
module.exports.getReviewOfProductAndOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
  if (!orderId || orderId.trim().length == 0) {
    throw new Error("Order is not exists");
  }
  if (!productId || productId.trim().length == 0) {
    throw new Error("Product is not exists");
  }
  const review = await reviewModel.find({
    order: orderId,
    product: productId,
    user: req.user._id,
  });
  res.status(200).json({
    review,
  });
});

module.exports.createReview = asyncHandler(async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;
    if (!orderId || orderId.trim().length == 0) {
      throw new Error("Order is not exists");
    }
    if (!productId || productId.trim().length == 0) {
      throw new Error("Product is not exists");
    }
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderItems: { $elemMatch: { product: productId } },
    });
    if (!order) {
      throw new Error(
        "Order is not exists or you are not the owner of this order"
      );
    }
    const review = await reviewModel.create({
      user: req.user._id,
      order: orderId,
      product: productId,
      rating,
      comment,
    });
    const index = order.orderItems.findIndex((item) => (item.book = productId));
    console.log(order);
    console.log(index);

    order.orderItems[index].isReviewed = true;
    await order.save();
    res.status(200).json({
      review,
    });
  } catch (error) {
    console.log(error);
  }
});
