const transporter = require("../config/mail");


exports.sendDailyReport = async (req, res) => {
  try {
    let { toEmails, subject, body } = req.body;

    if (typeof toEmails === "string") {
      try {
        // ถ้าเป็น JSON string
        toEmails = JSON.parse(toEmails);
      } catch {
        // ถ้าไม่ใช่ JSON ก็ลอง split ด้วย , แทน
        toEmails = toEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
      }
    }

    // เช็คว่าได้ใส่เมลมาไหม
    if (!toEmails || !Array.isArray(toEmails) || toEmails.length === 0) {
      return res.status(400).json({
        message: "กรุณาใส่อีเมล์ผู้รับอย่างน้อย 1 คน",
      });
    }



    const files = req.files || [];
    const attachments = files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    }));

    // ---------- 3) ส่งเมล ----------
    const mailOptions = {
      from: `"" <${process.env.SMTP_USER}>`,
      to: toEmails.join(","), // array -> string "a@..,b@..."
      subject: subject || "",
      text: body || "",
      attachments, // // แนบไฟล์เข้าไป
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "ส่งอีเมลสำเร็จแล้ว ",
    });
  } catch (err) {
    console.error("Error sending email :", err);
    return res.status(500).json({
      message: "ส่งอีเมล์ไม่สำเร็จ",
      error: err.message,
    });
  }
};
