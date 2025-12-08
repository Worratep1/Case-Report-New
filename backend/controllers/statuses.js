const pool = require("../config/db");

exports.getStatuses = async (req, res) => {
  try {
    
    const result = await pool.query("SELECT * FROM case_statuses ORDER BY status_id");
    return res.status(200).json({
      message: "ดึงข้อมูลสถานะสำเร็จ",
      statuses: result.rows,
    });
  }
    catch (error) {
    console.error("Error getStatuses:", error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถานะ" });
  }
};