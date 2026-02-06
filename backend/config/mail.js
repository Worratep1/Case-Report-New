const nodemailer = require('nodemailer'); 
require('dotenv').config();

// 1. สร้าง Transporter เชื่อมต่อกับ Relay Server
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // พอร์ต 25 ไม่ต้องใช้ SSL
    tls: {
        rejectUnauthorized: false // ข้ามการเช็ค Certificate สำหรับ Relay ภายใน
    }
});

// 2. ตรวจสอบการเชื่อมต่อตอน Start Server
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ SMTP Relay Connection Error:", error.message);
    } else {
        console.log("✅ SMTP Relay: Connection is Ready");
    }
});

// 3. ปรับฟังก์ชัน sendMail ให้ส่งผ่าน SMTP ตรงๆ (ไม่ต้องแปลง base64 แล้ว)
async function sendMail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ ส่งเมลสำเร็จ! Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ SMTP Send Error:", error.message);
    throw error;
  }
}

module.exports = { sendMail }; 