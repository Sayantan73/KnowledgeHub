const SubSection = require("../models/SubSection")
const Section = require("../models/Section")
const {uploadImageToCloudinary} = require("../utils/imageUploader")
require("dotenv").config()

// create subSection
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from request body
        const {sectionId, title, timeDuration, description} = req.body;
        // extract file/video
        const video = req.files.videoFile;
        // validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        // upload video to cloudinary
        const updatedDetailes =await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        console.log(updatedDetailes);
        
        // create a subsection
        const newSubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: updatedDetailes.secure_url
        })
        // update section with this subsection object Id
        const updateSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {$push:{subSection: newSubSectionDetails._id}},
            {new: true}
        ).populate("subSection")
        // return response
        return res.status(200).json({
            success: true,
            message: "sub section created successfully",
            updateSection,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to create sub Section, try again",
            error: error.message,
        })
    }
}

// update subsection 

// delete subsection