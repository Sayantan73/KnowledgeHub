const express = require("express");
const router = express.Router();
const {auth, isStudent, isInstructor, isAdmin} = require("../middlewares/auth");
const { createCategories, showAllCategories, categoryPageDetails } = require("../controllers/Categories");
const { createRating, getAverageRating, getAllRating } = require("../controllers/RatingAndReview");
const { createCourse, getCourseDetails } = require("../controllers/Course");
const { createSection } = require("../controllers/Section");
const { createSubSection } = require("../controllers/SubSection");

router.post("/createCourse", auth, isInstructor, createCourse)
router.post("/getCourseDetails", getCourseDetails)

router.post("/addSection", auth, isInstructor, createSection)
router.post("/addSubSection", auth, isInstructor, createSubSection)

router.post("/createCategory", auth, isAdmin, createCategories)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)


module.exports = router; 