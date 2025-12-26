const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// ----------------------------------------------------------
// 1. สมัครสมาชิก (CREATE)
// ----------------------------------------------------------


 const validateEmail = (email) => {
  const validmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return validmail.test(email);

};


exports.register = async (req, res) => {
  //  รับ password ปกติ ไม่ใช่ password_hash
  const { username, password, first_name, last_name, email } = req.body;
  //  เช็คข้อมูลให้ครบ
  if (!username || !password || !first_name || !last_name || !email) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  if (username.length > 100 ){
    return res.status(400).json({
      message:"Username ยาวเกินไป (สูงสุด 100 ตัวอักษร)"
    })
  }

  if (first_name.length > 100){
    return res.status(400).json({
      message:"Firstname ยาวเกินไป (สูงสุด 100 ตัวอักษร)"
    })
  }

if (last_name.length> 100){
  return res.status(400).json({
    message:"Lastname ยาวเกินไป (สูงสุด 100 ตัวอักษร) "
  })
}

if (password.length > 64){
  return res.status(400).json({
    message:"รหัสผ่านยาวเกินไป (สูงสุด 64 ตัวอักษร)"
  })
}
if (!validateEmail(email)) {
    return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
  }

  try {
    // 1) เช็คว่ามี username หรือ email นี้ในระบบแล้วหรือยัง
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      // แยก message ให้สวยก็ได้ แต่เอาแบบง่ายก่อน
      return res
        .status(400)
        .json({ message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว" });
    }

    // 2) hash password ก่อนเก็บ
    const password_hash = await bcrypt.hash(password, 10);

    // 3) INSERT ผู้ใช้ใหม่
    const newUser = await pool.query(
      `INSERT INTO users (username, password_hash, first_name, last_name, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, username, first_name, last_name, email, is_active, created_at`,
      [username, password_hash, first_name, last_name, email]
    );

    return res
      .status(201)
      .json({ message: "สมัครสมาชิกสำเร็จ", user: newUser.rows[0] });
  } catch (err) {
    console.error("Error in register:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้" });
  }
};

// ----------------------------------------------------------
// 2. ดึงรายชื่อสมาชิกทั้งหมด (READ - list)
//    GET /api/users
// ----------------------------------------------------------

exports.getuser = async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT user_id, username, first_name, last_name , email FROM users ORDER BY user_id ASC"
    );

    return res.status(200).json({
      users: users.rows,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
    });
  } catch (err) {
    console.error("Error in getuser", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก" });
  }
};

// ----------------------------------------------------------
// 3. ดึงข้อมูลสมาชิกตาม id (READ - detail)
//    GET /api/users/:id
// ----------------------------------------------------------
exports.getUserById = async (req, res) => {
  const { id } = req.params; // รับจาก URL

  try {
    const result = await pool.query(
      `SELECT user_id, username, first_name, last_name, email, is_active, created_at
       FROM users
       WHERE user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบสมาชิกที่ระบุ" });
    }

    return res.status(200).json({
      message: "ดึงข้อมูลสมาชิกสำเร็จ",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error in getUserById:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก" });
  }
};

// ----------------------------------------------------------
// 4. แก้ไขข้อมูลสมาชิก (UPDATE)
//    PUT /api/users/:id     
// ----------------------------------------------------------
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  const { username, password, first_name, last_name, email, is_active } = req.body;

  try {
    // 1) เช็คว่ามี user นี้จริงไหม
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบสมาชิกที่ต้องการแก้ไข" });
    }

    // 2) เช็ค username / email ซ้ำกับคนอื่นไหม
    const duplicate = await pool.query(
      `SELECT user_id, username, email
       FROM users
       WHERE (username = $1 OR email = $2)
         AND user_id <> $3`,
      [username, email, id]
    );
  
    //เช็ครูปแบบอีเมล (ถ้ามีการส่ง email มาแก้ไข)
  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
  }

    if (duplicate.rows.length > 0) {
      const dup = duplicate.rows[0];

      // แยกข้อความ error ให้เข้าใจง่าย ป้งกันชื่อซ้ำ
      if (dup.username === username && dup.email === email) {
        return res.status(400).json({
          message: "ไม่สามารถแก้ไขได้: ชื่อผู้ใช้และอีเมลนี้มีอยู่ในระบบแล้ว",
        });
      } else if (dup.username === username) {
        return res.status(400).json({
          message: "ไม่สามารถแก้ไขได้: ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว",
        });
      } else if (dup.email === email) {
        return res.status(400).json({
          message: "ไม่สามารถแก้ไขได้: อีเมลนี้มีอยู่ในระบบแล้ว",
        });
      }
    }

    // 3) เริ่มจากใช้ password_hash เดิมใน DB ก่อน
    let password_hash = checkUser.rows[0].password_hash;

    // ถ้ามี password ใหม่ ส่งมาจริง ให้ hash ใหม่
    if (password && password.trim() !== "") {
      password_hash = await bcrypt.hash(password, 10);
    }

    // 4) อัปเดตข้อมูล
    const updated = await pool.query(
      `UPDATE users
       SET username  = $1,
           password_hash = $2,
           first_name = $3,
           last_name  = $4,
           email      = $5,
           is_active  = $6
       WHERE user_id = $7
       RETURNING user_id, username, first_name, last_name, email, is_active`,
      [username, password_hash, first_name, last_name, email, is_active, id]
    );

    return res.status(200).json({
      message: "อัปเดตข้อมูลสำเร็จ",
      user: updated.rows[0],
    });

  } catch (err) {
    console.error("Error updateUser:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลสมาชิก" });
  }
};

// ----------------------------------------------------------
// 5. ลบสมาชิกออกจากฐานข้อมูล (DELETE แบบ Hard Delete)
//    DELETE /api/users/:id
// ----------------------------------------------------------

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบสมาชิกที่ระบุ" });
    }
    const deleted = await pool.query(
      "DELETE FROM users WHERE user_id=$1 RETURNING *",
      [id]
    );
    return res.status(200).json({
      message: "ลบสมาชิกสำเร็จ",
      user: deleted.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบสมาชิก" });
  }
};
