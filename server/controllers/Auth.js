const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//sendOtp
exports.sendOTP = async (req, res) => {

    try {
        // fetch email from request body
        const { email } = req.body;

        // check if user already exist
        const checkUserAlreadyPresent = await User.findOne({ email })

        // if user already exist return a response 
        if (checkUserAlreadyPresent) {
          return res.status(401).json({
                success: false,
                message: "User already registered",
            })
        }

        // generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        console.log("Otp generated: ", otp);

        // check unique otp or not
        const result = await OTP.findOne({ otp: otp })

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await otp.findOne({ otp: otp })
        }

        const otpPayload = { email, otp }

        // create an db entry for Otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json({
            success: true,
            message: "Otp send successfully",
            otp,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `failed to send otp: ${error.message}`,
        })
    }
}

// signUp
exports.signUp = async (req, res) => {
    try {

        // data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
          return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // 2 password match
        if (password !== confirmPassword) {
          return res.status(400).json({
                success: false,
                message: "password and confirmPassword value does not match, please try again",
            })
        }

        // check user already exist or not
        const existingUser = await User.findOne({email});
        if (existingUser) {
          return res.status(400).json({
                success: false,
                message: "User is already registered"
            })
        }

        console.log("inputted otp is: ", otp);
        

        // find most recent otp stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log("recentOtp: ",recentOtp);
        
        // validate otp
        if (recentOtp.length == 0) {
            // otp not found
          return res.status(400).json({
                success: false,
                message: "Otp not found"
            })
        } else if(otp !== recentOtp[0].otp){
          return res.status(400).json({
                success: false,
                message: "invalid otp"
            })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create entry in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        // return response
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: console.log("User cannot be registered", error.message),
        })
    }
}

// logIn
exports.logIn = async (req, res) =>{
    try {
        // get data from req body
        const {email, password} = req.body;

        // validation of data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again",
            });
        }

        // check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails") 
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signUp first",
            })
        }

        // generate JWT after password matching
        console.log("password: ", password);
        console.log("user: ", user);
        console.log("userPassword: ", user.password);
        console.log("bcrypt compare: ", await bcrypt.compare(password, user.password));
        
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "2h"});
            console.log("jwt token: ", token);
            
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24*60*60*1000),
                httpOnly: true,
            }
          return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully"
            })
        }else{
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: console.log("Failed to logIn", error.message),
        })
    }
}

// changepassword
exports.changePassword = async (req, res) => {
    // get data from req body
    // get oldPassword, newPassword, confirmPassword
    // validation

    // update in db

    // send mail - password updated
    // return response
}