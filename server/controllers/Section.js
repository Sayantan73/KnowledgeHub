const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try {
        // data fetch 
        const {sectionName, courseId} = req.body;
        //data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please fill all details",
            })
        }
        // create section
        const newSection = await Section.create({sectionName: sectionName});
        // update course with section object id
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id: courseId},
            {
                $push:{courseContent: newSection._id}
            },
            {new: true}
        ).populate("courseContent");
        return res.status(200).json({
            success: true,
            message: "section created successfully",
            updatedCourseDetails,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "unable create section",
            error: error.message,
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        // data input
        const {sectionName, sectionId} = req.body;
        // data validation
        if (!sectionName || !sectionId) {
            json.status(400).json({
                success: false,
                message: "please fill all details carefully",
            })
        }
        // update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});
        // return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully"
        })
    } catch (error) {
        console.log(error);
        json.status(500).json({
            success: false,
            message: "unable update section, please try again",
            error: error.message,
        })
    }
}


exports.deleteSection = async (req, res) => {
    try {
       // get Id assuming that we are sending id in params
       const {sectionId} = req.params;
       // delete the section
       await Section.findByIdAndDelete(sectionId);
       // return response
       res.status(200).json({
        success: true,
        message: "section deleted successfully"
       })
    } catch (error) {
        console.log(error);
        json.status(500).json({
            success: false,
            message: "unable delete section, please try again",
            error: error.message,
        })
    }
}