const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        // fetch data form request body
        const {dateOfBirth = "", about = "", contactNumber, gender} = req.body;
        // fetch userId
        const id = req.user.id;
        // validation
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "please fill all required details"
            })
        }
        // find profile
        const user = await User.findById(id);
        const profileId = await user.additionalDetails;
        const profileDetails = await Profile.findById(profileId)
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();
        // send response
        return res.status(200).json({
            success: true,
            message: "Profile details updated successfully",
            profileDetails,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message,
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        // validation
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        // delete profile
        await Profile.findByIdAndDelete(userDetails.additionalDetails)
        // delete user
        await User.findByIdAndDelete(id)
        //HW: unenroll from courses research crone job and schedule job
        // return response
        return res.status(200).json({
            success: true,
            message: "successfully deleted you Account"
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to Delete Account",
            error: error.message,
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        // return response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            userDetails,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch all detailes",
            error: error.message,
        })
    }
}