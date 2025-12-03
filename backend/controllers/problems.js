const pool =require("../config/db");

// GET /api/problems

exports.getproblems=async(req,res)=>{
  try {
    const result = await pool.query("SELECT * FROM case_problems ORDER BY problem_id");
    return res.status(200).json({
        message: "ดึงข้อมูลปัญหาสำเร็จ",
        problems: result.rows,
        });
    } catch (error) {
    console.error("Error getpromblems:", error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลปัญหา" });
  }
};