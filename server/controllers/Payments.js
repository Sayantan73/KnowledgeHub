const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // get courseId and UserId
        const {CourseId} = req.body;
        const userId = req.user.id
        // validation
        // valid courseId
        if (!CourseId) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid course Id"
            })
        }

        // valid courseDetails
        let course;
        try {
            course = await Course.findById(CourseId);
            if (!course) {
                return res.status(400).json({
                    success: false,
                    message: "Could not find the course"
                })
            }

            // is User pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentEnrolled.includes(uid)) {
                return res.status(400).json({
                    success: false,
                    message: "Student is already enrolled"
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
            success: false,
            error: error.message,
        })
        }
        // order create
        const amount = course.price;
        const currency = "INR";
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                CourseId: CourseId,
                userId,
            }
        };
        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options)
            console.log(paymentResponse);
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
                message: "Order created successfully"
            })
            
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Could not initiate order",
            })
        }
        // return response
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to capture the payment, Please try again",
            error: error.message,
        })
    }
}

exports.verifySignature = async (req, res) => {
    try {
        const webhookSecret = "12345678";
        const signature = req.headers["x-razorpay-signature"];

        const shaSum = crypto.createHmac("sha256", webhookSecret);
        shaSum.update(JSON.stringify(req.body))
        const digest = shaSum.digest("hex");

        if (digest === signature) {
            console.log("Payment is Authorized");
            
            const {CourseId, userId} = req.body.payload.payment.entity.notes;

            try {
                // fulfill the action
                // find the course and enrolled the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                    {_id: CourseId},
                    {$push: {studentEnrolled: userId}},
                    {new: true},
                );
                if (!enrolledCourse) {
                    return res.status(500).json({
                        success: false,
                        message: "Course not found"
                    })
                }
                console.log(enrolledCourse);

                // find the student and add the course to their list
                const enrolledStudent = await User.findByIdAndUpdate(
                    {_id: userId},
                    {$push: {courses: CourseId}},
                    {new: true}
                );
                console.log(enrolledStudent);
                
                // send mail
                const emailResponse = await mailSender(enrolledStudent.email, "Congratulations from knowledgeHub", "Congratulations, you are onboarded into new knowledgeHub course")
                console.log(emailResponse);
                return res.status(200).json({
                    success: true,
                    message: "Signature verified and course added"
                })
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                success: false,
                message: "Unable to capture the payment, Please try again",
                error: error.message,
                })
            }
        }else{
            return res.status(400).json({
                success: false,
                message: "Invalid request",
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to verify your payment signature",
            error: error.message,
        })
    }
}