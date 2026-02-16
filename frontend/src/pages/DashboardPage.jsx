import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  X,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Home,
  CheckCircle2
  , Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCases } from "../api/case";
import { getProblems } from "../api/problems.jsx";
import { getStatuses } from "../api/status.jsx";
import { getproducts } from "../api/products.jsx";
import { STATUS_CONFIG } from "../constants/status";


import ActionFeedbackModal from "../components/ActionFeedbackModal";
import SearchInput from "../components/SearchInput.jsx";
import StatCard from "../components/dashboard/StatCard";
import DowntimeBarChart from "../components/dashboard/DowntimeBarChart";
import StatusPieChart from "../components/dashboard/StatusPieChart";

import { getFirstDayOfMonth} from "../utils/reportUtils";

// const CONFIG = {
//   MAX_FILE_SIZE_MB: 5,
//   MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
//   ALLOWED_FILE_TYPES: [
//     "application/pdf",
//     "image/jpeg",
//     "image/png",
//     "application/msword",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ],
// };

 const ITEMS_PER_PAGE = 10;


// --- HELPER FUNCTIONS ---
const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// const getFirstDayOfMonth = (dateStr) => {
//   const date = new Date(dateStr);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   return `${year}-${month}-01`;
// };

const formatDateToISO = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseISODate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

const formatDMY = (dateStr) =>
  dateStr.split("-").reverse().join("/");

// --- UI COMPONENTS (Keep Existing) ---
// const CustomDatePicker = ({
//   value,
//   onChange,
//   startDate,
//   endDate,
//   placeholder = "Select date",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [viewDate, setViewDate] = useState(() => parseISODate(value));
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (value) {
//       setViewDate(parseISODate(value));
//     }
//   }, [value]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const formatDateDisplay = (dateStr) => {
//     if (!dateStr) return "";
//     const date = parseISODate(dateStr);
//     return date.toLocaleDateString("th-TH", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
//   const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

//   const handleDayClick = (day) => {
//     const newDate = new Date(
//       viewDate.getFullYear(),
//       viewDate.getMonth(),
//       day,
//       12,
//       0,
//       0,
//     );
//     const isoString = formatDateToISO(newDate);
//     onChange(isoString);
//     setIsOpen(false);
//   };

//   const changeMonth = (offset) => {
//     const newDate = new Date(
//       viewDate.getFullYear(),
//       viewDate.getMonth() + offset,
//       1,
//       12,
//       0,
//       0,
//     );
//     setViewDate(newDate);
//   };

//   const setToday = () => {
//     const todayStr = getTodayString();
//     onChange(todayStr);
//     setViewDate(parseISODate(todayStr));
//     setIsOpen(false);
//   };

//   const clearDate = () => {
//     onChange("");
//     setIsOpen(false);
//   };

//   // เเสดงวันในปฏิทิน

//   const renderCalendarDays = () => {
//     const days = [];
//     const totalDays = daysInMonth(viewDate.getMonth(), viewDate.getFullYear());
//     const startDay = firstDayOfMonth(
//       viewDate.getMonth(),
//       viewDate.getFullYear(),
//     );

//     for (let i = 0; i < startDay; i++) {
//       days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
//     }

//     for (let i = 1; i <= totalDays; i++) {
//       const currentLoopDate = new Date(
//         viewDate.getFullYear(),
//         viewDate.getMonth(),
//         i,
//         12,
//         0,
//         0,
//       );
//       const currentLoopDateStr = formatDateToISO(currentLoopDate);
//       const isDailySelected =
//       !startDate &&
//       !endDate &&
//       value === currentLoopDateStr;

//       const isToday = currentLoopDateStr === getTodayString();

//       const start = startDate ? parseISODate(startDate).getTime() : null;
//       const end = endDate ? parseISODate(endDate).getTime() : null;
//       const current = currentLoopDate.getTime();

//       const isStart = start && current === start;
//       const isEnd = end && current === end;
//       const isInRange = start && end && current > start && current < end;

//       // วงกลมวันที่เลือก 
//       days.push(
//        <button
//         key={i}
//         onClick={() => handleDayClick(i)}
//         className={`h-8 w-8 text-sm font-medium transition-colors
//           ${
//             isDailySelected || isStart || isEnd
//               ? "bg-blue-600 text-white rounded-full shadow-md shadow-blue-300 dark:shadow-blue-900"
//               : isInRange
//               ? "bg-blue-100 text-blue-700 rounded-full "
//               : "rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 "
//           }
//           ${
//             isToday && !isDailySelected && !isStart && !isEnd
//               ? "border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
//               : ""
//           }
//         `}

//       >
//         {i}
//       </button>
//       );
//     }
//     return days;
//   };

//   const thaiMonths = [
//     "มกราคม",
//     "กุมภาพันธ์",
//     "มีนาคม",
//     "เมษายน",
//     "พฤษภาคม",
//     "มิถุนายน",
//     "กรกฎาคม",
//     "สิงหาคม",
//     "กันยายน",
//     "ตุลาคม",
//     "พฤศจิกายน",
//     "ธันวาคม",
//   ];

//   return (
//     <div className="relative w-full" ref={containerRef}>
//       <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
//           bg-white dark:bg-slate-900
//           ${
//             isOpen
//               ? "border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
//               : "border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
//           }
//         `}
//       >
//         <div className="flex items-center gap-2">
//           <CalendarDays size={18} className="text-blue-500" />
//           <span
//             className={`${
//               value
//                 ? "text-slate-700 dark:text-slate-200 font-medium"
//                 : "text-slate-400"
//             }`}
//           >
//             {value ? formatDateDisplay(value) : placeholder}
//           </span>
//         </div>
//       </button>

//       {isOpen && (
//         <div
//           className="absolute z-50 mt-2 p-4 rounded-2xl shadow-xl w-[300px] animate-in fade-in zoom-in-95 duration-200 left-0 sm:left-auto right-0 sm:right-0
//           bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="font-bold text-slate-700 dark:text-slate-200">
//               {thaiMonths[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
//             </h3>
//             <div className="flex gap-1">
//               <button
//                 onClick={() => changeMonth(-1)}
//                 className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={() => changeMonth(1)}
//                 className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//           </div>
//           <div className="grid grid-cols-7 mb-2 text-center">
//             {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
//               <span key={day} className="text-xs font-bold text-slate-400">
//                 {day}
//               </span>
//             ))}
//           </div>
//           <div className="grid grid-cols-7 gap-y-1 justify-items-center">
//             {renderCalendarDays()}
//           </div>
//           <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
//             <button
//               onClick={clearDate}
//               className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//             >
//               ล้างค่า
//             </button>
//             <button
//               onClick={setToday}
//               className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
//             >
//               วันนี้
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (!value) return placeholder || "Select...";
    const selectedOption = options.find((opt) =>
      typeof opt === "object" ? opt.value === value : opt === value,
    );
    return selectedOption
      ? typeof selectedOption === "object"
        ? selectedOption.label
        : selectedOption
      : value;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
          bg-white dark:bg-slate-900
          ${
            isOpen
              ? "border-blue-500  ring-blue-500/10 shadow-sm"
              : "border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
          }
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
          <span
            className={`truncate ${
              !value
                ? "text-slate-400"
                : "text-slate-700 dark:text-slate-200 font-medium"
            }`}
          >
            {getDisplayLabel()}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100
          bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
        >
          {options.map((option, index) => {
            const optValue = typeof option === "object" ? option.value : option;
            const optLabel = typeof option === "object" ? option.label : option;
            const isSelected = value === optValue;

            return (
              <div
                key={index}
                onClick={() => handleSelect(optValue)}
                className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors mb-0.5 last:mb-0 flex justify-between
                  ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <span>{optLabel}</span>
               {isSelected && (
                <Check size={14} className="text-blue-500 shrink-0" />
                   )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.others;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} border-transparent bg-opacity-90`}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      ></div>
      {config.label}
    </span>
  );
};

const ReportDashboard = ({ dashboardData }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Downtime"
          value={dashboardData.stats.totalDowntimeStr}
          icon={<Clock className="w-6 h-6 text-red-600 dark:text-red-400" />}
          color="bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
        />
        <StatCard
          title="Total Cases"
          value={dashboardData.stats.totalCases}
          icon={
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          }
          color="bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30"
        />
        <StatCard
          title="Most Impacted"
          value={dashboardData.stats.mostImpacted}
          icon={<Flame className="w-6 h-6  text-red-600 dark:text-red-600" />}
          color="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Downtime Bar Chart */}
        <div className="lg:col-span-2">
          <DowntimeBarChart data={dashboardData.barChartData} />
        </div>
        {/* Status Pie Chart */}
        <div className="lg:col-span-1">
          <StatusPieChart data={dashboardData.pieData} />
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function DailyReport() {
//   const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
  };

  // --- 1. STATE ---
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [viewMode, setViewMode] = useState("daily"); // State สำหรับปุ่มสลับ view
  const [monthlyStartDate, setMonthlyStartDate] = useState(null);
  const [monthlyEndDate, setMonthlyEndDate] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // รีเซ็ตหน้าเป็น 1 เมื่อ searchText หรือ filterStatus เปลี่ยน
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus]);
  const [loadingData, setLoadingData] = useState(false);

  const [cases, setCases] = useState([]);
  const [lookupData, setLookupData] = useState({
    products: [],
    statuses: [],
    problem: [],
  });

  // UI States
//   const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [isCaseDetailModalOpen, setIsCaseDetailModalOpen] = useState(false);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);

  // Email Form Data
//   const [availableRecipients, setAvailableRecipients] = useState([]);
//   const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
//   const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
//   //  State 5 ช่อง
//   const [attachedFiles, setAttachedFiles] = useState(Array(5).fill(null));
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailBody, setEmailBody] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

  const getAutoEmailSubject = () => {
  const [y, m, d] = getTodayString().split("-");
  return `[IT Infra Report] รายงานฝ่าย Infrastructure on ${d}/${m}/${y}`;
  };

  //Export loading
//   const [isExporting, setIsExporting] = useState(false);

  const effectivePickerDate = useMemo(() => {
    // DAILY
    if (viewMode === "daily") {
      return selectedDate;
    }

    // MONTHLY
    // custom range → ใช้วันที่ user เลือกจริง
    if (monthlyStartDate || monthlyEndDate) {
      return monthlyEndDate || monthlyStartDate;
    }

    // auto range → วันนี้
    return getTodayString();
  }, [viewMode, selectedDate, monthlyStartDate, monthlyEndDate]);

  const headerDateText = useMemo(() => {
    // DAILY
    if (viewMode === "daily") {
      return selectedDate ? selectedDate.split("-").reverse().join("/") : "";
    }

    // MONTHLY
    // custom range
    if (monthlyStartDate && monthlyEndDate) {
      return `${monthlyStartDate
        .split("-")
        .reverse()
        .join("/")} - ${monthlyEndDate.split("-").reverse().join("/")}`;
    }

    // auto range (default)
    const today = getTodayString();
    const start = getFirstDayOfMonth(today);

    return `${start.split("-").reverse().join("/")} - ${today
      .split("-")
      .reverse()
      .join("/")}`;
  }, [viewMode, selectedDate, monthlyStartDate, monthlyEndDate]);

//   const reportRange = useMemo(() => {
//   // DAILY
//   if (viewMode === "daily") {
//     return {
//       start: selectedDate,
//       end: selectedDate,
//     };
//   }

//   // MONTHLY custom
//   if (monthlyStartDate && monthlyEndDate) {
//     return {
//       start: monthlyStartDate,
//       end: monthlyEndDate,
//     };
//   }

//   // MONTHLY auto
//   const today = getTodayString();
//   return {
//     start: getFirstDayOfMonth(today),
//     end: today,
//   };
// }, [viewMode, selectedDate, monthlyStartDate, monthlyEndDate]);


  // Filter Options
  const filterOtions = useMemo(() => {
    const defaultOpion = [{ value: "all", label: "สถานะ: ทั้งหมด" }];

    if (!lookupData.statuses || lookupData.statuses.length === 0) {
      return defaultOpion;
    }

    // 3. แปลงข้อมูล Status จาก DB ให้เป็นรูปแบบ { value, label }
    const dbOptions = lookupData.statuses.map((status) => ({
      // value: ต้องเป็นตัวพิมพ์เล็กเพื่อให้ตรงกับ logic การ filter (เช่น "open")
      value: status.status_name.toLowerCase(),
      // label: ข้อความที่จะแสดงในปุ่ม (เช่น "สถานะ: open")
      label: `สถานะ: ${status.status_name}`,
    }));

    return [...defaultOpion, ...dbOptions];
  }, [lookupData.statuses]);

  // --- 2. ดึง Data (Game, Status, Problem) เมื่อเข้าหน้าเว็บครั้งแรก
  useEffect(() => {
    const fetchLookup = async () => {
      try {
        const [resProducts, resStatuses, resProblems, resRecipients] =
          await Promise.all([
            getproducts(),
            getStatuses(),
            getProblems(),
            // getRecipients(),
          ]);

        setLookupData({
          products: resProducts.products || [],
          statuses: resStatuses.statuses || resStatuses.data || [],
          problems: resProblems.problems || [],
        //   recipients: resRecipients.recipients || [],
        });

        // setAvailableRecipients(resRecipients || []);
      } catch (err) {
        console.error("Error fetching lookup data:", err);
      }
    };
    fetchLookup();
  }, []);

  // ดึงข้อมูล Cases เมื่อเปลี่ยนวันที่ (selectedDate) หรือ viewMode
  useEffect(() => {
    //ล้างค่าเคสเมื่ออยู่โหมด daily แต่ไม่ได้เลือกวันที่
    const fetchCases = async () => {
      if (viewMode === "daily" && !selectedDate) {
        setCases([]);
        return;
      }

      let startDate, endDate;

      if (viewMode === "daily") {
        startDate = selectedDate;
        endDate = selectedDate;
      } else {
        // --- MONTHLY MODE ---

        // custom range (ต้องครบ 2 วันเท่านั้น)
        if (monthlyStartDate && monthlyEndDate) {
          startDate = monthlyStartDate;
          endDate = monthlyEndDate;
        } else {
          //  auto range (default)
          const today = getTodayString();
          startDate = getFirstDayOfMonth(today);
          endDate = today;
        }
      }

      setLoadingData(true);
      try {
        // เรียก API ส่ง query params ?date=YYYY-MM-DD&mode=daily
        const res = await getCases({
          startDate,
          endDate,
          mode: viewMode,
        });
        // เรียงข้อมูลเก่าไปใหม่ + map ข้อมูล
        const rawCases = (res.cases || []).slice();

        const mappedCases = rawCases.map((c) => {
          // 1. หาชื่อจาก ID
        const statusObj = lookupData.statuses.find((s) => s.status_id === c.status_id);
        const problemObj = lookupData.problems.find((p) => p.problem_id === c.problem_id);

        const gameNames = c.product_names || "Unknown Game";

          // 2. จัดการเรื่องเวลา (DB เป็น timestamp ต้องแปลงเป็น HH:mm)
          const start = new Date(c.start_datetime);
          const end = new Date(c.end_datetime);

          const formatTime = (date) =>
            date.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            });

          const formatDate = (date) => {
            if (!date || isNaN(date)) return "-";
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${day}/${month}/${year}`;
          };

          const startTimeStr = formatTime(start);
          const endTimeStr = formatTime(end);
          const startDateStr = formatDate(start);
          const endDateStr = formatDate(end);

          // คำนวณระยะเวลา (นาที) - Logic ใหม่
          const diffMs = end - start;
          const durationMins = Math.floor(diffMs / 60000); // เก็บนาทีดิบๆ ไว้คำนวณ
          const durationStr =
            durationMins > 60
              ? `${Math.floor(durationMins / 60)} ชม. ${durationMins % 60} นาที`
              : `${durationMins} นาที`;

          const statusKey = statusObj?.status_name?.toLowerCase() || "others";

          return {
            id: c.case_id,
            startTime: startTimeStr,
            startDate: startDateStr,
            endDate: endDateStr,
            endTime: endTimeStr,
            duration: durationStr,
            durationMins: durationMins,
            problem: problemObj ? problemObj.problem_name : "Unknown Problem",
            game: gameNames,
            details: c.description,
            solution: c.solution,
            reporter: c.requester_name,
            operator: c.solver,
            status: statusKey,
            date: selectedDate,

            startMs: start.getTime(),
          };
        });
        mappedCases.sort((a, b) => {
          // 1. เรียงตามวันเริ่ม (เก่า → ใหม่)
          if (a.startMs !== b.startMs) {
            return a.startMs - b.startMs;
          }

          // 2. ถ้าวันเริ่มเท่ากัน → เคสที่จบก่อนอยู่บน
          if (a.endMs !== b.endMs) {
            return a.endMs - b.endMs;
          }

          // 3. กันกรณีเท่าหมด
          return a.id - b.id;
        });
        setCases(mappedCases);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setCases([]); // ถ้า error ให้เคลียร์ตาราง
      } finally {
        setLoadingData(false);
      }
    };

    if (lookupData.products.length > 0 || lookupData.statuses.length > 0) {
      fetchCases();
    }
  }, [selectedDate, viewMode, lookupData, monthlyStartDate, monthlyEndDate]); // เพิ่ม viewMode ใน dependency

  // --- 3. LOGIC HANDLERS ---
  const handleCaseClick = (item) => {
    setSelectedCaseDetail(item);
    setIsCaseDetailModalOpen(true);
  };

//   const handleOpenEmailModal = () => {
//     setSelectedRecipientIds([]);
//     setAttachedFiles(Array(5).fill(null)); // Reset attachedFiles เป็น 5 ช่องว่าง
//     setIsRecipientDropdownOpen(false);
//     setIsEmailModalOpen(true);

//     setEmailSubject(getAutoEmailSubject()); // reset ข้อความค้างอยู่
//     setEmailBody("");
//   };

//   const toggleRecipient = (id) => {
//     setSelectedRecipientIds((prev) =>
//       prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id],
//     );
//   };

  const handleDateChange = (date) => {
    // --- DAILY MODE ---
    if (viewMode === "daily") {
      setSelectedDate(date);

      // safety: reset monthly state
      setMonthlyStartDate(null);
      setMonthlyEndDate(null);
      return;
    }

    // --- MONTHLY MODE ---
    // ยังไม่เคยเลือก start → คลิกครั้งที่ 1
    if (!monthlyStartDate) {
      setMonthlyStartDate(date);
      setMonthlyEndDate(null);
      return;
    }

    // เลือก start แล้ว แต่ยังไม่มี end → คลิกครั้งที่ 2
    if (monthlyStartDate && !monthlyEndDate) {
      // ถ้า user เลือกวันก่อน start → สลับ
      if (date < monthlyStartDate) {
        setMonthlyEndDate(monthlyStartDate);
        setMonthlyStartDate(date);
      } else {
        setMonthlyEndDate(date);
      }
      return;
    }

    // เลือกครบแล้ว → คลิกใหม่ = reset แล้วเริ่มรอบใหม่
    setMonthlyStartDate(date);
    setMonthlyEndDate(null);
  };

  // ---  LOGIC Export file ---

//   const handleExport = async () => {
//   try {
//     setIsExporting(true);

//     const {start, end} = getReportRange({
//       viewMode,
//       selectedDate,
//       monthlyStartDate,
//       monthlyEndDate,
//     });

//     const blob = await exportReport({
//       startDate: start,
//       endDate: end,
//       mode: viewMode,
//       status: filterStatus,
//       search: searchText,
//     });

//     const filename = getReportFilename({ start, end, viewMode });

//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setIsExporting(false);
//   }
// };


  // ฟังก์ชัน handleFileChange ที่ถูกต้อง
//   const handleFileChange = (e, index) => {
//     // 1. ดึงไฟล์เดียวที่ถูกเลือก
//     const file = e.target.files[0];
//     if (!file) return;

//     const errors = [];

//     // 2. ตรวจสอบขนาดไฟล์ (Size Validation)
//     if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
//       errors.push(`ขนาดไฟล์ "${file.name}" เกิน ${CONFIG.MAX_FILE_SIZE_MB}MB`);
//     }

//     // 3. ตรวจสอบประเภทไฟล์ (Type Validation)
//     if (file.type && !CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
//       errors.push(`ประเภทไฟล์ "${file.name}" (Type: ${file.type}) ไม่รองรับ`);
//     }

//     // 4. จัดการ Error
//     if (errors.length > 0) {
//       setFeedbackModal({
//         isOpen: true,
//         type: "error",
//         title: "ไม่สามารถอัปโหลดไฟล์นี้ได้",
//         message: errors.join("\n"),
//       });

//       e.target.value = null; // เคลียร์ input field เพื่อให้เลือกใหม่ได้
//       return;
//     }

//     setAttachedFiles((prev) => {
//       const newFiles = [...prev];
//       newFiles[index] = file; // เก็บไฟล์จริง
//       return newFiles;
//     });
//   };

//   const removeFile = (indexToRemove) => {
//     // เปลี่ยนจากการ filter เป็นการ set ช่องนั้นให้เป็น null
//     setAttachedFiles((prev) =>
//       prev.map((file, index) => (index === indexToRemove ? null : file)),
//     );
//   };

//   const handleSendEmail = async () => {
//     if (selectedRecipientIds.length === 0) {
//       setFeedbackModal({
//         isOpen: true,
//         type: "error",
//         title: "เลือกผู้รับ",
//         message: "กรุณาเลือกผู้รับอีเมลอย่างน้อย 1 คน",
//       });
//       return;
//     }

//     setIsLoading(true);

//     const { start, end } = getReportRange({
//     viewMode,
//     selectedDate,
//     monthlyStartDate,
//     monthlyEndDate,
//   });

//   // 1. กำหนดช่วงวันที่ของรายงาน (Report)
//   const period =
//     start === end
//       ? formatDMY(start)
//       : `${formatDMY(start)} - ${formatDMY(end)}`;

//     try {
      

//       // 2. ดึง Email ผู้รับ
//       const toEmails = availableRecipients
//         .filter((r) => selectedRecipientIds.includes(r.recipient_id))
//         .map((r) => r.email);

//       // 3. สร้างก้อนข้อมูล JSON
//       const reportInfo = {
//         viewMode: viewMode,
//         reportPeriod: period,
//       };

//       const summaryData = {
//         totalCases: dashboardData.stats.totalCases,
//         totalDowntime: dashboardData.stats.totalDowntimeStr,
//         mostImpacted: dashboardData.stats.mostImpacted,
//       };

//       // 4. จัดเตรียม FormData
//       const formData = new FormData();
//       formData.append("toEmails", JSON.stringify(toEmails));
//       formData.append("subject", emailSubject);
//       formData.append("body", emailBody);

//       // --- ส่งก้อนข้อมูล JSON ---
//       formData.append("reportInfo", JSON.stringify(reportInfo));
//       formData.append("summaryData", JSON.stringify(summaryData));
//       formData.append("casesData", JSON.stringify(filteredCases)); // รายการทั้งหมดในตาราง

//       console.log("Data to be sent:", {
//         subject: emailSubject,
//         casesCount: filteredCases.length,
//         summary: summaryData,
//       });

//       // 5. แนบไฟล์ปกติ (ถ้ามี)
//       attachedFiles
//         .filter((file) => !!file)
//         .forEach((file) => {
//           formData.append("attachments", file);
//         });

//       // 6. ส่งข้อมูลไปที่ API
//       await sendDailyReport(formData);

//       setIsEmailModalOpen(false);
//       setFeedbackModal({
//         isOpen: true,
//         type: "success",
//         title: "ส่งรายงานเรียบร้อย",
//         message: "ระบบได้ทำการส่งอีเมลรายงานเรียบร้อยแล้ว",
//       });

//       setSelectedRecipientIds([]);
//     } catch (error) {
//       console.error("Error sending email:", error);
//       setFeedbackModal({
//         isOpen: true,
//         type: "error",
//         title: "ส่งเมลไม่สำเร็จ",
//         message: error.message,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

  //
  
  const rangeMs = useMemo(() => {
    // DAILY
    if (viewMode === "daily") {
      const d = new Date(selectedDate);
      const ms = d.setHours(0, 0, 0, 0);
      return { start: ms, end: ms + 86400000 };
    }

    // MONTHLY
    let start, end;

    if (monthlyStartDate && monthlyEndDate) {
      start = new Date(monthlyStartDate);
      end = new Date(monthlyEndDate);
    } else {
      const today = getTodayString();
      start = new Date(getFirstDayOfMonth(today));
      end = new Date(today);
    }

    return {
      start: start.setHours(0, 0, 0, 0),
      end: end.setHours(23, 59, 59, 999),
    };
  }, [viewMode, selectedDate, monthlyStartDate, monthlyEndDate]);

  const filteredCases = cases.filter((c) => {
    // เงื่อนไขวันที่: ถ้าเป็น monthly ไม่ต้องกรองวันที่ (หรือกรองตามเดือน) แต่ถ้า daily ต้องตรงกัน
    const isInRange = c.startMs >= rangeMs.start && c.startMs <= rangeMs.end;

    const isSameStatus =
      filterStatus === "all" ? true : c.status === filterStatus;
    const searchLower = searchText.toLowerCase();
    const isMatchSearch =
      c.game.toLowerCase().includes(searchLower) ||
      c.problem.toLowerCase().includes(searchLower) ||
      c.details.toLowerCase().includes(searchLower);

   return isSameStatus && isMatchSearch && isInRange;
  });

  const dashboardData = useMemo(() => {
      const safeCases = filteredCases;
  
      let totalDownMinutes = 0;
      const gameStats = {};
      const counts = {};
      const processedCaseIds = new Set(); // ไว้เช็ก ID ไม่ให้บวกเวลา/จำนวนเคสซ้ำ
  
      safeCases.forEach((c) => {
        if (!c) return;
  
        const minutes = c.durationMins || 0;
        
        // 1. บวก Downtime และ Case Count เฉพาะ ID ที่ยังไม่เคยนับ (กันตัวเลขเบิ้ล)
        if (!processedCaseIds.has(c.id)) {
          totalDownMinutes += minutes;
          
          const status = c.status || "others";
          counts[status] = (counts[status] || 0) + 1;
          
          processedCaseIds.add(c.id);
        }
  
        // 2. เก็บสถิติรายเกมสำหรับกราฟและ Most Impacted (นับแยกทุกเกม)
        const gameString = c.game || "Unknown services";
        const gameList = gameString.split(',').map(g => g.trim()).filter(Boolean);
  
        gameList.forEach((gameName) => {
          if (!gameStats[gameName]) {
            gameStats[gameName] = { minutes: 0, count: 0 };
          }
          gameStats[gameName].minutes += minutes;
          gameStats[gameName].count += 1;
        });
      });
  
      // 3. จัดลำดับ Most Impacted
      const sortedGames = Object.keys(gameStats)
        .map((key) => ({ name: key, ...gameStats[key] }))
        .sort((a, b) => b.minutes - a.minutes || b.count - a.count);
  
      let mostImpacted = "-";
      if (sortedGames.length > 0 && sortedGames[0].minutes > 0) {
        const topGame = sortedGames[0];
        const ties = sortedGames.filter(
          (g) => g.minutes === topGame.minutes && g.count === topGame.count,
        );
  
        // แสดงชื่อผู้ชนะ (ถ้าเท่ากันหลายเกมก็จอยด้วย comma)
        mostImpacted = ties.map((t) => t.name).join(", ");
        if (mostImpacted.length > 30) mostImpacted = mostImpacted.substring(0, 30) + "...";
      }
  
      const downHours = Math.floor(totalDownMinutes / 60);
      const downMins = totalDownMinutes % 60;
      
      return {
        stats: {
          totalCases: processedCaseIds.size, // ใช้ขนาดของ Set เพื่อจำนวนเคสที่แท้จริง
          totalDowntimeStr: `${String(downHours).padStart(2, "0")}:${String(downMins).padStart(2, "0")} hrs`,
          mostImpacted,
        },
        barChartData: sortedGames.filter((item) => item.minutes > 0),
        pieData: Object.keys(STATUS_CONFIG)
          .map((key) => ({
            name: STATUS_CONFIG[key].label,
            value: counts[key] || 0,
            color: STATUS_CONFIG[key].color,
          }))
          .filter((item) => item.value > 0),
      };
    }, [filteredCases]);

  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const casesOfSelectedDate = cases;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto font-sans text-slate-900 pb-20 
      bg-gradient-to-br from-blue-100 via-slate-100 to-blue-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900"
    >
       {/* --- ส่วน Header ที่ปรับปรุงใหม่ --- */}


      {/* contanier */}
      {/* Header Bar */}
      {/* <PageHeader
        // title="Daily Report"
        // subtitle="รายงานประจำวัน"
        // icon={<FileText size={24} />}
        // left={
        //   <>
        //     <BackIconButton />

        //     <ButtonHome onClick={() => navigate("/menu")} />
        //   </>
        // }
        right={
          <> */}
            
            {/* <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

            <div className="w-48">
              <CustomDatePicker
                value={effectivePickerDate}
                onChange={handleDateChange}
                startDate={viewMode === "monthly" ? monthlyStartDate : null}
                endDate={viewMode === "monthly" ? monthlyEndDate : null}
                placeholder="เลือกวันที่"
              />
            </div> */}
{/* 
            <ExportButton
              onClick={handleExport}
              isExporting={isExporting}
              disabled={!hasReportData(filteredCases)}
            /> */}

            {/* <ButtonSend onClick={handleOpenEmailModal} /> */}
          {/* </>
        }
      /> */}


      <main
        id="report-content"
        className="max-w-[70%] mx-auto px-4 sm:px-6 lg:px-1 py-8"
      >
       
        {/* Date Header Display */}
       {/* --- Header Section (หัวข้อ + ปุ่ม) --- */}
      <div className="flex justify-between items-start mb-10">
  
      {/* กลุ่มข้อความฝั่งซ้าย: h2 และ p จะเริ่มที่จุดเดียวกันตรงเป๊ะ */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
          {viewMode === "daily" ? "ภาพรวมประจำวันที่" : "ภาพรวมประจำเดือน"}{" "}
          <span className="text-blue-600 dark:text-blue-400 border-b-4 border-blue-600/20 px-1">
            {headerDateText}
          </span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base text-left">
          สรุปข้อมูลการดำเนินงาน {viewMode === "daily" ? "ประจำวัน" : "ตลอดทั้งเดือน"}
        </p>
      </div>

      {/* กลุ่มปุ่มฝั่งขวา: แยกออกมาต่างหากไม่ไปเบียดกับข้อความ */}
        <button 
          onClick={() => navigate("/menu")} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700  text-white px-6 py-3 rounded-2xl font-bold shadow-md  shadow-blue-600  transition-y shrink-0 mt-1 duration-300 hover:-translate-y-1"
        >
          <Home size={20} />
          เข้าสู่เมนูหลัก
        </button>
      </div>

        {/* Dashboard */}
        <div className="mb-8">
          <ReportDashboard
            cases={filteredCases}
            selectedDate={selectedDate}
            viewMode={viewMode}
            dashboardData={dashboardData}
          />
        </div>

        {/* Toolbar & Filters */}
        <div
          className="p-4 rounded-t-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4
          bg-white dark:bg-slate-800"
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              รายการแจ้งปัญหา
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-20">
            <div className="w-full sm:w-48 text-left">
              <CustomSelect
                options={filterOtions}
                value={filterStatus}
                onChange={setFilterStatus}
                icon={Filter}
                placeholder="สถานะ"
              />
            </div>

            {/* Search */}

            <SearchInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ค้นหาปัญหา, เกม..."
            />
          </div>
        </div>

        {/* Main Table */}
        <div
          className="rounded-b-xl shadow-sm overflow-hidden min-h-[300px]
          bg-white dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-700"
        >
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold tracking-wider
                  bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 "
                >
                  <th className="px-6 py-4 w-16 text-center whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap ">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap ">Start Date</th>
                  <th className="px-6 py-4 whitespace-nowrap ">End Date</th>
                  <th className="px-6 py-4 whitespace-nowrap ">
                    Time/Duration
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap ">Service/Problem</th>
                  <th className="px-6 py-4 whitespace-nowrap ">
                    Details/Solution
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap ">
                    Requester/Operator
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loadingData ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2
                          size={32}
                          className="animate-spin text-blue-600"
                        />
                        <p>กำลังโหลดข้อมูล...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCases.length > 0 ? (
                  // 2. ถ้าโหลดเสร็จและมีข้อมูล -> แสดงรายการ
                  paginatedCases.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => handleCaseClick(item)}
                      className="transition-colors group cursor-pointer
                      hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      title="คลิกเพื่อดูรายละเอียด"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-top text-center text-slate-400 font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* --- คอลัมน์ วันที่เริ่ม --- */}
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200 font-medium">
                          <span>{item.startDate}</span>
                        </div>
                      </td>

                      {/* --- คอลัมน์ วันที่สิ้นสุด --- */}
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200 font-medium">
                          <span>{item.endDate}</span>
                        </div>
                      </td>

                      {/* Time Duration */}
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" />
                            {item.startTime} - {item.endTime}
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded w-fit
                            bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          >
                            ใช้เวลา: {item.duration}
                          </span>
                        </div>
                      </td>


                      {/* Service / Problem */}
                     <td className="px-6 py-4 align-top max-w-[250px]">
                       <div className="flex flex-col gap-1">

                     
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 break-words leading-tight">
                        {item.game || "ไม่ได้ระบุService"}
                        </div>
                        
                        {/* แสดงชื่อปัญหาด้านล่างชื่อบริการ */}
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.problem}
                        </div>
                    </div>
                    </td>
                      {/* Details / Solution */}
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 break-words">
                            <span className="font-medium text-slate-900 dark:text-white">
                              รายละเอียด:
                            </span>{" "}
                            {item.details}
                          </p>
                          {item.solution && (
                            <div
                              className="text-xs px-3 py-2 rounded-lg block w-full break-words 
                              bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                            >
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                แก้ไข:
                              </span>{" "}
                              {item.solution}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Requester / Operator */}
                      <td className="px-6 py-4 align-top max-w-[250px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-2">
                            <div
                              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-medium
                              bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 "
                            >
                              R
                            </div>
                            <span className="text-sm font-normal text-slate-700 dark:text-slate-300 break-all leading-tight">
                              {item.reporter}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div
                              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-medium
                              bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            >
                              O
                            </div>
                            <span className="text-sm font-normal text-slate-700 dark:text-slate-300 break-all leading-tight">
                              {item.operator}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 3. ถ้าโหลดเสร็จแล้วแต่ไม่มีข้อมูล -> แสดง ไม่พบข้อมูล
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center  text-slate-500 dark:text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2 ">
                        <Search
                          size={32}
                          className="text-slate-300 dark:text-slate-600"
                        />
                        <p>ไม่พบข้อมูล</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between
            bg-white dark:bg-slate-800"
          >
            {" "}
            {/* Pagination Footer Dark Mode */}
            <span className="text-sm text-slate-500 dark:text-slate-400">
              หน้า {currentPage} จาก {totalPages} ({filteredCases.length}{" "}
              รายการ)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* --- CASE DETAIL MODAL --- */}
      {isCaseDetailModalOpen && selectedCaseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]
            bg-white dark:bg-slate-800"
          >
            {" "}
            {/* Modal Container Dark Mode */}
            <div
              className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center
              bg-slate-50 dark:bg-slate-900"
            >
              {" "}
              {/* Modal Header Dark Mode */}
              <div>
                <h3 className="font-semibold text-xl text-slate-800 dark:text-white">
                  Case Details
                </h3>
              </div>
              <button
                onClick={() => setIsCaseDetailModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-left">
              {/* ROW 1: Time and Dates (3 Columns) */}
              <div className="grid grid-cols-3 gap-4">
                {["Time Period", "Start Date", "End Date"].map((label, i) => (
                  <div
                    key={label}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <label className="text-xs font-bold uppercase block mb-1 text-slate-500 dark:text-slate-400">
                      {label}
                    </label>
                    <p className="font-medium text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      {i === 0 ? (
                        <Clock size={14} className="text-blue-500" />
                      ) : (
                        <CalendarIcon size={14} className="text-blue-500" />
                      )}

                      {i === 0
                        ? `${selectedCaseDetail.startTime} - ${selectedCaseDetail.endTime}`
                        : i === 1
                          ? selectedCaseDetail.startDate ||
                            selectedCaseDetail.date
                          : selectedCaseDetail.endDate ||
                            selectedCaseDetail.date}
                    </p>
                  </div>
                ))}
              </div>

              {/* ROW 2: Services & Status */}
              <div className="grid grid-cols-2 gap-4">
             <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                    Services
                  </label>
                  <div className="flex flex-wrap gap-1.5 px-3 min-h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    {selectedCaseDetail.game.split(' , ').map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 ">
                        
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <div className="flex items-center px-3 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    <StatusBadge status={selectedCaseDetail.status} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                  ระยะเวลา (Duration)
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm ">
                  {selectedCaseDetail.duration}
                </div>
              </div>

              {/* ROW 3: Problem  */}
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                  ปัญหา (Problem)
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm">
                  {selectedCaseDetail.problemType || selectedCaseDetail.problem}
                </div>
              </div>

              {/* ROW 4: Details */}
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                  รายละเอียด (Details)
                </label>
                <textarea
                  disabled
                  rows={3}
                  value={selectedCaseDetail.details}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* ROW 5: Solution */}
              <div>
                <label className="text-sm font-medium mb-1 block text-emerald-700 dark:text-emerald-400">
                  วิธีการแก้ไข (Solution)
                </label>
                <textarea
                  disabled
                  rows={3}
                  value={selectedCaseDetail.solution || "-"}
                  className="w-full px-3 py-2 border border-emerald-200 dark:border-emerald-900/50 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* ROW 6: People */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <User size={14} className="text-orange-500" /> ผู้ร้องขอ
                    (Requester)
                  </label>
                  <div className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    {selectedCaseDetail.reporter}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <User size={14} className="text-blue-500" /> ผู้ดำเนินเเก้ไข
                    (Operator)
                  </label>
                  <div className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    {selectedCaseDetail.operator}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => setIsCaseDetailModalOpen(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm
                  bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
     
      
      <ActionFeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={closeFeedbackModal}
        onConfirm={feedbackModal.onConfirm}
      />
    </div>
  );
}


