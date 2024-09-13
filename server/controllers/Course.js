const Course = require('../models/Course')
const Categories = require("../models/Categories")
const User = require('../models/User')
const {uploadImageToCloudinary} = require('../utils/imageUploader')

// create course handler function
exports.createCourse = async (req, res) => {
    try {
        // fetch all data
        const {courseName, courseDescription, whatYouWillLearn, price, tag, categories, instructions} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;
        // validation
        if (!courseName|| !courseDescription || !whatYouWillLearn || !price || !categories || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId)
        console.log("Instructor details: ", instructorDetails);
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found",
            })
        }
        // check given categories is valid or not
        const categoriesDetails = await Categories.findById(categories);
        if (!categoriesDetails) {
            return res.status(400).json({
                success: false,
                message: "categories details are not found",
            })
        }
        // upload image to cloudinary
        const thumbnailImage = uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

        // create an entry for the new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            categories: categoriesDetails._id,
            instructions: instructions,
            thumbnail: thumbnail.secure_url,
        })

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true}
        );
        // update the categories schema
        await Categories.findByIdAndUpdate(
            {_id: categoriesDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true}
        );
        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        })
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create course"
        })
        
    }
}



// getAllCourses handler function
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({},{
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentEnrolled: true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        })

    } catch (error) {
        console.log(error);
        json.status(500).json({
            success: false,
            message: "unable to fetch all courses",
            error: error.message,
        })
    }
}


// get Course Details
exports.getCourseDetails = async (req, res) => {
    try {
        // get id
        const {courseId} = req.body;
        // find course details
        const courseDetails = await Course.find({_id: courseId})
                                                                .populate(
                                                                    {
                                                                        path: "instructor",
                                                                        populate: {path: "additionalDetails"}
                                                                    },
                                                                )
                                                                .populate("category")
                                                                .populate("ratingAndReviews")
                                                                .populate(
                                                                    {
                                                                        path: "courseContent",
                                                                        populate: {path: "subSection"}
                                                                    }
                                                                ).exec();
        // validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with the course id: ${courseId}`
            })
        }
        // return response
        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            courseDetails,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to get course Details",
            error: error.message,
        })
    }
}