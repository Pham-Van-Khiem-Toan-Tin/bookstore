const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    order: {
      type: ObjectId,
      required: true,
      ref: "order",
    },
    product: {
      type: ObjectId,
      required: true,
      ref: "book",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value.trim().length > 0;
        },
        message: "Nội dung không được trống hoặc chứa khoảng trắng",
      },
    },
  },
  {
    timestamps: true,
  }
);
const reviewModel = mongoose.model("review", reviewSchema);
module.exports = reviewModel;