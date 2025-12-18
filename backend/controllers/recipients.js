const pool = require("../config/db");

const validateEmail = (email) => {
  const validmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validmail.test(email);
};

// ----------------------------------------------------------
// 1. เพิ่มรายชื่อผู้รับ (CREATE)
//    POST /api/recipients
// ----------------------------------------------------------
exports.createRecipient = async (req, res) => {
  const { email, name, is_active } = req.body;

  // เช็คว่ากรอก email มั้ย
  if (!email) {
    return res.status(400).json({ message: "กรุณากรอกอีเมล" });
  }

  // เช็คว่าได้ใส่รูปเเบบเมล์ถูกต้องไหม
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
  }

  if (email.length > 255)
    return res
      .status(400)
      .json({ message: "Email ยาวเกินไป (สูงสุด 150 ตัวอักษร)" });

  if (name && name.length > 150)
    return res
      .status(400)
      .json({ message: "ชื่อยาวเกินไป (สูงสุด 150 ตัวอักษร)" });

  try {
    // เช็คว่า email นี้มีอยู่แล้วหรือยัง
    const check = await pool.query(
      "SELECT * FROM recipients WHERE email = $1",
      [email]
    );

    if (check.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "อีเมลนี้มีอยู่ในรายชื่อผู้รับแล้ว" });
    }

    // เพิ่มข้อมูลใหม่
    const result = await pool.query(
      `INSERT INTO recipients (email, name, is_active)
       VALUES ($1, $2, COALESCE($3, TRUE))
       RETURNING recipient_id, email, name, is_active`,
      [email, name || null, is_active]
    );

    return res.status(201).json({
      message: "เพิ่มผู้รับอีเมลสำเร็จ",
      recipient: result.rows[0],
    });
  } catch (err) {
    console.error("Error createRecipient:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการเพิ่มผู้รับอีเมล" });
  }
};

// ----------------------------------------------------------
// 2. ดึงรายชื่อผู้รับทั้งหมด (READ List)
//    GET /api/recipients
// ----------------------------------------------------------
exports.getRecipients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT recipient_id, email, name, is_active
       FROM recipients
       ORDER BY recipient_id ASC`
    );

    return res.status(200).json({
      message: "ดึงข้อมูลผู้รับอีเมลสำเร็จ",
      recipients: result.rows,
    });
  } catch (err) {
    console.error("Error getRecipients:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้รับอีเมล" });
  }
};

// ----------------------------------------------------------
// 3. ดึงข้อมูลผู้รับตาม id (READ Detail)
//    GET /api/recipients/:id
// ----------------------------------------------------------
exports.getRecipientById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT recipient_id, email, name, is_active
       FROM recipients
       WHERE recipient_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้รับที่ระบุ" });
    }

    return res.status(200).json({
      message: "ดึงข้อมูลผู้รับสำเร็จ",
      recipient: result.rows[0],
    });
  } catch (err) {
    console.error("Error getRecipientById:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้รับอีเมล" });
  }
};

// ----------------------------------------------------------
// 4. แก้ไขข้อมูลผู้รับ (UPDATE)
//    PUT /api/recipients/:id
// ----------------------------------------------------------
exports.updateRecipient = async (req, res) => {
  const { id } = req.params;
  const { email, name, is_active } = req.body;

  try {
    // 1) เช็คว่ามีผู้รับนี้จริงไหม
    const check = await pool.query(
      "SELECT * FROM recipients WHERE recipient_id = $1",
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้รับที่ต้องการแก้ไข" });
    }

    // 2) เช็ค email ซ้ำกับคนอื่นไหม (ถ้ามีส่ง email มา)
    if (email) {
      const dup = await pool.query(
        `SELECT recipient_id, email
         FROM recipients
         WHERE email = $1 AND recipient_id <> $2`,
        [email, id]
      );

      if (dup.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "อีเมลนี้มีอยู่ในรายชื่อผู้รับแล้ว" });
      }
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
    }

    // 3) ใช้ค่าเดิมถ้าไม่ได้ส่งมา (partial update)
    const old = check.rows[0];
    const newEmail = email || old.email;
    const newName = name !== undefined ? name : old.name;
    const newIsActive =
      is_active !== undefined && is_active !== null ? is_active : old.is_active;

    const updated = await pool.query(
      `UPDATE recipients
       SET email = $1,
           name = $2,
           is_active = $3
       WHERE recipient_id = $4
       RETURNING recipient_id, email, name, is_active`,
      [newEmail, newName, newIsActive, id]
    );

    return res.status(200).json({
      message: "อัปเดตข้อมูลผู้รับสำเร็จ",
      recipient: updated.rows[0],
    });
  } catch (err) {
    console.error("Error updateRecipient:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้รับอีเมล" });
  }
};

// ----------------------------------------------------------
// 5. ลบผู้รับออกจากฐานข้อมูล (DELETE แบบ Hard Delete)
//    DELETE /api/recipients/:id
// ----------------------------------------------------------
exports.deleteRecipient = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      "SELECT * FROM recipients WHERE recipient_id = $1",
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้รับที่ต้องการลบ" });
    }

    const deleted = await pool.query(
      "DELETE FROM recipients WHERE recipient_id = $1 RETURNING recipient_id, email, name",
      [id]
    );

    return res.status(200).json({
      message: "ลบผู้รับสำเร็จ",
      recipient: deleted.rows[0],
    });
  } catch (err) {
    console.error("Error deleteRecipient:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบผู้รับอีเมล" });
  }
};
