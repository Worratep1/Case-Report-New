
const pool = require("../config/db");
const ExcelJS = require("exceljs");

const formatThaiDate = (dateStr) => {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split('-');
  // วัน/เดือน/ปี ค.ศ. (เช่น 19/12/2025)
  return `${day}/${month}/${year}`;
};

// โชว์ช่วงเวลาวันที่-วันที่เลือก
const getReportRangeLabel = (dateStr, mode) => {
  if (mode !== 'monthly') return formatThaiDate(dateStr);
  const [year, month, day] = dateStr.split('-');
  return `01/${month}/${year} - ${day}/${month}/${year}`;
};

exports.exportReport = async (req, res) => {
  try {
    const { date, mode, status, search } = req.query; // 1. รับค่าเพิ่ม

    if (!date) {
      return res.status(400).json({
        message: "กรุณาระบุวันที่ เช่น ?date=2025-12-09",
      });
    }

    let conditions = [];
    let values = [date]; // $1 คือ date เสมอ

  
    if (mode === "monthly") {
      conditions.push("c.start_datetime::date >= date_trunc('month', $1::date)::date AND c.start_datetime::date <= $1::date");
    } else {
      conditions.push("c.start_datetime::date = $1");
    }

    // (ถ้าเลือก all หรือไม่ส่งมา จะไม่กรอง)
    if (status && status !== "all") {
      values.push(status);
      conditions.push(`LOWER(s.status_name) = LOWER($${values.length})`);
    }

    //  เงื่อนไข Search (ค้นหาจากชื่อเกม)
  if (search) {
      values.push(`%${search}%`);
      const idx = `$${values.length}`;
      // ค้นหาใน: ชื่อเกม OR ชื่อปัญหา OR รายละเอียด
      conditions.push(`(p.product_name ILIKE ${idx} OR pr.problem_name ILIKE ${idx})`);
    }

  

    const finalWhereClause = conditions.join(" AND ");

    // ---------------------------------------------------------
    // 3.1 ดึง "จำนวนเคสทั้งหมด" (ใส่ JOIN เพื่อให้กรอง Status/Game ได้)
    // ---------------------------------------------------------
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total_cases 
       FROM cases c
       JOIN products p ON c.product_Id = p.product_id
       JOIN case_statuses s ON c.status_id = s.status_id
       LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
       WHERE ${finalWhereClause}`,
      values
    );
    const totalCases = totalResult?.rows?.length > 0 ? Number(totalResult.rows[0].total_cases) : 0;

    // ---------------------------------------------------------
    // 3.2 ดึง Game Breakdown แยก Status
    // ---------------------------------------------------------
    const gameResult = await pool.query(
      `
      SELECT 
        p.product_name AS game_name,
        s.status_name AS status,
        COUNT(*) AS case_count,
        COALESCE(SUM(EXTRACT(EPOCH FROM (c.end_datetime - c.start_datetime)) / 60), 0) AS total_minutes
      FROM cases c
      JOIN products p ON c.product_Id = p.product_id
      JOIN case_statuses s ON c.status_id = s.status_id
      LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
      WHERE ${finalWhereClause}
      GROUP BY p.product_name, s.status_name
      ORDER BY total_minutes DESC, case_count DESC
      `,
      values
    );
    const gameRows = Array.isArray(gameResult?.rows) ? gameResult.rows : [];

    // ---------------------------------------------------------
    // 3.3 ดึง "Status Summary"
    // ---------------------------------------------------------


    const statusResult = await pool.query(
      `
      SELECT s.status_name AS status, COUNT(*) AS case_count
      FROM cases c
      JOIN case_statuses s ON c.status_id = s.status_id
      JOIN products p ON c.product_Id = p.product_id 
      LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
      WHERE ${finalWhereClause}
      GROUP BY s.status_name, s.status_id
      ORDER BY s.status_id ASC
      `,
      values
    );
    const statusRows = Array.isArray(statusResult?.rows) ? statusResult.rows : [];

    // =========================================================
    // 4. คำนวณ Summary Metrics (Total Downtime & Most Impacted)
    // =========================================================

    const gameStats = {};
    let totalDowntimeMinutes = 0;

    gameRows.forEach((row) => {
      const mins = parseFloat(row.total_minutes);
      const count = Number(row.case_count);
      const name = row.game_name;

      totalDowntimeMinutes += mins;

      // รวมยอดแต่ละเกม (Aggregate) เพื่อหา Most Impacted
      if (!gameStats[name]) {
        gameStats[name] = { name: name, total_minutes: 0, case_count: 0 };
      }
      gameStats[name].total_minutes += mins;
      gameStats[name].case_count += count;
    });

    const hours = Math.floor(totalDowntimeMinutes / 60);
    const mins = Math.floor(totalDowntimeMinutes % 60);
    const totalDowntimeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")} hrs`;

    // หา Most Impacted
    let mostImpacted = "-";
    const aggregatedGames = Object.values(gameStats).sort((a, b) => {
        const timeDiff = b.total_minutes - a.total_minutes;
        if (timeDiff !== 0) return timeDiff;
        return b.case_count - a.case_count;
    });

    if (aggregatedGames.length > 0) {
      const topGame = aggregatedGames[0];
      if (topGame.total_minutes > 0) {
        const ties = aggregatedGames.filter(
          (r) => r.total_minutes === topGame.total_minutes && r.case_count === topGame.case_count
        );
        if (ties.length > 1) {
          mostImpacted = ties.map((t) => t.name).slice(0, 2).join(", ") + (ties.length > 2 ? "..." : "");
        } else {
          mostImpacted = topGame.name;
        }
      }
    }

    // ---------------------------------------------------------
    // 5. สร้างไฟล์ Excel
    // ---------------------------------------------------------

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");
    const displayDate = getReportRangeLabel(date, mode);
    // Header
    sheet.mergeCells("A1:D1"); // ขยายเป็น 4 คอลัมน์เพราะตารางกว้างขึ้น
    const titleCell = sheet.getCell("A1");
    titleCell.value = mode === "monthly" ? `Monthly Case Report ` : `Daily Case Report`;
    titleCell.font = { bold: true, size: 16 };
    
    

    sheet.getCell("A2").value = `Date: ${displayDate}`;

    let filterInfo = `Status: ${status || 'All'}`;
    if (search) filterInfo += ` | Search: "${search}"`;
    sheet.getCell("A6").value = `Filter Applied: ${filterInfo}`; // ใส่ไว้ที่บรรทัด A6 ก่อนเริ่มตาราง
    sheet.getCell("A6").font = { italic: true, color: { argb: 'FF555555' } };

    sheet.getCell("A3").value = `Total Cases: ${totalCases}`;
    sheet.getCell("A4").value = `Total Downtime: ${totalDowntimeStr}`;
    sheet.getCell("A5").value = `Most Impacted: ${mostImpacted}`;

    // --- Status Summary ---
    const startRowForStatus = 7;
    sheet.getCell(`A${startRowForStatus}`).value = `Status Summary`;
    sheet.getCell(`A${startRowForStatus}`).font = { bold: true, size: 12 };

    const statusHeaderRow = sheet.getRow(startRowForStatus + 1);
    statusHeaderRow.values = ["Status", "Cases"];
    statusHeaderRow.font = { bold: true };

    let statusRowIndex = startRowForStatus + 2;
    statusRows.forEach((row) => {
      sheet.getCell(`A${statusRowIndex}`).value = row.status;
      sheet.getCell(`B${statusRowIndex}`).value = Number(row.case_count);
      statusRowIndex++;
    });

    // --- Game Issues Breakdown ---
    const startRowForGame = statusRowIndex + 2;
    sheet.getCell(`A${startRowForGame}`).value = `Game Issues Breakdown`;
    sheet.getCell(`A${startRowForGame}`).font = { bold: true, size: 12 };

    const gameHeaderRow = sheet.getRow(startRowForGame + 1);
    // [แก้ไข] เพิ่มหัวข้อ Status เข้าไปให้ครบ 4 คอลัมน์
    gameHeaderRow.values = ["Game", "Status", "Cases", "Downtime Duration"];
    gameHeaderRow.font = { bold: true };

    let gameRowIndex = startRowForGame + 2;
    gameRows.forEach((row) => {
      sheet.getCell(`A${gameRowIndex}`).value = row.game_name;
      sheet.getCell(`B${gameRowIndex}`).value = row.status; // ใส่ Status
      sheet.getCell(`C${gameRowIndex}`).value = Number(row.case_count); // ใส่ Cases

      // แปลงเวลา h m
      const totalMins = Math.round(row.total_minutes);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      let timeString = h > 0 ? `${h}h ${m}m` : `${m}m`;
      if (totalMins === 0) timeString = "0m";

      sheet.getCell(`D${gameRowIndex}`).value = timeString; // ใส่ Duration
      gameRowIndex++;
    });

    // จัดความกว้างคอลัมน์
    sheet.getColumn(1).width = 25; // Game
    sheet.getColumn(2).width = 15; // Status
    sheet.getColumn(3).width = 10; // Cases
    sheet.getColumn(4).width = 20; // Downtime

    // Response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    const filename = mode === "monthly" ? `monthly-report-${date}.xlsx` : `daily-report-${date}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

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