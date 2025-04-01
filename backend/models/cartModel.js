const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    cartItems: [
      {
        book: {
          type: ObjectId,
          required: true,
          ref: "book",
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;