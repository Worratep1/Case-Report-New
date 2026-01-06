import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  Gamepad2,
  Send,
  X,
  FileText,
  Paperclip,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Server,
  Flame,
} from "lucide-react";

import { getCases } from "../api/case";
import { getProblems } from "../api/problems";
import { getStatuses } from "../api/status";
import { getproducts } from "../api/products";
import { getRecipients } from "../api/recipients";
import { sendDailyReport } from "../api/report";
import { exportReport } from "../api/export";
import { useNavigate } from "react-router-dom";
import { STATUS_CONFIG } from "../constants/status";
import { captureReportImage } from "../utils/reportCapture";

import ExportButton from "../components/ButtonExport";
import ButtonSend from "../components/ButtonSend";
import ButtonHome from "../components/ButtonHome";
import ButtonConfirmsend from "../components/ButtonConfirmsend.jsx";
import ActionFeedbackModal from "../components/ActionFeedbackModal";
import ViewModeToggle from "../components/ViewModeToggle";
import BackIconButton from "../components/BackIconButton.jsx";
import SearchInput from "../components/SearchInput.jsx";

import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/dashboard/StatCard";
import DowntimeBarChart from "../components/dashboard/DowntimeBarChart";
import StatusPieChart from "../components/dashboard/StatusPieChart";

const CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const ITEMS_PER_PAGE = 10;

// --- HELPER FUNCTIONS ---
const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

// --- REPORT DASHBOARD CONTAINER ---
const ReportDashboard = ({ cases = [], selectedDate, viewMode }) => {
  const dashboardData = useMemo(() => {
    const safeCases = Array.isArray(cases) ? cases : [];

    // 1. คำนวณตัวเลขสรุป
    let totalDownMinutes = 0;
    const gameStats = {};
    const counts = {};

    safeCases.forEach((c) => {
      if (!c) return;

      // Sum Downtime
      const minutes = c.durationMins || 0;
      totalDownMinutes += minutes;

      // Group by Game for Bar Chart
      const game = c.game || "Unknown";
      if (!gameStats[game]) {
        gameStats[game] = { minutes: 0, count: 0 };
      }
      gameStats[game].minutes += minutes;
      gameStats[game].count += 1;

      // Group by Status for Pie Chart
      const status = c.status || "others";
      counts[status] = (counts[status] || 0) + 1;
    });

    // 2. จัดการ Most Impacted (Tie-Breaker Logic)
    const sortedGames = Object.keys(gameStats)
      .map((key) => ({ name: key, ...gameStats[key] }))
      .sort((a, b) => {
        const timeDiff = b.minutes - a.minutes;
        if (timeDiff !== 0) return timeDiff;
        return b.count - a.count;
      });

    let mostImpacted = "-";
    if (sortedGames.length > 0 && sortedGames[0].minutes > 0) {
      const topGame = sortedGames[0];
      const ties = sortedGames.filter(
        (g) => g.minutes === topGame.minutes && g.count === topGame.count
      );

      if (ties.length > 1) {
        const names = ties.map((t) => t.name);
        mostImpacted = names.slice(0, 2).join(", ");
        if (ties.length > 2) mostImpacted += "...";
      } else {
        mostImpacted = topGame.name;
      }
    }

    // 3. Format Total Downtime เป็น h:m
    const downHours = Math.floor(totalDownMinutes / 60);
    const downMins = totalDownMinutes % 60;
    const totalDowntimeStr = `${String(downHours).padStart(2, "0")}:${String(
      downMins
    ).padStart(2, "0")} hrs`;

    // 4. เตรียมข้อมูลกราฟ
    const barChartData = sortedGames.filter((item) => item.minutes > 0);

    const pieData = Object.keys(STATUS_CONFIG)
      .map((key) => ({
        name: STATUS_CONFIG[key].label,
        value: counts[key] || 0,
        color: STATUS_CONFIG[key].color,
      }))
      .filter((item) => item.value > 0);

    return {
      stats: {
        totalCases: safeCases.length,
        totalDowntimeStr,
        mostImpacted,
      },
      barChartData,
      pieData,
    };
  }, [cases]);

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
          icon={<Flame className="w-6 h-6 text-red-600 dark:text-red-600" />}
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

// --- UI COMPONENTS (Keep Existing) ---
const CustomDatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  // ... (Code เดิม - ไม่มีการเปลี่ยนแปลง) ...
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseISODate(value));
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setViewDate(parseISODate(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = parseISODate(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day,
      12,
      0,
      0
    );
    const isoString = formatDateToISO(newDate);
    onChange(isoString);
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1,
      12,
      0,
      0
    );
    setViewDate(newDate);
  };

  const setToday = () => {
    const todayStr = getTodayString();
    onChange(todayStr);
    setViewDate(parseISODate(todayStr));
    setIsOpen(false);
  };

  const clearDate = () => {
    onChange("");
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(viewDate.getMonth(), viewDate.getFullYear());
    const startDay = firstDayOfMonth(
      viewDate.getMonth(),
      viewDate.getFullYear()
    );

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const currentLoopDate = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        i,
        12,
        0,
        0
      );
      const currentLoopDateStr = formatDateToISO(currentLoopDate);

      const isSelected = value === currentLoopDateStr;
      const isToday = currentLoopDateStr === getTodayString();

      days.push(
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-colors
            ${
              isSelected
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300"
            }
            ${
              isToday && !isSelected
                ? "border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : ""
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
          bg-white dark:bg-slate-900
          ${
            isOpen
              ? "border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
              : "border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
          }
        `}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-500" />
          <span
            className={`${
              value
                ? "text-slate-700 dark:text-slate-200 font-medium"
                : "text-slate-400"
            }`}
          >
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 p-4 rounded-2xl shadow-xl w-[300px] animate-in fade-in zoom-in-95 duration-200 left-0 sm:left-auto right-0 sm:right-0
          bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-200">
              {thaiMonths[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2 text-center">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 justify-items-center">
            {renderCalendarDays()}
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={clearDate}
              className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              ล้างค่า
            </button>
            <button
              onClick={setToday}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              วันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
      typeof opt === "object" ? opt.value === value : opt === value
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
              ? "border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
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
                className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors mb-0.5 last:mb-0
                  ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                {optLabel}
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

// --- MAIN COMPONENT ---
export default function DailyReport() {
  const fileInputRef = useRef(null);
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [isCaseDetailModalOpen, setIsCaseDetailModalOpen] = useState(false);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);

  // Email Form Data
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  //  State 5 ช่อง
  const [attachedFiles, setAttachedFiles] = useState(Array(5).fill(null));
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //Export loading
  const [isExporting, setIsExporting] = useState(false);

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
            getRecipients(),
          ]);

        setLookupData({
          products: resProducts.products || [],
          statuses: resStatuses.statuses || resStatuses.data || [],
          problems: resProblems.problems || [],
          recipients: resRecipients.recipients || [],
        });

        setAvailableRecipients(resRecipients || []);
      } catch (err) {
        console.error("Error fetching lookup data:", err);
      }
    };
    fetchLookup();
  }, []);

  // ดึงข้อมูล Cases เมื่อเปลี่ยนวันที่ (selectedDate) หรือ viewMode
  useEffect(() => {
    const fetchCases = async () => {
      if (!selectedDate) {
        setCases([]); // ล้างข้อมูลในตารางและ Dashboard
        return;
      }

      setLoadingData(true);
      try {
        // เรียก API ส่ง query params ?date=YYYY-MM-DD&mode=daily
        const res = await getCases({
          date: selectedDate,
          mode: viewMode,
        });

        const rawCases = (res.cases || [])
          .slice()
          .sort(
            (a, b) => new Date(b.start_datetime) - new Date(a.start_datetime)
          );

        const mappedCases = rawCases.map((c) => {
          // 1. หาชื่อจาก ID
          const productObj = lookupData.products.find(
            (p) => p.product_id === c.product_id
          );
          const statusObj = lookupData.statuses.find(
            (s) => s.status_id === c.status_id
          );
          const problemObj = lookupData.problems.find(
            (p) => p.problem_id === c.problem_id
          );

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
            game: productObj ? productObj.product_name : "Unknown Game",
            details: c.description,
            solution: c.solution,
            reporter: c.requester_name,
            operator: c.solver,
            status: statusKey,
            date: selectedDate,

            startMs: start.getTime(),
          };
        });
        mappedCases.sort((a, b) => b.startMs - a.startMs);
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
  }, [selectedDate, viewMode, lookupData]); // เพิ่ม viewMode ใน dependency

  // --- 3. LOGIC HANDLERS ---
  const handleCaseClick = (item) => {
    setSelectedCaseDetail(item);
    setIsCaseDetailModalOpen(true);
  };

  const handleOpenEmailModal = () => {
    setSelectedRecipientIds([]);
    setAttachedFiles(Array(5).fill(null)); // Reset attachedFiles เป็น 5 ช่องว่าง
    setIsRecipientDropdownOpen(false);
    setIsEmailModalOpen(true);

    setEmailSubject(""); // reset ข้อความค้างอยู่
    setEmailBody("");
  };

  const toggleRecipient = (id) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  // ---  LOGIC Export file ---

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // เรียก API ไปดึงไฟล์ Excel (แบบ blob)
      const blob = await exportReport(
        selectedDate,
        viewMode,
        filterStatus,
        searchText
      );

      if (!blob) {
        throw new Error("ไม่พบข้อมูลไฟล์");
      }

      // สร้าง URL ชั่วคราวจาก blob
      const url = window.URL.createObjectURL(blob);

      // สร้าง <a> ชั่วคราวเพื่อดาวน์โหลดไฟล์
      const downloadLink = document.createElement("a");
      downloadLink.href = url;

      const filename =
        viewMode === "monthly"
          ? `monthly-report-${selectedDate}.xlsx`
          : `daily-report-${selectedDate}.xlsx`;
      downloadLink.download = filename;
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      // ล้าง URL ชั่วคราวทิ้ง
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);

      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Export ไม่สำเร็จ",
        message: "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ฟังก์ชัน handleFileChange ที่ถูกต้อง
  const handleFileChange = (e, index) => {
    // 1. ดึงไฟล์เดียวที่ถูกเลือก
    const file = e.target.files[0];
    if (!file) return;

    const errors = [];

    // 2. ตรวจสอบขนาดไฟล์ (Size Validation)
    if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
      errors.push(`ขนาดไฟล์ "${file.name}" เกิน ${CONFIG.MAX_FILE_SIZE_MB}MB`);
    }

    // 3. ตรวจสอบประเภทไฟล์ (Type Validation)
    if (file.type && !CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`ประเภทไฟล์ "${file.name}" (Type: ${file.type}) ไม่รองรับ`);
    }

    // 4. จัดการ Error
    if (errors.length > 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ไม่สามารถอัปโหลดไฟล์นี้ได้",
        message: errors.join("\n"),
      });

      e.target.value = null; // เคลียร์ input field เพื่อให้เลือกใหม่ได้
      return;
    }

    setAttachedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = file; // เก็บไฟล์จริง
      return newFiles;
    });
  };

  const removeFile = (indexToRemove) => {
    // เปลี่ยนจากการ filter เป็นการ set ช่องนั้นให้เป็น null
    setAttachedFiles((prev) =>
      prev.map((file, index) => (index === indexToRemove ? null : file))
    );
  };
  const handleSendEmail = async () => {
    if (selectedRecipientIds.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "เลือกผู้รับ",
        message: "กรุณาเลือกผู้รับอีเมลอย่างน้อย 1 คน",
      });
      return;
    }

    setIsLoading(true);

    try {
      // เมื่อส่งเมล์จะเเคปภาพไปด้วย
      const imageBlob = await captureReportImage("report-content");

      // 1) ดึง email จาก recipients ที่เลือก
      const toEmails = availableRecipients
        .filter((r) => selectedRecipientIds.includes(r.recipient_id))
        .map((r) => r.email);

      // 2) สร้าง FormData
      const formData = new FormData();
      formData.append("toEmails", JSON.stringify(toEmails));
      formData.append("subject", emailSubject);
      formData.append("body", emailBody);

      // --- ส่วนที่เพิ่มใหม่: แนบรูป Screenshot  ---
      formData.append("reportImage", imageBlob, "report-screenshot.png");

      // 3) แนบไฟล์
      attachedFiles
        .filter((file) => !!file)
        .forEach((file) => {
          formData.append("attachments", file); // ชื่อ field ต้องตรงกับ upload.array("attachments")
        });

      await sendDailyReport(formData);
      setIsEmailModalOpen(false);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "ส่งรายงานเรียบร้อย",
        message: "ระบบได้ทำการส่งอีเมลรายงานให้ผู้รับเรียบร้อยแล้ว",
      });

      // reset ฟอร์ม
      setSelectedRecipientIds([]);
    } catch (error) {
      console.error("Error sending email:", error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ส่งเมลไม่สำเร็จ",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredCases = cases.filter((c) => {
    // เงื่อนไขวันที่: ถ้าเป็น monthly ไม่ต้องกรองวันที่ (หรือกรองตามเดือน) แต่ถ้า daily ต้องตรงกัน
    const isSameDate = viewMode === "daily" ? c.date === selectedDate : true;
    const isSameStatus =
      filterStatus === "all" ? true : c.status === filterStatus;
    const searchLower = searchText.toLowerCase();
    const isMatchSearch =
      c.game.toLowerCase().includes(searchLower) ||
      c.problem.toLowerCase().includes(searchLower) ||
      c.details.toLowerCase().includes(searchLower);

    return isSameDate && isSameStatus && isMatchSearch;
  });

  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const casesOfSelectedDate = cases;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto font-sans text-slate-900 pb-20 
      bg-gradient-to-br from-blue-100 via-slate-100 to-blue-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900"
    >
      {" "}
      {/* contanier  Background Dark Mode */}
      {/* Header Bar */}
      <PageHeader
        title="Daily Report"
        subtitle="รายงานประจำวัน"
        icon={<FileText size={24} />}
        left={
          <>
            <BackIconButton />

            <ButtonHome onClick={() => navigate("/menu")} />
          </>
        }
        right={
          <>
            {/* ปุ่มสลับ รายวัน-> รายเดือน */}
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

            <div className="w-48">
              <CustomDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="เลือกวันที่"
              />
            </div>

            <ExportButton
              onClick={handleExport}
              isExporting={isExporting}
              disabled={casesOfSelectedDate.length === 0}
            />

            <ButtonSend
              onClick={handleOpenEmailModal}
              disabled={casesOfSelectedDate.length === 0}
            />
          </>
        }
      />
      <main
        id="report-content"
        className="max-w-[70%] mx-auto px-4 sm:px-6 lg:px-1 py-8"
      >
        {/* Date Header Display */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {/* เช็ค viewMode เพื่อเปลี่ยนคำพูด */}
            {viewMode === "daily"
              ? "ภาพรวมประจำวันที่"
              : "ภาพรวมประจำเดือน"}{" "}
            <span className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600/20 dark:border-blue-400/30 px-1">
              {/* เป็น วันเดือนปี  */}
              {selectedDate ? selectedDate.split("-").reverse().join("-") : ""}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-left">
            สรุปข้อมูลการดำเนินงาน
            {viewMode === "daily" ? "ประจำวัน" : "ตลอดทั้งเดือน"}
          </p>
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <ReportDashboard
            cases={filteredCases}
            selectedDate={selectedDate}
            viewMode={viewMode}
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
                  bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400   "
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
                  <th className="px-6 py-4 whitespace-nowrap ">Game/Problem</th>
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
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2
                          size={32}
                          className="animate-spin text-blue-500"
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
                      hover:bg-slate-50 dark:hover:bg-slate-700/50" /* Row Hover Dark Mode */
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
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Gamepad2
                              size={14}
                              className="text-blue-500 dark:text-blue-400"
                            />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-500  tracking-wide">
                              {item.game}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 ">
                            {item.problem}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 ">
                            <span className="font-medium text-slate-900 dark:text-white">
                              รายละเอียด:
                            </span>{" "}
                            {item.details}
                          </p>
                          {item.solution && (
                            <div
                              className="text-xs px-3 py-2 rounded-lg 
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
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                              bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                            >
                              R
                            </div>
                            <span className="text-sm font-normal text-slate-700 dark:text-slate-300">
                              {item.reporter}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                              bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            >
                              O
                            </div>
                            <span className="text-sm font-normal text-slate-700 dark:text-slate-300">
                              {item.operator}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 3. ถ้าโหลดเสร็จแล้วแต่ไม่มีข้อมูล -> แสดง ไม่พบข้อมูลในวันที่เลือก
                  <tr>
                    <td
                      colSpan="8" //คอลัมน์
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
                  )
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
                      <CalendarIcon size={14} className="text-blue-500" />
                      {i === 0
                        ? `${selectedCaseDetail.startTime} - ${selectedCaseDetail.endTime}`
                        : i === 1
                        ? selectedCaseDetail.startDate ||
                          selectedCaseDetail.date
                        : selectedCaseDetail.endDate || selectedCaseDetail.date}
                    </p>
                  </div>
                ))}
              </div>

              {/* ROW 2: Game & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                    Game
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    <Gamepad2 size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {selectedCaseDetail.game}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <div className="flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
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
      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]
            bg-white dark:bg-slate-800"
          >
            {" "}
            {/* Modal Container Dark Mode */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Send
                  size={25}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Send Email
              </h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <label className=" text-sm font-normal text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <User size={16} /> Select Recipients
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsRecipientDropdownOpen(!isRecipientDropdownOpen)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition-all 
                      bg-white dark:bg-slate-900
                      ${
                        isRecipientDropdownOpen
                          ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex flex-wrap gap-2 items-center w-full overflow-hidden">
                      {selectedRecipientIds.length === 0 ? (
                        <span className="text-slate-400">
                          Select email addresses...
                        </span>
                      ) : (
                        <>
                          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-normal whitespace-nowrap">
                            {selectedRecipientIds.length} Selected
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">
                            {availableRecipients
                              .filter((u) =>
                                selectedRecipientIds.includes(u.recipient_id)
                              )
                              .map((u) => u.email)
                              .join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                    {isRecipientDropdownOpen ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </button>
                  {isRecipientDropdownOpen && (
                    <div
                      className="absolute z-20 left-0 right-0 mt-2 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-100
                      bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      {availableRecipients.length > 0 ? (
                        availableRecipients.map((user) => {
                          const isSelected = selectedRecipientIds.includes(
                            user.recipient_id
                          );
                          return (
                            <div
                              key={user.recipient_id}
                              onClick={() => toggleRecipient(user.recipient_id)}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div
                                className={`shrink-0 ${
                                  isSelected
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-300"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckSquare size={20} />
                                ) : (
                                  <Square size={20} />
                                )}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <span className="text-sm truncate font-normal text-left text-slate-500 dark:text-slate-400">
                                  {user.name}
                                </span>
                                <span className="font-normal text-sm truncate text-left text-slate-800 dark:text-slate-200">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          No recipients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium uppercase mb-1 text-left ml-1 text-slate-500 dark:text-slate-400">
                    Subject
                  </label>
                  <input
                    value={emailSubject}
                    maxLength={200}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase mb-1 text-left ml-1 text-slate-500 dark:text-slate-400">
                    Message
                  </label>
                  <textarea
                    value={emailBody}
                    maxLength={500}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    className="w-full font-normal px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              {/* ส่วน Attachments ที่ถูกต้อง (เริ่ม) */}
              <div>
                <label className=" text-sm font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Paperclip size={16} /> Attachments (ไม่บังคับ, สูงสุด 5 ไฟล์)
                </label>

                <div className="space-y-3">
                  {/* วนลูป 5 ช่อง */}
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {file ? (
                        // --- Display Area when File Exists ---
                        <div className="flex-1 flex items-center justify-between p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText
                              size={16}
                              className="text-indigo-500 shrink-0"
                            />
                            <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                              {file.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        // --- Upload Area when Slot is Empty ---
                        <div className="flex-1">
                          <label
                            htmlFor={`file-input-${index}`}
                            className="block border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:border-indigo-400 transition-colors group
                              border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <span className="text-sm font-medium flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                              <Paperclip
                                size={16}
                                className="text-slate-400 group-hover:text-indigo-500"
                              />
                              Click to attach File {index + 1}
                            </span>
                          </label>
                          <input
                            id={`file-input-${index}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, index)}
                            accept={CONFIG.ALLOWED_FILE_TYPES.join(",")}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <p className="text-xs mt-1 text-left text-slate-400">
                    * ไฟล์แนบแต่ละไฟล์สูงสุด {CONFIG.MAX_FILE_SIZE_MB}MB (PDF,
                    JPG, PNG, DOCX, XLSX, XLS)
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-sm transition-colors
                  bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <ButtonConfirmsend
                onClick={handleSendEmail}
                isLoading={isLoading}
              >
                {" "}
                Confirm Send
              </ButtonConfirmsend>
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
