import html2canvas from "html2canvas";

export const captureReportImage = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const isDarkMode = document.documentElement.classList.contains("dark");
  const captureBgColor = isDarkMode ? "#0f172a" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#1e293b";

  // ใส่ Logic ทั้งหมดที่แก้ปัญหา "ภาพขาด" และ "ตัวอักษรตก" ไว้ที่นี่ที่เดียว
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: captureBgColor,
    logging: false,
    windowWidth: 2000 , // กว้าง
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(elementId);
      if (clonedElement) {
        clonedElement.style.width = "1700px";
        clonedElement.style.maxWidth = "none";
        clonedElement.style.height = "auto";
        clonedElement.style.padding = "40px";
        clonedElement.style.background = captureBgColor;
        clonedElement.style.color = textColor;
      }
      
      // จัดการ Table Header ห้ามตกบรรทัด
      const headers = clonedDoc.querySelectorAll("th");
      headers.forEach(th => th.style.whiteSpace = "nowrap");

      // ซ่อนปุ่มหรือส่วนที่ไม่ต้องการในรูป
      const hiddenElements = clonedDoc.querySelectorAll(".sticky, .no-capture");
      hiddenElements.forEach(el => el.style.display = "none");
    },
  });

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
};