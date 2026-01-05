const nodemailer = require("nodemailer")

const transporter =nodemailer.createTransport({
    host : process.env.SMTP_HOST ,
    port : Number(process.env.SMTP_PORT),
    secure: false ,
    auth : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS,
    },
})

// ถ้ามีปัญหาเรื่อง login หรือ port มันจะ log error ที่นี่
transporter.verify((error , success)=>{
    if (error){
        console.log("SMTP connection error:", error)
    }
    else {
        console.log(" SMTP Server is ready to take messages " , success)
    }
}
) 

module.exports = transporter;