const mailSender = require("../config/mail"); // ตรวจสอบชื่อตัวแปรให้ตรงกับไฟล์ config ของคุณ

exports.sendDailyReport = async (req, res) => {
  try {
    // 1. รับข้อมูลจาก Frontend
    let { toEmails, subject, body, reportInfo, summaryData, casesData } =
      req.body;

    // Parse ข้อมูล JSON
    const info = JSON.parse(reportInfo || "{}");
    const summary = JSON.parse(summaryData || "{}");
    const cases = JSON.parse(casesData || "[]");

    console.log("--- New Email Request ---");
    console.log("Report Info:", req.body.reportInfo);
    console.log("Summary Data:", req.body.summaryData);
    console.log("Cases Data Length:", JSON.parse(req.body.casesData || "[]").length);

    // จัดการ Email ผู้รับ (Logic เดิมของคุณ)
    if (typeof toEmails === "string") {
      try {
        toEmails = JSON.parse(toEmails);
      } catch {
        toEmails = toEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
      }
    }

    // 2. จัดการไฟล์แนบ (เฉพาะไฟล์ปกติ ไม่เอาไฟล์รูปแคปแล้ว)
  const attachmentsList = [];
  const files = req.files; // ตอนนี้ files จะเป็น Array โดยตรง
  if (files && Array.isArray(files)) {
    files.forEach((file) => {
      attachmentsList.push({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      });
    });
  }
    
   // 3. สร้าง HTML สำหรับ Summary Cards
const summaryHtml = `
  <table role="presentation" width="60%" align="center" cellspacing="0" cellpadding="0" style="margin-bottom: 25px; font-family: sans-serif;">
    <tr>
      <td align="center" style="padding: 6px; width: 50%;">
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 25px 10px;">
          <div style="color: #991b1b; font-size: 12px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">TOTAL DOWNTIME</div>
          <div style="font-size: 18px; font-weight: bold; color: #b91c1c;">${summary.totalDowntime || '00:00 hrs'}</div>
        </div>
      </td>
      <td align="center" style="padding: 6px; width: 50%;">
        <div style="background-color: #fffaf5; border: 1px solid #ffedd5; border-radius: 8px; padding: 25px 10px;">
          <div style="color: #9a3412; font-size: 12px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">TOTAL CASES</div>
          <div style="font-size: 18px; font-weight: bold; color: #c2410c;">${summary.totalCases || 0}</div>
        </div>
      </td>
    </tr>
  </table>
`;

    // 4. วนลูปสร้างแถวตาราง Case Details ถ้าไม่มีข้อมูล ก็แสดงข้อความว่าไม่มีข้อมูล
    let tableRows = "";
    if (cases.length === 0) {
      tableRows = `
       <tr style="border-bottom: 1px solid #e2e8f0;">
          <td colspan="8" style="padding: 40px 10px; text-align: center; color: #64748b; font-size: 14px;">
            ไม่มีข้อมูลการแจ้งเคส (No cases reported)
          </td>
        </tr>
      `;
    } else {
      tableRows = cases
        .map(
          (c, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; text-align: center; font-size: 12px; color: #64748b;">${index + 1}</td>
          <td style="padding: 10px; text-align: center;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;">
              ${c.status.toUpperCase()}
            </span>
          </td>
          <td style="padding: 10px; font-size: 12px; text-align: center;">${c.startDate}</td>
          <td style="padding: 10px; font-size: 12px; text-align: center;">${c.endDate}</td>
          <td style="padding: 10px; font-size: 12px; white-space: nowrap;">
            ${c.startTime} - ${c.endTime}<br/>
            <small style="color: #64748b;">(${c.duration})</small>
          </td>
          <td style="padding: 10px; font-size: 12px;">
            <div style="font-weight: bold; color: #2563eb;">
            <b>Game:</b> ${c.game}</div>
            <div style="font-size: 11px; color: #1e293b;">
            <b>Problem:</b> ${c.problem}</div>
          </td>
          <td style="padding: 10px; font-size: 11px; line-height: 1.4; max-width: 200px;">
            <div style="margin-bottom: 4px;"><b>Details:</b> ${c.details || "-"}</div>
            <div style="color: #059669;"><b>Solution:</b> ${c.solution || "-"}</div>
          </td>
          <td style="padding: 10px; font-size: 11px; line-height: 1.4;">
            <div><b>Req:</b> ${c.reporter}</div>
            <div style="color: #64748b;"><b>Op:</b> ${c.operator}</div>
          </td>
        </tr>
      `,
        )
        .join("");
    }

    // 5. ประกอบร่าง HTML ทั้งหมด
    let htmlContent = `
      <div style="font-family: sans-serif; color: #1e293b; max-width: 1000px; margin: auto;">
        
        <div style="font-size: 16px; margin-bottom: 25px; color: #334155; line-height: 1.6;">
          ${body ? body.replace(/\n/g, "<br/>") : "No additional message."}
        </div>

        <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          ${info.viewMode === "daily" ? "Daily Report" : "Monthly Report"} (${info.reportPeriod})
        </h2>
        
        ${summaryHtml}

        <h3 style="font-size: 16px; color: #334155; margin-top: 30px;">Detailed Case List</h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; table-layout: auto;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 10px; font-size: 12px; color: #475569; width: 30px;">ID</th>
              <th style="padding: 10px; font-size: 12px; color: #475569;">Status</th>
              <th style="padding: 10px; font-size: 12px; color: #475569;">Start Date</th>
              <th style="padding: 10px; font-size: 12px; color: #475569;">End Date</th>
              <th style="padding: 10px; font-size: 12px; color: #475569; text-align: left;">Time/Duration</th>
              <th style="padding: 10px; font-size: 12px; color: #475569; text-align: left;">Game/Problem</th>
              <th style="padding: 10px; font-size: 12px; color: #475569; text-align: left;">Details/Solution</th>
              <th style="padding: 10px; font-size: 12px; color: #475569; text-align: left;">Requester/Operator</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;

    // 6. ส่งเมล
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmails.join(","),
      subject:
        subject ||
        `${info.viewMode === "daily" ? "Daily" : "Monthly"} Report - ${info.reportPeriod}`,
      html: htmlContent,
      attachments: attachmentsList,
    };

    await mailSender.sendMail(mailOptions);
    return res.status(200).json({ message: "ส่งอีเมลสำเร็จแล้ว" });
  } catch (err) {
    console.error("Error sending email :", err);
    return res
      .status(500)
      .json({ message: "ส่งอีเมล์ไม่สำเร็จ", error: err.message });
  }
};
