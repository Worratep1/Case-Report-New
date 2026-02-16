// คืนค่า วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
export const getTodayString = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

// คืนค่า วันที่แรกของเดือน จากวันที่ระบุ (รูปแบบ YYYY-MM-DD)
export const getFirstDayOfMonth = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

// คืนค่า ช่วงวันที่สำหรับรายงาน ตามโหมดการแสดงผลและวันที่ที่เลือก
export const getReportRange = ({
  viewMode,
  selectedDate,
  monthlyStartDate,
  monthlyEndDate,
}) => {

  // DAILY
  if (viewMode === "daily") {
    return { start: selectedDate, end: selectedDate };
  }

  // MONTHLY custom
  if (monthlyStartDate && monthlyEndDate) {
    return { start: monthlyStartDate, end: monthlyEndDate };
  }

  // MONTHLY auto
  const today = getTodayString();
  return {
    start: getFirstDayOfMonth(today),
    end: today,
  };
};

// สร้างชื่อไฟล์รายงานตามช่วงวันที่
export const getReportFilename = ({ start, end }) => {
  if (start === end) {
    return `daily-report-${start}.xlsx`;
  }
  return `monthly-report-${start}-to-${end}.xlsx`;
};

export const hasReportData = (cases = []) => {
  return cases.length > 0;
};
