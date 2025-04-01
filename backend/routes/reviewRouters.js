const express = require("express");
const router = express.Router();

router.route("/:id")
.get(getReviewOfProduct)