const pool = require("../config/db");
const ExcelJS = require("exceljs");

const formatThaiDate = (dateStr) => {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  // วัน/เดือน/ปี ค.ศ. (เช่น 19/12/2025)
  return `${day}/${month}/${year}`;
};

const formatDate = (date) =>
  date
    ? date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

// โชว์ช่วงเวลาวันที่-วันที่เลือก
const getReportRangeLabel = (dateStr, mode) => {
  if (mode !== "monthly") return formatThaiDate(dateStr);
  const [year, month, day] = dateStr.split("-");
  return `01/${month}/${year} - ${day}/${month}/${year}`;
};

const safeValue = (v) => (v === "" || v === undefined ? null : v);

exports.exportReport = async (req, res) => {
  try {

    console.log("EXPORT QUERY:", JSON.stringify(req.query, null, 2));

    const { startDate, endDate, mode, status, search } = req.query;


    // if (!date) {
    //   return res.status(400).json({
    //     message: "กรุณาระบุวันที่ เช่น ?date=2025-12-09",
    //   });
    // }

    if (!startDate || !endDate) {
  return res.status(400).json({ message: "วันที่เริ่มต้น และ วันที่สิ้นสุด จำเป็นต้องส่งมา" });
}
  let conditions = [];
  let values = [startDate, endDate];

  conditions.push(
    "c.start_datetime::date >= $1::date AND c.start_datetime::date <= $2::date"
  );


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
      conditions.push(
        `(p.product_name ILIKE ${idx} OR pr.problem_name ILIKE ${idx})`,
      );
    }

    const finalWhereClause = conditions.join(" AND ");

    
    // ---------------------------------------------------------
    // 3.1 ดึง "จำนวนเคสทั้งหมด" (ใส่ JOIN เพื่อให้กรอง Status/Game ได้)
    // ---------------------------------------------------------
    const totalResult = await pool.query(
    `SELECT COUNT(DISTINCT c.case_id) AS total_cases 
    FROM cases c
    LEFT JOIN case_products cp ON c.case_id = cp.case_id
    LEFT JOIN products p ON cp.product_id = p.product_id
    JOIN case_statuses s ON c.status_id = s.status_id
    LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
    WHERE ${finalWhereClause}`,
    values,
  );
    const totalCases =
      totalResult?.rows?.length > 0
        ? Number(totalResult.rows[0].total_cases)
        : 0;

    // ---------------------------------------------------------
    // 3.2 ดึง Game Breakdown แยก Status
    // ---------------------------------------------------------
   // --- ค้นหาช่วงบรรทัดที่ 84 ใน exportreport.js ---
// --- แก้ไข SQL Query ใน gameResult ---
const gameResult = await pool.query(
  `
    SELECT
      p.product_name AS game_name, -- ดึงชื่อเกมออกมาตรงๆ ไม่ต้องใช้ STRING_AGG
      s.status_name AS status,
      pr.problem_name AS problem,
      c.description AS details,
      c.solution,
      c.requester_name AS requester,
      c.solver AS operator,
      c.start_datetime,
      c.end_datetime,
      EXTRACT(EPOCH FROM (c.end_datetime - c.start_datetime)) / 60 AS total_minutes
    FROM cases c
    LEFT JOIN case_products cp ON c.case_id = cp.case_id
    LEFT JOIN products p ON cp.product_id = p.product_id
    JOIN case_statuses s ON c.status_id = s.status_id
    LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
    WHERE ${finalWhereClause}
    -- ลบ GROUP BY c.case_id ออก หรือใส่ p.product_name เพิ่มเข้าไป
    ORDER BY c.start_datetime, p.product_name
    `,
    values,
  );
    const gameRows = gameResult.rows || [];

    // ---------------------------------------------------------
    // 3.3 ดึง "Status Summary"
    // ---------------------------------------------------------

    const statusResult = await pool.query(
    `
      SELECT s.status_name AS status, COUNT(DISTINCT c.case_id) AS case_count
      FROM cases c
      JOIN case_statuses s ON c.status_id = s.status_id
      LEFT JOIN case_products cp ON c.case_id = cp.case_id
      LEFT JOIN products p ON cp.product_id = p.product_id 
      LEFT JOIN case_problems pr ON c.problem_id = pr.problem_id
      WHERE ${finalWhereClause}
      GROUP BY s.status_name, s.status_id
      ORDER BY s.status_id ASC
      `,
      values,
    );

        const statusRows = Array.isArray(statusResult?.rows)
      ? statusResult.rows
      : [];

    // =========================================================
    // 4. คำนวณ Summary Metrics (Total Downtime & Most Impacted)
    // =========================================================

    const gameStats = {};
    let totalDowntimeMinutes = 0;

    gameRows.forEach((row) => {
      const mins = parseFloat(row.total_minutes || 0);
      const count = 1;
      const name = row.game_name;

      totalDowntimeMinutes += mins;

      if (!gameStats[name]) {
        gameStats[name] = { name, total_minutes: 0, case_count: 0 };
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
        // หาเกมทั้งหมดที่ "เวลาเท่ากับ" หรือ "จำนวนเคสเท่ากับ" อันดับหนึ่ง
        const ties = aggregatedGames.filter(
          (r) =>
            r.total_minutes === topGame.total_minutes &&
            r.case_count === topGame.case_count
        );

        // เอาทุกชื่อที่เท่ากันมาต่อกันด้วย comma เลย (จะ 2, 3 หรือ 4 เกมก็ได้)
        mostImpacted = ties.map((t) => t.name).join(", ");
      }
    }

    // ---------------------------------------------------------
    // 5. สร้างไฟล์ Excel
    // ---------------------------------------------------------

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");
    const displayDate =
  startDate === endDate
    ? formatThaiDate(startDate)
    : `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`;
    // Header
    sheet.mergeCells("A1:C1"); // ขยายเป็น 3 คอลัมน์เพราะตารางกว้างขึ้น
    const titleCell = sheet.getCell("A1");
    titleCell.value =
      mode === "monthly" ? `Monthly Case Report ` : `Daily Case Report`;
    titleCell.font = { bold: true, size: 16 };

    sheet.getCell("A2").value = `Date: ${displayDate}`;

    let filterInfo = `Status: ${status || "All"}`;
    if (search) filterInfo += ` | Search: "${search}"`;
    sheet.getCell("A6").value = `Filter Applied: ${filterInfo}`; // ใส่ไว้ที่บรรทัด A6 ก่อนเริ่มตาราง
    sheet.getCell("A6").font = { italic: true, color: { argb: "FF555555" } };

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
    sheet.getCell(`A${startRowForGame}`).value = `Service Issues Breakdown`;
    sheet.getCell(`A${startRowForGame}`).font = { bold: true, size: 12 };

    const gameHeaderRow = sheet.getRow(startRowForGame + 1);
    
    gameHeaderRow.values = [
      "Service",
      "Problem",
      "Status",
      "Cases",
      "Start Date",
      "Start Time",
      "End Date",
      "End Time",
      "Duration",
      "Details",
      "Solution",
      "Requester",
      "Operator",
    ];


    gameHeaderRow.font = { bold: true };

    let gameRowIndex = startRowForGame + 2;
    gameRows.forEach((row) => {
      // แปลงเวลา h m
      const totalMins = Math.round(row.total_minutes || 0);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const duration = totalMins > 0 ? `${h ? h + "h " : ""}${m}m` : "0m";
  

      sheet.getCell(`A${gameRowIndex}`).value = row.game_name; // Game
      sheet.getCell(`B${gameRowIndex}`).value = row.problem || "-"; // Problem
      sheet.getCell(`C${gameRowIndex}`).value = row.status; // Status
      sheet.getCell(`D${gameRowIndex}`).value = 1; // Cases

      // Start Date
      sheet.getCell(`E${gameRowIndex}`).value = row.start_datetime || "-";
      sheet.getCell(`E${gameRowIndex}`).numFmt = "[$-th-TH]dd/mm/yyyy";

      // Start Time
      sheet.getCell(`F${gameRowIndex}`).value = row.start_datetime
        ? row.start_datetime.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      // End Date
      sheet.getCell(`G${gameRowIndex}`).value = row.end_datetime || "-";
      sheet.getCell(`G${gameRowIndex}`).numFmt = "[$-th-TH]dd/mm/yyyy";

      // End Time
      sheet.getCell(`H${gameRowIndex}`).value = row.end_datetime
        ? row.end_datetime.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";


      sheet.getCell(`I${gameRowIndex}`).value = duration; // Duration
      sheet.getCell(`J${gameRowIndex}`).value = safeValue(row.details); // Details
      sheet.getCell(`K${gameRowIndex}`).value = safeValue(row.solution); // Solution
      sheet.getCell(`L${gameRowIndex}`).value = row.requester; // Requester
      sheet.getCell(`M${gameRowIndex}`).value = row.operator; // Operator

      gameRowIndex++;
    });

    // จัดความกว้างคอลัมน์
    sheet.getColumn(1).width = 30; // service
    sheet.getColumn(2).width = 22; // Problem
    sheet.getColumn(3).width = 12; // Status
    sheet.getColumn(4).width = 8;   // Cases
    sheet.getColumn(5).width = 14; // Start Date
    sheet.getColumn(6).width = 14; // End Date
    sheet.getColumn(7).width = 12; // Start Time
    sheet.getColumn(8).width = 12; // End Time
    sheet.getColumn(9).width = 14; // Duration
    sheet.getColumn(10).width = 40; // Details
    sheet.getColumn(11).width = 40; // Solution
    sheet.getColumn(12).width = 20; // Requester
    sheet.getColumn(13).width = 20; // Operator

    // Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const filename =
  startDate === endDate
    ? `daily-report-${startDate}.xlsx`
    : `monthly-report-${startDate}-to-${endDate}.xlsx`;
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
