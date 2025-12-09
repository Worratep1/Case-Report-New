const pool = require("../config/db");
const ExcelJS = require ("exceljs");


// GET /api/exportreport?date=YYYY-MM-DD คัดเอาวันที่เลือก


exports.exportReport = async(req,res) => {
    try {
        const {date} = req.query;

        if(!date){
            return res.status(400).json({
                message: "กรุณาระบุวันที่ เช่น ?date=2025-12-09",
            });
        }
            // 1) ดึงจำนวนเคสทั้งหมดของวันนั้น
        const totalResult = await pool.query(
             `  SELECT COUNT(*) AS total_cases
                FROM cases
                WHERE start_datetime::date = $1
      `,
      [date]
        );

        const totalCases =
        totalResult?.rows?.length > 0
    ? Number(totalResult.rows[0].total_cases)
    : 0;
        
        // 2) ดึง Game Issues Breakdown
        const gameResult = await pool.query(
            `   
            SELECT 
            p.product_name AS game_name,
            COUNT(*) AS case_count
            FROM cases c
            JOIN products p ON c.product_Id = p.product_id
            WHERE c.start_datetime::date =$1
            GROUP BY p.product_name
            ORDER BY case_count DESC, p.product_name
      `,
      [date]
        )
       const gameRows = Array.isArray(gameResult?.rows)
  ? gameResult.rows
  : []; 
        
        // 3) สร้าง Excel

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Dail Report")

         // 3.1 Header / Summary
        sheet.mergeCells("A1,B1");
        const titleCell = sheet.getCell("A1")
        titleCell.value = "Daily Case Report";
        titleCell.font = {bold:true,size : 16};
        titleCell.alignment = {vertical : "middle",horizontal : "left"};

        sheet.getCell("A2").value = `Date: ${date}`; 
        sheet.getCell("A3").value = `Total Cases: ${totalCases}`;
        
        // เว้น 1 บรรทัด
        const startRowForGame = 5;

        sheet.getCell(`A${startRowForGame}`).value = `Game Issues Breakdown (${date})`;
        sheet.getCell(`A${startRowForGame}`).font = { bold: true, size: 12 };

          // Header ของตาราง
          const headerRowIndex = startRowForGame + 2;

          sheet.getRow(headerRowIndex).value = ["Game","Cases"];
          sheet.getRow(headerRowIndex).font ={bold:true};

          // เติมข้อมูล
        let rowIndex = headerRowIndex + 1;

        gameRows.forEach((row) => {
        sheet.getCell(`A${rowIndex}`).value = row.game_name;
        sheet.getCell(`B${rowIndex}`).value = Number(row.case_count);
        rowIndex++;
        
    });
        sheet.getColumn(1).width = 25;
        sheet.getColumn(2).width = 12;


            // 4) ส่งไฟล์ออกไป
             res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="daily-report-${date}.xlsx"`
            )


        await workbook.xlsx.write(res);
        res.end();
    }catch(err){
        console.error("Error exportReport:",err);
        return res.status(500).json({
            message : "เกิดข้อผิดพลาดในการ export รายงาน",
            error: err.message,
        });
    }
}
