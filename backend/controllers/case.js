const pool = require("../config/db");

// --- timezone helper (Thai -> UTC) ---
const toUTC = (thaiDatetime) => {
  return new Date(thaiDatetime + "+07:00").toISOString();
};

// POST /api/cases


exports.createCase = async (req, res) => {
  const client = await pool.connect(); // ใช้ client สำหรับ Transaction
  try {
    const {
      start_datetime, end_datetime, product_id, // product_id เป็น Array [1, 2] จากหน้าบ้าน
      status_id, problem_id, description,
      requester_name, solution, solver, created_by,
    } = req.body;

    // 1) Validation (ปรับให้เช็ค Array)
    if (!start_datetime || !end_datetime || !Array.isArray(product_id) || product_id.length === 0 || 
        !status_id || !problem_id || !description || !requester_name || !solution || !solver) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    await client.query('BEGIN'); // --- เริ่มต้นบันทึกแบบกลุ่ม ---

    // 2) บันทึกลงตาราง cases (ลบ product_id ออกจาก Query นี้แล้ว)
    const caseResult = await client.query(
      `INSERT INTO cases (start_datetime, end_datetime, status_id, problem_id, description, requester_name, solution, solver, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING case_id`,
      [toUTC(start_datetime), toUTC(end_datetime), status_id, problem_id, description, requester_name, solution, solver, created_by ?? null]
    );

    const newCaseId = caseResult.rows[0].case_id;

    // 3) บันทึกลงตารางกลาง case_products (วนลูปตามจำนวน ID ที่ส่งมา)
    const productQueries = product_id.map(pId => 
      client.query("INSERT INTO case_products (case_id, product_id) VALUES ($1, $2)", [newCaseId, pId])
    );
    await Promise.all(productQueries);

    await client.query('COMMIT'); // --- ยืนยันการบันทึกทั้งหมด ---

    return res.status(201).json({ message: "สร้างเคสสำเร็จ", case_id: newCaseId });
  } catch (error) {
    await client.query('ROLLBACK'); // --- ถ้าพลาดแม้แต่นิดเดียว ให้ยกเลิกทั้งหมด ---
    console.error("Error creating case:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างเคส" });
  } finally {
    client.release();
  }
};

// ========================================
// GET /api/cases  → ดึงเคสทั้งหมด หรือ ดึงเคสตามวันที่  (รองรับรายเดือน)
// ========================================


exports.getCases = async (req, res) => {
  try {
    const { date, mode } = req.query;

    // 1) คงการเช็ครูปแบบวันที่ไว้ตามเดิม
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          message: "รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD (เช่น 2025-12-25)",
        });
      }
    }

    // 2) เตรียม Query หลักที่ JOIN กับตารางกลางและรวมชื่อ Services
    // ใช้ STRING_AGG เพื่อรวมชื่อเกม/ระบบ มาเป็นข้อความเดียวคั่นด้วยคอมม่า
    let baseQuery = `
      SELECT 
        c.*, 
        s.status_name, 
        pr.problem_name,
        STRING_AGG(p.product_name, ', ') AS product_names,
        ARRAY_AGG(cp.product_id) AS product_ids
      FROM cases c
      LEFT JOIN case_products cp ON c.case_id = cp.case_id
      LEFT JOIN products p ON cp.product_id = p.product_id
      LEFT JOIN case_statuses s ON c.status_id = s.status_id
      LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
    `;

    let whereClause = "";
    let params = [];

    // 3) จัดการเงื่อนไขการกรอง (Filtering Logic)
    if (date) {
      if (mode === "monthly") {
        // ดึงข้อมูลรายเดือนจนถึงวันที่เลือก
        whereClause = ` WHERE c.start_datetime::date >= date_trunc('month', $1::date)::date 
                        AND c.start_datetime::date <= $1::date `;
      } else {
        // ดึงข้อมูลเฉพาะวัน
        whereClause = ` WHERE c.start_datetime::date = $1 `;
      }
      params.push(date);
    }

    // 4) รวม Query เข้าด้วยกันพร้อม GROUP BY (จำเป็นต้องใช้เมื่อมี STRING_AGG)
    const finalQuery = `
      ${baseQuery}
      ${whereClause}
      GROUP BY c.case_id, s.status_name, pr.problem_name 
      ORDER BY c.start_datetime DESC
    `;

    const result = await pool.query(finalQuery, params);

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
    // ดึงข้อมูลเคสพร้อมกับรวม ID ของบริการที่เลือกไว้เป็น Array
    const result = await pool.query(
      `SELECT c.*, ARRAY_AGG(cp.product_id) as product_id 
       FROM cases c 
       LEFT JOIN case_products cp ON c.case_id = cp.case_id 
       WHERE c.case_id = $1 
       GROUP BY c.case_id`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "ไม่พบเคสที่ระบุ" });
    
    return res.status(200).json({ message: "ดึงข้อมูลเคสสำเร็จ", case: result.rows[0] });
  } catch (error) {
    console.error("Error getCaseById:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// ========================================
// DELETE /api/cases/:id  → ลบเคส ออกจากฐานข้อมูลจริงๆ
// ========================================

exports.deleteCase = async (req, res) => {
  const client = await pool.connect(); // ใช้ client เพื่อทำ Transaction
  try {
    const { id } = req.params;

    await client.query('BEGIN'); // เริ่มต้นการทำงานแบบกลุ่ม

    // 1. ลบข้อมูลในตารางกลางก่อน (กันเหนียวในกรณีไม่ได้ใส่ CASCADE)
    await client.query(`DELETE FROM case_products WHERE case_id = $1`, [id]);

    // 2. ลบข้อมูลในตารางหลัก
    const result = await client.query(
      `DELETE FROM cases WHERE case_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "ไม่พบเคสที่ระบุ" });
    }

    await client.query('COMMIT'); // ยืนยันการลบทั้งหมด

    return res.status(200).json({
      message: "ลบเคสสำเร็จ",
      case: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK'); // หากลบพลาดให้ยกเลิกทั้งหมด
    console.error("Error deleteCase:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบเคส" });
  } finally {
    client.release();
  }
};

// ========================================
// PUT /api/cases/:id  → อัปเดทเคส
// ========================================

exports.updateCase = async (req, res) => {
  const client = await pool.connect(); // ใช้ client สำหรับ Transaction
  try {
    const { id } = req.params;

    // 1. รับข้อมูลที่จะอัปเดตจาก req.body
    const {
      start_datetime,
      end_datetime,
      product_id, // รับเป็น Array [1, 2] จากหน้าบ้าน
      status_id,
      problem_id,
      description,
      requester_name,
      solution,
      solver,
      created_by,
    } = req.body;

    // --- ส่วนดักการกรอกข้อมูล (คงไว้ตามเดิมของคุณ) ---
    if (
      !start_datetime ||
      !end_datetime ||
      !Array.isArray(product_id) || product_id.length === 0 || // ปรับให้เช็ค Array
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
      return res.status(400).json({ message: "รายละเอียดปัญหายาวเกินกำหนด (สูงสุด 1000 ตัวอักษร)" });
    }
    if (solution.length > 1000) {
      return res.status(400).json({ message: "วิธีแก้ไขยาวเกินกำหนด (สูงสุด 1000 ตัวอักษร)" });
    }
    if (requester_name.length > 150 || solver.length > 150) {
      return res.status(400).json({ message: "ชื่อผู้แจ้งหรือผู้แก้ไขยาวเกินไป (สูงสุด 150 ตัวอักษร)" });
    }

    // เช็คเคสว่ามีอยู่จริงหรือไม่
    const checkcase = await client.query(`SELECT case_id FROM cases WHERE case_id = $1`, [id]);
    if (checkcase.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบเคสที่ระบุ" });
    }

    // เช็คตรรกะเวลา
    if (new Date(end_datetime + "+07:00") < new Date(start_datetime + "+07:00")) {
      return res.status(400).json({ message: "เวลาที่สิ้นสุดต้องไม่มาก่อนเวลาที่เริ่ม" });
    }

    // --- เริ่มต้นการบันทึกข้อมูล (Transaction) ---
    await client.query('BEGIN');

    // แปลงเวลาไทย -> UTC
    const startUTC = toUTC(start_datetime);
    const endUTC = toUTC(end_datetime);

    // 2. อัปเดตตารางหลัก (นำ product_id ออกจาก SQL SET เพราะลบไปแล้ว)
    await client.query(
      `UPDATE cases SET
          start_datetime = $1,
          end_datetime = $2,
          status_id = $3,
          problem_id = $4,
          description = $5,
          requester_name = $6,
          solution = $7,
          solver = $8,
          updated_at = NOW()
       WHERE case_id = $9`,
      [startUTC, endUTC, status_id, problem_id, description, requester_name, solution, solver, id]
    );

    // 3. จัดการตารางกลาง case_products (ลบของเก่าแล้วใส่ชุดใหม่)
    await client.query("DELETE FROM case_products WHERE case_id = $1", [id]);
    
    const productInserts = product_id.map(pId => 
      client.query("INSERT INTO case_products (case_id, product_id) VALUES ($1, $2)", [id, pId])
    );
    await Promise.all(productInserts);

    await client.query('COMMIT'); // ยืนยันการบันทึกทั้งหมด

    return res.status(200).json({ message: "อัปเดตเคสสำเร็จ" });

  } catch (error) {
    await client.query('ROLLBACK'); // ยกเลิกหากมีจุดไหนพลาด
    console.error("Error updateCase:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตเคส" });
  } finally {
    client.release();
  }
};