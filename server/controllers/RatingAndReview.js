const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create Rating
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;
        // fetch data from req body
        const {rating, review, courseId} = req.body; 
        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentEnrolled: {$elemMatch: {$eq: userId}}
            },

        )
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course"
            })
        }

        // check if user is already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        })
        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user"
            })
        }
        // create rating and review
        const ratingandReviewDetails = await RatingAndReview.create({
            user: userId,
            rating: rating,
            review: review,
            course: courseId,
        })
        // update course with this rating and reviews
        const updatedCourse = await Course.findOneAndUpdate(
            {_id: courseId},
            {$push: {RatingAndReview: ratingandReviewDetails._id}},
            {new: true}
        )
        console.log(updatedCourse);
        
        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review created successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to Create Rating",
            error: error.message,
        })
    }
}

// get average rating
exports.getAverageRating = async (req, res) => {
    try {
        // get data
        const {courseId} = req.body;
        // calculate average rating 
        const result = await RatingAndReview.aggregate([
            {
                $match: { course: new mongoose.Types.ObjectId(courseId) }
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])
        // return response
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }
        // if no rating and review exists
        return res.status(200).json({
            success: false,
            message: "Average rating is 0, no rating is given till now",
            averageRating: 0,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to get Average Rating",
            error: error.message,
        })
    }
}

// get all rating
exports.getAllRating = async (req, res) => {
    try {
         const allReviews = await RatingAndReview.find({})
         .sort({rating: "desc"})
         .populate({
            path: "user",
            select: "firstName lastName email image",
         })
         .populate({
            path: "course",
            select: "courseName"
         })
         .exec();

         // return response
         return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to fetch all ratings",
            error: error.message,
        })
    }
}