const transporter = require("../config/mail");

exports.sendDailyReport = async (req, res) => {
  try {
    let { toEmails, subject, body } = req.body;

    // --- ส่วนจัดการ Email Recipients (เหมือนเดิม) ---
    if (typeof toEmails === "string") {
      try { toEmails = JSON.parse(toEmails); } 
      catch { toEmails = toEmails.split(",").map((e) => e.trim()).filter(Boolean); }
    }

    if (!toEmails || !Array.isArray(toEmails) || toEmails.length === 0) {
      return res.status(400).json({ message: "กรุณาใส่อีเมล์ผู้รับอย่างน้อย 1 คน" });
    }

    // --- 1. จัดการแยกไฟล์ (New Logic) ---
    const attachmentsList = [];
    let reportImageFile = null;

    // ตรวจสอบไฟล์ที่ส่งมาจาก Multer (รองรับทั้ง upload.fields หรือ upload.any)
    const files = req.files;
    
    if (files) {
      // กรณีใช้ upload.fields() ใน Router
      const screenshotFiles = files.reportImage || [];
      const regularAttachments = files.attachments || [];

      // เก็บรูป Screenshot
      if (screenshotFiles.length > 0) {
        reportImageFile = screenshotFiles[0];
      }

      // เก็บไฟล์แนบปกติ
      regularAttachments.forEach(file => {
        attachmentsList.push({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
        });
      });
    }

    // --- 2. สร้าง HTML Body และฝังรูปภาพ (CID) ---
    const screenshotCid = "report_screenshot_cid"; // ID สำหรับอ้างอิงรูปใน HTML
    
  let htmlContent = `<div style="font-family: sans-serif;">`;
    // ถ้ามีรูปที่แคปมาจาก Frontend ให้ใส่ลงใน HTML
    if (reportImageFile) {
      htmlContent += `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: inline-block;">
          <img src="cid:${screenshotCid}" alt="Report Screenshot" style="display: block; max-width: 100%; height: auto;" />
        </div>
      `;
      
      // เพิ่มรูป Screenshot ลงในรายการไฟล์แนบพร้อมระบุ CID
      attachmentsList.push({
        filename: 'report-screenshot.png',
        content: reportImageFile.buffer,
        cid: screenshotCid // ต้องตรงกับ cid ในแท็ก <img>
      });
    }

    // --- 3. ส่งเมลออกไป ---
    const mailOptions = {
      from: `<${process.env.SMTP_USER}>`,
      to: toEmails.join(","),
      subject: subject || "Daily Report Summary",
      html: htmlContent,
      attachments: attachmentsList, //  รวมทั้งไฟล์แนบปกติและรูป Screenshot
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "ส่งอีเมลสำเร็จแล้ว" });

  } catch (err) {
    console.error("Error sending email :", err);
    return res.status(500).json({
      message: "ส่งอีเมล์ไม่สำเร็จ",
      error: err.message,
    });
  }
};