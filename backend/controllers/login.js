const pool = require("../config/db");
const bcrypt = require("bcrypt"); // <- เพิ่มบรรทัดนี้
const jwt = require("jsonwebtoken")

exports.login = async (req, res) => {
  const { username, password } = req.body;  // <- เปลี่ยนเป็น password

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
  }

  try {
    //หา user จาก DB
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบชื่อผู้ใช้งานนี้" });
    }

    const user = result.rows[0];

    // เทียบ password (plain text) กับ password_hash ใน DB
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }


    const payload = {
      userId: user.user_id,
      username : user.username,
      email : user.email
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRES_IN || "1h"}
    )

    return res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        user_id: user.user_id, 
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email, 
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};
