const pool = require("../config/db");

// ----------------------------------------------------------
// 1. ดึงกลุ่มทั้งหมดพร้อมรายชื่อสมาชิก (READ)
//    GET /api/groups
// ----------------------------------------------------------

exports.getGroups = async (req, res) => {
  try {
    const query = `
      SELECT 
        rg.group_id, 
        rg.group_name, 
        rg.is_default,
        COALESCE(
          json_agg(
            json_build_object(
              'recipient_id', r.recipient_id,
              'name', r.name,
              'email', r.email
            )
          ) FILTER (WHERE r.recipient_id IS NOT NULL), '[]'
        ) AS members
      FROM recipients_groups rg
      LEFT JOIN group_members gm ON rg.group_id = gm.group_id
      LEFT JOIN recipients r ON gm.recipient_id = r.recipient_id
      GROUP BY rg.group_id
      ORDER BY rg.is_default DESC, rg.group_name ASC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({
      message: "ดึงข้อมูลกลุ่มสำเร็จ",
      groups: result.rows,
    });
  } catch (err) {
    console.error("Error getGroups:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่ม" });
  }
};

// ----------------------------------------------------------
// 2. สร้างกลุ่มใหม่และเพิ่มสมาชิก (CREATE)
//    POST /api/groups
// ----------------------------------------------------------

exports.createGroup = async (req, res) => {
  const { group_name, is_default, recipient_ids } = req.body;
  const client = await pool.connect();

  // --- [VALIDATION] ---
  if (!group_name || group_name.trim() === "") {
    return res.status(400).json({ message: "กรุณากรอกชื่อกลุ่ม" });
  }

  if (group_name.length > 100) {
    return res.status(400).json({ message: "ชื่อกลุ่มต้องไม่เกิน 100 ตัวอักษร" });
  }

  if (recipient_ids && !Array.isArray(recipient_ids)) {
    return res.status(400).json({ message: "รูปแบบรายชื่อสมาชิกไม่ถูกต้อง" });
  }

  try {
    await client.query('BEGIN'); // เริ่ม Transaction

    // 1) เช็คว่ามีชื่อกลุ่มนี้อยู่แล้วหรือยัง
    const checkDuplicate = await client.query(
      "SELECT group_id FROM recipients_groups WHERE group_name = $1",
      [group_name.trim()]
    );
    if (checkDuplicate.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "ชื่อกลุ่มนี้มีอยู่ในระบบแล้ว" });
    }

    // 2) ถ้ากลุ่มนี้ถูกตั้งเป็น default ให้เคลียร์กลุ่มอื่นก่อน
    if (is_default) {
      await client.query('UPDATE recipients_groups SET is_default = FALSE');
    }

    // 3) เพิ่มกลุ่มใหม่
    const groupRes = await client.query(
      'INSERT INTO recipients_groups (group_name, is_default) VALUES ($1, $2) RETURNING group_id',
      [group_name.trim(), is_default || false]
    );
    const newGroupId = groupRes.rows[0].group_id;

    // 4) เพิ่มสมาชิกเข้าตารางเชื่อม (ถ้ามี)
    if (recipient_ids && recipient_ids.length > 0) {
      const insertPromises = recipient_ids.map(rId => 
        client.query('INSERT INTO group_members (group_id, recipient_id) VALUES ($1, $2)', [newGroupId, rId])
      );
      await Promise.all(insertPromises);
    }

    await client.query('COMMIT'); // ยืนยันการบันทึก
    return res.status(201).json({ message: "สร้างกลุ่มและเพิ่มสมาชิกสำเร็จ" });
  } catch (err) {
    await client.query('ROLLBACK'); // ยกเลิกหากพลาด
    console.error("Error createGroup:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างกลุ่ม" });
  } finally {
    client.release();
  }
};

// ----------------------------------------------------------
// 3. แก้ไขกลุ่มและสมาชิก (UPDATE)
//    PUT /api/groups/:id
// ----------------------------------------------------------
exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const { group_name, is_default, recipient_ids } = req.body;
  const client = await pool.connect();

  // --- [VALIDATION] ---
  if (!group_name || group_name.trim() === "") {
    return res.status(400).json({ message: "กรุณากรอกชื่อกลุ่ม" });
  }

  if (group_name.length > 100) {
    return res.status(400).json({ message: "ชื่อกลุ่มต้องไม่เกิน 100 ตัวอักษร" });
  }

  try {
    await client.query('BEGIN');

    // 1) เช็คว่ากลุ่มมีตัวตนจริงไหม
    const checkExist = await client.query("SELECT group_id FROM recipients_groups WHERE group_id = $1", [id]);
    if (checkExist.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "ไม่พบกลุ่มที่ต้องการแก้ไข" });
    }

    // 2) เช็คชื่อซ้ำ (ต้องไม่ซ้ำกับไอดีอื่น)
    const checkName = await client.query(
      "SELECT group_id FROM recipients_groups WHERE group_name = $1 AND group_id <> $2",
      [group_name.trim(), id]
    );
    if (checkName.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "ชื่อกลุ่มนี้มีผู้อื่นใช้งานแล้ว" });
    }

    if (is_default) {
      await client.query('UPDATE recipients_groups SET is_default = FALSE WHERE group_id <> $1', [id]);
    }

    // 3) อัปเดตข้อมูลกลุ่ม
    await client.query(
      'UPDATE recipients_groups SET group_name = $1, is_default = $2 WHERE group_id = $3',
      [group_name.trim(), is_default, id]
    );

    // 4) อัปเดตสมาชิก (ลบของเก่าแล้วใส่ใหม่)
    await client.query('DELETE FROM group_members WHERE group_id = $1', [id]);
    if (recipient_ids && Array.isArray(recipient_ids) && recipient_ids.length > 0) {
      const inserts = recipient_ids.map(rId => 
        client.query('INSERT INTO group_members (group_id, recipient_id) VALUES ($1, $2)', [id, rId])
      );
      await Promise.all(inserts);
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: "อัปเดตกลุ่มสำเร็จ" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updateGroup:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตกลุ่ม" });
  } finally {
    client.release();
  }
};

// ----------------------------------------------------------
// 4. ลบกลุ่ม (DELETE)
//    DELETE /api/groups/:id
// ----------------------------------------------------------
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    // เช็คว่ามีกลุ่มอยู่จริงก่อนลบ
    const check = await pool.query("SELECT group_id FROM recipients_groups WHERE group_id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบกลุ่มที่ต้องการลบ" });
    }

    // ON DELETE CASCADE จะจัดการลบสมาชิกใน group_members ให้เอง
    await pool.query('DELETE FROM recipients_groups WHERE group_id = $1', [id]);
    return res.status(200).json({ message: "ลบกลุ่มสำเร็จ" });
  } catch (err) {
    console.error("Error deleteGroup:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบกลุ่ม" });
  }
};