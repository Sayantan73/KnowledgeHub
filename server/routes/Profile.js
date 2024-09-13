const express = require("express");
const router = express.Router();
const {auth, isStudent, isInstructor, isAdmin} = require("../middlewares/auth");
const { createCategories, showAllCategories, categoryPageDetails } = require("../controllers/Categories");
const { createRating, getAverageRating, getAllRating } = require("../controllers/RatingAndReview");
const { updateProfile, getAllUserDetails } = require("../controllers/Profile");

router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)

router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)


module.exports = router; 