const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = ()=>{
    mongoose.connect(process.env.MONGODB_URL, {})
    .then(()=>{console.log("Database connection successful");})
    .catch((error)=>{
        console.log("db connection failure ", error);
        process.exit(1);
    })
}