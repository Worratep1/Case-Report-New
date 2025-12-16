// -------------------------------------------------------------
// 1) IMPORT LIBRARIES ที่ต้องใช้
// -------------------------------------------------------------

// ใช้สำหรับคุยกับฐานข้อมูล PostgreSQL ผ่าน pool
const pool = require("../config/db");

// ใช้สร้างไฟล์ Excel (.xlsx)
const ExcelJS = require("exceljs");

// -------------------------------------------------------------
// 2) ตั้งค่าขนาดของกราฟที่จะสร้าง (หน่วย: พิกเซล)
// -------------------------------------------------------------

// =============================================================
// 3) CONTROLLER: EXPORT DAILY REPORT
//    เส้นทางเรียก: GET /api/exportreport?date=YYYY-MM-DD
// =============================================================
exports.exportReport = async (req, res) => {
  try {
    const { date } = req.query;

    // ถ้าไม่ส่ง date มา ให้ตอบ 400 ทันที
    if (!date) {
      return res.status(400).json({
        message: "กรุณาระบุวันที่ เช่น ?date=2025-12-09",
      });
    }

    // ---------------------------------------------------------
    // 3.1 ดึง "จำนวนเคสทั้งหมด" ของวันนั้น
    // ---------------------------------------------------------
    const totalResult = await pool.query(
      `
      SELECT COUNT(*) AS total_cases
      FROM cases
      WHERE start_datetime::date = $1
      `,
      [date]
    );

    // แปลงค่าให้อยู่ในรูป number (ถ้าไม่มีเคสให้เป็น 0)
    const totalCases =
      totalResult?.rows?.length > 0
        ? Number(totalResult.rows[0].total_cases)
        : 0;

    // ---------------------------------------------------------
    // 3.2 ดึง "Game Issues Breakdown"
    //     จำนวนเคสแยกตาม product / game
    // ---------------------------------------------------------
    const gameResult = await pool.query(
      `
      SELECT 
        p.product_name AS game_name,
        COUNT(*) AS case_count
      FROM cases c
      JOIN products p ON c.product_Id = p.product_id
      WHERE c.start_datetime::date = $1
      GROUP BY p.product_name
      ORDER BY case_count DESC, p.product_name
      `,
      [date]
    );

    // ถ้า query ได้ให้ใช้ rows ถ้าไม่มีก็ให้เป็น array ว่าง
    const gameRows = Array.isArray(gameResult?.rows) ? gameResult.rows : [];

    // ---------------------------------------------------------
    // 3.3 ดึง "Status Summary"
    //     จำนวนเคสแยกตามสถานะ (Open / Onhold / Closed)
    // ---------------------------------------------------------
    const statusResult = await pool.query(
      `
      SELECT 
        s.status_name AS status,
        COUNT(*) AS case_count
      FROM cases c
      JOIN case_statuses s ON c.status_id = s.status_id
      WHERE c.start_datetime::date = $1
      GROUP BY s.status_name, s.status_id
        ORDER BY s.status_id ASC
      `,
      [date]
    );

    const statusRows = Array.isArray(statusResult?.rows) ? statusResult.rows : [];
    
    
    // ---------------------------------------------------------
    // 4. สร้างไฟล์ Excel และเพิ่มข้อมูลลงไปทีละส่วน
    // ---------------------------------------------------------

    // 4.1 สร้าง Workbook และ Worksheet ใหม่
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Daily Report");

    // 4.2 เขียนหัวรายงานด้านบน
    sheet.mergeCells("A1:B1"); // รวมเซลล์ A1 และ B1
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Daily Case Report";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };

    sheet.getCell("A2").value = `Date: ${date}`;
    sheet.getCell("A3").value = `Total Cases: ${totalCases}`;


      // ---------------------------------------------------------
    // 4.3 ส่วน Status Summary (แสดงเป็นข้อความล้วน) อยู่ด้านบน
    // ---------------------------------------------------------

    // เริ่มหัวข้อ Status Summary ที่บรรทัด 5
    const startRowForStatus = 5;

    sheet.getCell(`A${startRowForStatus}`).value = `Status Summary (${date})`;
    sheet.getCell(`A${startRowForStatus}`).font = { bold: true, size: 12 };

    // แถวหัวตารางของ Status
    const statusHeaderRowIndex = startRowForStatus + 2;
    const statusHeaderRow = sheet.getRow(statusHeaderRowIndex);
    statusHeaderRow.values = ["Status", "Cases"];
    statusHeaderRow.font = { bold: true };

    // เติมข้อมูลสถานะทีละแถว
    let statusRowIndex = statusHeaderRowIndex + 1;

    statusRows.forEach((row) => {
      sheet.getCell(`A${statusRowIndex}`).value = row.status;
      sheet.getCell(`B${statusRowIndex}`).value = Number(row.case_count);
      statusRowIndex++;
    });

    // แถวถัดไปหลังจบตาราง Status จะถูกใช้เป็นจุดเริ่มของ Game
    const nextRowAfterStatus = statusRowIndex;

    // ---------------------------------------------------------
    // 4.4 ส่วน Game Issues Breakdown อยู่ถัดจาก Status ลงมา
    // ---------------------------------------------------------

    // เว้นจาก Status ลงมาอีก 2 แถว
    const startRowForGame = nextRowAfterStatus + 2;

    sheet.getCell(`A${startRowForGame}`).value = `Game Issues Breakdown (${date})`;
    sheet.getCell(`A${startRowForGame}`).font = { bold: true, size: 12 };

    // แถวหัวของตาราง Game
    const headerRowIndex = startRowForGame + 2;
    const headerRow = sheet.getRow(headerRowIndex);
    headerRow.values = ["Game", "Cases"];
    headerRow.font = { bold: true };

    // เติมข้อมูลเกมทีละแถว
    let rowIndex = headerRowIndex + 1;

    gameRows.forEach((row) => {
      sheet.getCell(`A${rowIndex}`).value = row.game_name;
      sheet.getCell(`B${rowIndex}`).value = Number(row.case_count);
      rowIndex++;
    });

    // ปรับความกว้างคอลัมน์ให้พอดูได้ (ใช้ร่วมกันทั้ง Status + Game)
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 12;

    // ---------------------------------------------------------
    // 5. ส่งไฟล์ Excel กลับไปให้ Browser ดาวน์โหลด
    // ---------------------------------------------------------
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="daily-report-${date}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exportReport:", err);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการ export รายงาน",
      error: err.message,
    });
  }
};
