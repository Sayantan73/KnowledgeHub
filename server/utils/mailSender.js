const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            }
        })

        let info = transporter.sendMail({
            from: `StudyNotion || by Karan`,
            to: `${email}`,
            subject: `${title}`,
            html: `<h2>Hello, </h2> <p> Please enter this otp to signUp, OTP: ${body}</p>`,
        })
        console.log("mailInfo: ", info);
        
        return info
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;