const User = require("../models/User");
const mailSender =  require("../utils/mailSender");
const bcrypt = require("bcrypt")

// reset passwordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from request body
        const email = req.body.email;

        // check user for this email, validate email
        const user = await User.findOne({email: email})
        if (!user) {
            return res.status(453).json({
                success: false,
                message: "Your email is not registered with us"
            });
        }
        console.log("generate token for user: ",user);
        
        // generate token
        const token = crypto.randomUUID() ;
        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                        {email: email},
                                        {
                                            token: token,
                                            resetPasswordExpires: new Date(Date.now() + 5*60*1000),
                                        },
                                        {new: true}
        )
        // create url
        const url = `http://localhost:3000/update-password/${token}`
        console.log("urlToken:", token);
        
        // send mail containing the url
        await mailSender(email, "Password Reset Link", `Click on the link to reset your password: ${url}`)
        // return response
        return res.json({
            success: true,
            message: "Email send successfully, please check email and change password"
        })
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: `Something went wrong while sending reset password mail: ${error.message}`,
        })
    }
}

// reset password
exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        const {password, confirmPassword, token} = req.body;
        // validation
        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "2 password not matching"
            })
        }
        // get user details from db using token
        const userDetails = await User.findOne({token: token});
        // if no entry - invalid token
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            })
        }
        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json(401).json({
                success: false,
                message: "Token is expired please regenerate your token"
            })
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // password update
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        )
        // return response
        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        })
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: `Authentication failed while validating the token: ${error.message}`,
        })
    }
} 