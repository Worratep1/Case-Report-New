const pool = require("../config/db");

// --- timezone helper (Thai -> UTC) ---
const toUTC = (thaiDatetime) => {
  return new Date(thaiDatetime + "+07:00").toISOString();
};

// POST /api/cases
exports.createCase = async (req, res) => {
  try {
    const {
      start_datetime,
      end_datetime,
      product_id,
      status_id,
      problem_id,
      description,
      requester_name,
      solution,
      solver,
      created_by,
    } = req.body;

    // 1) ตรวจให้ครบ
    if (
      !start_datetime ||
      !end_datetime ||
      !product_id ||
      !status_id ||
      !problem_id ||
      !description ||
      !requester_name ||
      !solution ||
      !solver
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    if (description.length > 1000) {
      return res.status(400).json({
        message: "ลายละเอียดปัญหายาวเกินกำหนด (สูงสุด 1000 ตัวอักษร)",
      });
    }
    if (solution.length > 1000) {
      return res.status(400).json({
        message: "วิธีแก้ไขยาวเกินกำหนด (สูงสุด 1000 ตัวอักษร)",
      });
    }
    if (requester_name.length > 150 || solver.length > 150) {
      return res.status(400).json({
        message: "ชื่อผู้แจ้งหรือผู้แก้ไขยาวเกินไป (สูงสุด 150 ตัวอักษร)",
      });
    }

    // แปลงเวลาไทย -> UTC
    const startUTC = toUTC(start_datetime);
    const endUTC = toUTC(end_datetime);

    const result = await pool.query(
      `
      INSERT INTO cases (
        start_datetime,
        end_datetime,
        product_id,
        status_id,
        problem_id,
        description,
        requester_name,
        solution,
        solver,
        created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING
        case_id,
        start_datetime,
        end_datetime,
        product_id,
        status_id,
        problem_id,
        description,
        requester_name,
        solution,
        solver,
        created_by,
        created_at
        
      `,
      [
        startUTC,
        endUTC,
        product_id,
        status_id,
        problem_id,
        description,
        requester_name,
        solution,
        solver,
        created_by ?? null,
      ]
    );

    const newCase = result.rows[0];

    return res.status(201).json({
      message: "สร้างเคสสำเร็จ",
      case: newCase,
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างเคส" });
  }
};

// ========================================
// GET /api/cases  → ดึงเคสทั้งหมด หรือ ดึงเคสตามวันที่  (รองรับรายเดือน)
// ========================================

exports.getCases = async (req, res) => {
  try {
    const { date, mode } = req.query;

    let result;

    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; //YYYY-MM-DD
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          message:
            "รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD (เช่น 2025-12-25)",
        });
      }
    }

    if (date) {
      if (mode === "monthly") {
        // ดึงข้อมูลตั้งแต่ "วันที่ 1 ของเดือนนั้น" จนถึง "วันที่เลือก"

        result = await pool.query(
          `
          SELECT *
          FROM cases
          WHERE start_datetime::date >= date_trunc('month', $1::date)::date
            AND start_datetime::date <= $1::date
          ORDER BY start_datetime DESC
          `,
          [date]
        );
      } else {
        // กรณีระบุวันที่ เเสดงของวันนั้นที่เลือก
        result = await pool.query(
          `
        SELECT *
        FROM cases
        WHERE start_datetime::date = $1
        ORDER BY start_datetime DESC
        `,
          [date]
        );
      }
    } else {
      // กรณีดูทั้งหมด (ไม่ใส่วันที่)
      result = await pool.query(
        `
        SELECT *
        FROM cases
        ORDER BY start_datetime DESC 
        `
      );
    }

    return res.status(200).json({
      message: "ดึงข้อมูลเคสสำเร็จ",
      cases: result.rows,
    });
  } catch (error) {
    console.error("Error getCases:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลเคส" });
  }
};

// ========================================
// GET /api/cases/:id  → ดูรายละเอียดเคสทีละอัน
// ========================================

exports.getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM cases
      WHERE case_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบเคสที่ระบุ" });
    }

    return res.status(200).json({
      message: "ดึงข้อมูลเคสสำเร็จ",
      case: result.rows[0],
    });
  } catch (error) {
    console.error("Error getCaseById:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลเคส" });
  }
};

// ========================================
// DELETE /api/cases/:id  → ลบเคส ออกจากฐานข้อมูลจริงๆ
// ========================================

exports.deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    //เช็คเคสว่ามีในระบบหรือไม่
    const checkcase = await pool.query(
      `DELETE FROM cases WHERE case_id = $1 RETURNING *`,
      [id]
    );
    if (checkcase.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบเคสที่ระบุ" });
    }
    return res.status(200).json({
      message: "ลบเคสสำเร็จ",
      case: checkcase.rows[0],
    });
  } catch (error) {
    console.error("Error deleteCase:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบเคส" });
  }
};

// ========================================
// PUT /api/cases/:id  → อัปเดทเคส
// ========================================

exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. รับข้อมูลที่จะอัปเดตจาก req.body (created_by ถูกดึงมาแต่ไม่ถูกใช้ใน SQL SET)
    const {
      start_datetime,
      end_datetime,
      product_id,
      status_id,
      problem_id,
      description,
      requester_name,
      solution,
      solver,
      created_by,
    } = req.body;

    if (
      !start_datetime ||
      !end_datetime ||
      !product_id ||
      !status_id ||
      !problem_id ||
      !description ||
      !requester_name ||
      !solution ||
      !solver
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    // 2) ตรวจสอบความยาวตัวอักษร
    if (description.length > 1000) {
      return res.status(400).json({
        message: "รายละเอียดปัญหายาวเกินกำหนด (สูงสุด 1000 ตัวอักษร)",
      });
    }
    if (solution.length > 1000) {
      return res.status(400).json({
        message: "วิธีแก้ไขยาวเกินกำหนด (สูงสุด 1000 ตัวอักษร)",
      });
    }
    if (requester_name.length > 150 || solver.length > 150) {
      return res.status(400).json({
        message: "ชื่อผู้แจ้งหรือผู้แก้ไขยาวเกินไป (สูงสุด 150 ตัวอักษร)",
      });
    }

    // 2. [Optional] ตรวจสอบว่าเคสมีอยู่จริงหรือไม่
    const checkcase = await pool.query(
      `SELECT case_id FROM cases WHERE case_id = $1`,
      [id]
    );
    if (checkcase.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบเคสที่ระบุ" });
    }

    if (
      new Date(end_datetime + "+07:00") < new Date(start_datetime + "+07:00")
    ) {
      return res.status(400).json({
        message: "เวลาที่สิ้นสุดต้องไม่มาก่อนเวลาที่เริ่ม",
      });
    }

    // แปลงเวลาไทย -> UTC
    const startUTC = toUTC(start_datetime);
    const endUTC = toUTC(end_datetime);

    // 3. 🎯 ทำการอัปเดตข้อมูลในฐานข้อมูล (9 fields + updated_at)
    const result = await pool.query(
      `
            UPDATE cases SET
                start_datetime = $1,
                end_datetime = $2,
                product_id = $3,
                status_id = $4,
                problem_id = $5,
                description = $6,
                requester_name = $7,
                solution = $8,
                solver = $9 ,
                updated_at = NOW()
                
            WHERE case_id = $10   
            RETURNING *;
            `,

      [
        startUTC, // $1
        endUTC, // $2
        product_id, // $3
        status_id, // $4
        problem_id, // $5
        description, // $6
        requester_name, // $7
        solution, // $8
        solver, // $9
        id, //  $10
      ]
    );

    return res.status(200).json({
      message: "อัปเดตเคสสำเร็จ",
      case: result.rows[0],
    });
  } catch (error) {
    console.error("Error updateCase:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดทเคส" });
  }
};
