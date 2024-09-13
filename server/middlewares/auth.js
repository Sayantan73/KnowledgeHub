const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config()

// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token 
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        console.log("Token: ", token);
        
        // if token missing return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }
        // verify the token
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode)
            req.user = decode
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "token is invalid",
            });
        }
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: console.log("Authentication failed while validating the token", error.message),
        })
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for student only",
            });
        }
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: console.log("role student validation failed", error.message),
        })
    }
}

// isInstructor
exports.isInstructor = async (req, res , next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Instructor only",
            });
        }
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: console.log("role InsAdmin validation failed", error.message),
        })
    }
}


// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Admin only",
            });
        }
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: console.log("role Admin validation failed", error.message),
        })
    }
}