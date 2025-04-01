const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,  
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,  
  }
);

const Category = mongoose.model("category", categorySchema);

module.exports = { Category };
