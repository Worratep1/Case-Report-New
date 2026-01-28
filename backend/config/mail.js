const { google } = require('googleapis');
const nodemailer = require('nodemailer'); 
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI 
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

// ฟังก์ชันสำหรับจำลองการ "Verify" การเชื่อมต่อ
const verifyConnection = async () => {
    try {
        await gmail.users.getProfile({ userId: 'me' });
        console.log("✅ Gmail API: Connection is Ready to Send Emails");
    } catch (error) {
        console.log("❌ Gmail API Connection Error:", error.message);
    }
};

verifyConnection();

// ฟังก์ชันส่งเมลเวอร์ชันรองรับไฟล์แนบและรูปภาพ (CID)
async function sendMail({ to, subject, html, attachments }) {
  try {
    console.log(`>>> [1/3] เริ่มแพ็กเมลไปที่: ${to}`); //
    const tempTransporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix' });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments,
    };

    const info = await tempTransporter.sendMail(mailOptions);
    
    console.log(">>> [2/3] กำลังแปลงข้อมูลไฟล์แนบ/เนื้อหา..."); //
    const rawMessage = await new Promise((resolve, reject) => {
    let chunks = [];
    info.message.on('data', chunk => {
        chunks.push(chunk);
        console.log(`รับข้อมูลแล้ว ${chunks.length} ก้อน`); // เช็คว่ามีข้อมูลวิ่งไหม
    });
    info.message.on('end', () => {
        console.log("อ่าน Stream เสร็จสมบูรณ์");
        resolve(Buffer.concat(chunks));
    });
    info.message.on('error', reject);
    });

    const encodedMessage = rawMessage
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log(">>> [3/3] กำลังยิงไป Gmail API (Port 443)..."); //
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
    
    console.log("✅ ส่งเมลสำเร็จ! Gmail ID:", response.data.id); //
    return response;
  } catch (error) {
    // พ่น Error แบบละเอียดออกมาดูว่าติดที่ Google หรือติดที่โค้ดเรา
    console.error("❌ Gmail API Send Error:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { sendMail };