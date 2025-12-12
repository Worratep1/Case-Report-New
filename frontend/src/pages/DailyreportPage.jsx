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
  BarChart2,
  PieChart as PieChartIcon,
  Home,
  FileDown,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { getCases } from "../api/case";
import { getProblems } from "../api/problems";
import { getStatuses } from "../api/status";
import { getproducts } from "../api/products";
import { getRecipients } from "../api/recipients";
import { sendDailyReport } from "../api/report";
import { exportReport } from "../api/export";
import { useNavigate } from "react-router-dom";
import ExportButton from "../components/ButtonExport";
import ButtonSend from "../components/ButtonSend";
import ButtonHome from "../components/ButtonHome";
import { STATUS_CONFIG } from "../constants/status";
import ActionFeedbackModal from "../components/ActionFeedbackModal";

// --- CONSTANTS ---
const CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [
    "application/pdf", // PDF
    "image/jpeg", // JPG/JPEG
    "image/png", // PNG
    "application/msword", // DOC
    "application/vnd.ms-excel", //  XLS
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", //  XLSX
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  ],
};

const ITEMS_PER_PAGE = 5;

// --- HELPER FUNCTIONS (TIMEZONE SAFE) ---

// 1. Get Today as "YYYY-MM-DD" safely using Local Time
const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 2. Format Date Object to "YYYY-MM-DD" safely
const formatDateToISO = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 3. Parse "YYYY-MM-DD" string to Date Object safely
const parseISODate = (dateStr) => {
  if (!dateStr) return new Date(); // Default to today
  const [year, month, day] = dateStr.split("-").map(Number);
  // Set time to 12:00:00 to prevent timezone shift issues on Date boundaries
  return new Date(year, month - 1, day, 12, 0, 0);
};

// --- INTERNAL DASHBOARD COMPONENTS ---

const StatCard = ({ title, value, icon, color }) => (
  <div
    className={`bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-0.5">{title}</p>
        <h3 className="text-4xl font-bold text-slate-800 leading-none">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

const StatusSummaryCard = ({ data }) => {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (value === 0) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: "11px",
          fontWeight: "bold",
          textShadow: "0px 1px 2px rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-center hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <PieChartIcon size={14} /> Status Summary
        </h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 h-full">
        {/* Donut Chart */}
        <div className="w-full sm:w-1/2 h-[140px] relative">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
              <PieChartIcon size={32} className="mb-1 opacity-50" />
              <p className="text-xs">No Data</p>
            </div>
          )}
        </div>

        {/* Status List */}
        <div className="w-full sm:w-1/2 grid grid-cols-1 gap-y-3">
          {data && data.length > 0 ? (
            data.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-[10px] text-slate-500 font-medium truncate">
                  {entry.name}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ({entry.value})
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center col-span-2">
              No data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportDashboard = ({ cases = [], selectedDate }) => {
  const dashboardData = useMemo(() => {
    const safeCases = Array.isArray(cases) ? cases : [];
    const stats = { total: safeCases.length };
    const counts = {};
    const gameMap = {};

    safeCases.forEach((c) => {
      if (!c) return;
      const status = c.status || "others";
      counts[status] = (counts[status] || 0) + 1;
      const game = c.game || "Unknown";
      gameMap[game] = (gameMap[game] || 0) + 1;
    });

    const pieData = Object.keys(STATUS_CONFIG)
      .map((key) => {
        const count = counts[key] || 0;
        return {
          name: STATUS_CONFIG[key].label,
          value: count,
          color: STATUS_CONFIG[key].color,
        };
      })
      .filter((item) => item.value > 0);

    const chartData = Object.keys(gameMap)
      .map((game) => ({
        name: game,
        count: gameMap[game],
      }))
      .sort((a, b) => b.count - a.count);

    return { stats, pieData, chartData };
  }, [cases]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 
    duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <StatCard
            title="Total Cases"
            value={dashboardData.stats.total}
            icon={<AlertCircle className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50 border-blue-100"
          />
        </div>
        <div className="md:col-span-2">
          <StatusSummaryCard data={dashboardData.pieData} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="text-blue-500" size={24} />
          <h3 className="text-lg font-medium text-slate-800">
            Game Issues Breakdown ({selectedDate})
          </h3>
        </div>

        <div className="h-64 w-full">
          {dashboardData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.chartData}
                margin={{ top: 7, right: 80, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{  //ทำให้ชื่อเกมเอียง 45 
                    fill: "#64748b", 
                    fontSize: 12 ,
                    angle : -45,
                    textAnchor:"end"
                  }}
                  dy={10}
                  height={60} //ไม่ให้ตัวชื่อเกมตกลงไป
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  allowDecimals={false}
                />
                {/* <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                /> */}

                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  //  ใส่ label เพื่อโชว์เลขบนหัวกราฟ
                  label={{
                    position: "top",
                    fill: "#64748b",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                ></Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <BarChart2 size={32} className="mb-2 opacity-50" />
              <span className="text-sm">ยังไม่มีเคสในวันที่เลือก</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- UI COMPONENTS ---

const CustomDatePicker = ({ value, onChange, placeholder = "Select date" }) => {
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
                ? "bg-indigo-600 text-white"
                : "hover:bg-indigo-50 text-slate-700"
            }
            ${
              isToday && !isSelected
                ? "border border-indigo-600 text-indigo-600"
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
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all duration-200
          ${
            isOpen
              ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm"
              : "hover:border-indigo-300"
          }
        `}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-indigo-500" />
          <span
            className={`${
              value ? "text-slate-700 font-medium" : "text-slate-400"
            }`}
          >
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 w-[300px] animate-in fade-in zoom-in-95 duration-200 left-0 sm:left-auto right-0 sm:right-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">
              {thaiMonths[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
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
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={clearDate}
              className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              ล้างค่า
            </button>
            <button
              onClick={setToday}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
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
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all duration-200
          ${
            isOpen
              ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm"
              : "hover:border-indigo-300"
          }
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
          <span
            className={`truncate ${
              !value ? "text-slate-400" : "text-slate-700 font-medium"
            }`}
          >
            {getDisplayLabel()}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100">
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
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} border-transparent`}
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
  
   const [feedbackModal,setFeedbackModal] =useState({
    isOpen: false,
    type: "success",
    title: "",
    message : "",
    onConfirm : ()=>{}
   });
  
   const closeFeedbackModal = () => {
    setFeedbackModal(prev => ({ ...prev, isOpen: false }));
  };


  // --- 1. STATE ---
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ข้อมูล Cases
  const [cases, setCases] = useState([]);
  const [lookupData, setLookupData] = useState({
    products: [],
    statuses: [],
    problem: [],
  });

  const [loadingData, setLoadingData] = useState(false);

  // UI States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  // ดึงข้อมูล Cases เมื่อเปลี่ยนวันที่ (selectedDate)

  useEffect(() => {
    const fetchCases = async () => {
      if (!selectedDate) return;

      setLoadingData(true);
      try {
        // เรียก API ส่ง query params ?date=YYYY-MM-DD
        const res = await getCases({ date: selectedDate });
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
          const startTimeStr = formatTime(start);
          const endTimeStr = formatTime(end);

          // คำนวณระยะเวลา (นาที)
          const diffMs = end - start;
          const durationMins = Math.floor(diffMs / 60000);
          const durationStr =
            durationMins > 60
              ? `${Math.floor(durationMins / 60)} ชม. ${durationMins % 60} นาที`
              : `${durationMins} นาที`;

          // 3. แปลง Status ให้ตรงกับ key ใน STATUS_CONFIG (ต้องเป็นตัวพิมพ์เล็กภาษาอังกฤษ)
          // สมมติใน DB เก็บชื่อ status_name เป็น "open"
          const statusKey = statusObj?.status_name?.toLowerCase() || "others";

          return {
            id: c.case_id,
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: durationStr,
            problem: problemObj ? problemObj.problem_name : "Unknown Problem",
            game: productObj ? productObj.product_name : "Unknown Game",
            details: c.description,
            solution: c.solution,
            reporter: c.requester_name,
            operator: c.solver,
            status: statusKey, // ต้องตรงกับ key ใน STATUS_CONFIG ด้านบน
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

    // รอให้โหลด Master Data เสร็จก่อนค่อยดึง Case เพื่อให้ map ชื่อถูก
    if (lookupData.products.length > 0 || lookupData.statuses.length > 0) {
      fetchCases();
    }
  }, [selectedDate, lookupData]);

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
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // เรียก API ไปดึงไฟล์ Excel (แบบ blob)
      const blob = await exportReport(selectedDate);

      if (!blob) {
        throw new Error("ไม่พบข้อมูลไฟล์จากเซิร์ฟเวอร์");
      }

      // สร้าง URL ชั่วคราวจาก blob
      const url = window.URL.createObjectURL(blob);

      // สร้าง <a> ชั่วคราวเพื่อดาวน์โหลดไฟล์
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `daily-report-${selectedDate}.xlsx`;
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
      type: 'error',
      title: 'Export ไม่สำเร็จ',
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ กรุณาลองใหม่อีกครั้ง'
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
        type: 'error',
        title: 'ไม่สามารถอัปโหลดไฟล์นี้ได้',
        message: errors.join('\n') 
    });
      // alert(`ไม่สามารถอัปโหลดไฟล์นี้ได้:\n- ${errors.join("\n- ")}`);
      e.target.value = null; // เคลียร์ input field เพื่อให้เลือกใหม่ได้
      return;
    }

    // 5. อัปเดต State array ณ ตำแหน่ง index ที่ส่งเข้ามา
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
        type: 'error', 
        title: 'เลือกผู้รับ',
        message: 'กรุณาเลือกผู้รับอีเมลอย่างน้อย 1 คน'
      });
      return;
    }

    // 1) ดึง email จาก recipients ที่เลือก
    const toEmails = availableRecipients
      .filter((r) => selectedRecipientIds.includes(r.recipient_id))
      .map((r) => r.email);

    // if (toEmails.length === 0) {
    //   alert("ไม่พบอีเมลของผู้รับที่เลือก");
    //   return;
    // }

    // 2) สร้าง FormData
    const formData = new FormData();
    formData.append("toEmails", JSON.stringify(toEmails));
    formData.append("subject", emailSubject);
    formData.append("body", emailBody);

    // 3) แนบไฟล์ (จาก state attachedFiles ที่ฟอร์ดทำไว้แล้ว)
    attachedFiles
      .filter((file) => !!file) // เอาเฉพาะช่องที่มีไฟล์จริง
      .forEach((file) => {
        formData.append("attachments", file); // ชื่อ field ต้องตรงกับ upload.array("attachments")
      });

    // const payload = {
    //   toEmails, // <- array ตามที่ backend ต้องการ
    //   subject: emailSubject, // string
    //   body: emailBody, // string (ข้อความธรรมดา)
    // };

    setIsLoading(true);

    try {
      await sendDailyReport(formData); // ✅ เรียก API ที่เราแก้ในข้อ 1
      setIsEmailModalOpen(false);
      // setIsSuccessModalOpen(true);
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'ส่งรายงานเรียบร้อย',
        message: 'ระบบได้ทำการส่งอีเมลรายงานให้ผู้รับเรียบร้อยแล้ว'
      });

      // reset ฟอร์ม
      setSelectedRecipientIds([]);
    } catch (error) {
      console.error("Error sending email:", error);
       setFeedbackModal({
        isOpen: true,
         type: 'error',
          title: 'ส่งเมลไม่สำเร็จ',
           message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredCases = cases.filter((c) => {
    const isSameDate = c.date === selectedDate;
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

  // Data for Dashboard Cards
  const casesOfSelectedDate = cases.filter((c) => c.date === selectedDate);

  // TODO: [BACKEND] selectedDate ตัวนี้สามารถใช้เป็นพารามิเตอร์เรียก API
  // เพื่อดึงข้อมูลรายงานประจำวันที่เลือกจากฐานข้อมูลจริงได้

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-3 md:py-0 gap-3 md:gap-0">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                <button
                  className=" p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                  onClick={() => window.history.back()}
                  aria-label="Go back"
                >
                  <ChevronLeft size={24} />
                </button>

                <ButtonHome onClick={() => navigate("/menu")} />
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-white " />
                </div>
                <div>
                  <h1 className="text-xl font-medium text-slate-800 leading-tight">
                    {" "}
                    Daily Report{" "}
                  </h1>
                  <p className="text-xs text-slate-500">ระบบรายงานประจำวัน</p>
                </div>
              </div>
            </div>

            {/* Controls */}

            <div className="flex items-center gap-3 w-full md:w-auto justify-end  ">
              <div className="w-48 ">
                <CustomDatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder="เลือกวันที่"
                />
              </div>

              {/* ปุ่ม Export Report */}

              <ExportButton
                onClick={handleExport}
                isExporting={isExporting}
                disabled={casesOfSelectedDate.length === 0}
              />

              {/* ปุ่ม send report mail */}

              <ButtonSend
                onClick={handleOpenEmailModal}
                disabled={casesOfSelectedDate.length === 0}
              />

              {/* <button
                onClick={handleOpenEmailModal}
                disabled={casesOfSelectedDate.length === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm font-normal ml-2 whitespace-nowrap
                    duration-300 hover:-translate-y-1  hover:shadow-md
                    ${
                      casesOfSelectedDate.length === 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                    }`}
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send Report</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Header Display */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            ภาพรวมประจำวันที่{" "}
            <span className="text-indigo-600 border-b-2 border-indigo-600/20 px-1">
              {selectedDate}
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 text-left">
            สรุปข้อมูลการดำเนินงานประจำวัน
          </p>
        </div>

        {/* [UPDATED] Include Internal ReportDashboard Component */}
        <div className="mb-8">
          <ReportDashboard
            cases={casesOfSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-4 rounded-t-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h2 className="text-lg font-semibold text-slate-800">
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
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ค้นหาปัญหา, เกม..."
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-hidden min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="px-6 py-4 w-16 text-center">ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time / Duration</th>
                  <th className="px-6 py-4">Game / Problem</th>
                  <th className="px-6 py-4">Details / Solution</th>
                  <th className="px-6 py-4">Requester / Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. เช็คว่ากำลังโหลดข้อมูลอยู่หรือไม่ */}
                {loadingData ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2
                          size={32}
                          className="animate-spin text-indigo-500"
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
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      title="คลิกเพื่อดูรายละเอียด"
                    >
                      <td className="px-6 py-4 whitespace-nowrap align-top text-center text-slate-400 font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" />
                            {item.startTime} - {item.endTime}
                          </div>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 w-fit">
                            ใช้เวลา: {item.duration}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Gamepad2 size={14} className="text-indigo-500" />
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                              {item.game}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-800 line-clamp-1">
                            {item.problem}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            <span className="font-medium text-slate-900">
                              รายละเอียด:
                            </span>{" "}
                            {item.details}
                          </p>
                          {item.solution && (
                            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg line-clamp-2">
                              <span className="font-medium text-emerald-700">
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
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-medium">
                              R
                            </div>
                            <span className="text-sm text-slate-700 font-normal">
                              {item.reporter}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                              O
                            </div>
                            <span className="text-sm text-slate-700 font-normal">
                              {item.operator}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 3. ถ้าโหลดเสร็จแล้วแต่ไม่มีข้อมูล -> แสดง Empty State
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="text-slate-300" />
                        <p>ไม่พบข้อมูลในวันที่เลือก</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              หน้า {currentPage} จาก {totalPages} ({filteredCases.length}{" "}
              รายการ)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50"
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
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-slate-600 hover:bg-slate-50"
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
                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- CASE DETAIL MODAL (Updated Layout) --- */}
      {isCaseDetailModalOpen && selectedCaseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-xl text-slate-800">
                  Case Details
                </h3>
              </div>
              <button
                onClick={() => setIsCaseDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-left">
              {/* ROW 1: Time and Dates (3 Columns) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Time Period
                  </label>
                  <p className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-500" />
                    {selectedCaseDetail.startTime} -{" "}
                    {selectedCaseDetail.endTime}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Start Date
                  </label>
                  <p className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-indigo-500" />
                    {selectedCaseDetail.startDate || selectedCaseDetail.date}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    End Date
                  </label>
                  <p className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-indigo-500" />
                    {selectedCaseDetail.endDate || selectedCaseDetail.date}
                  </p>
                </div>
              </div>

              {/* ROW 2: Game & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Game
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white">
                    <Gamepad2 size={16} className="text-indigo-500" />
                    <span className="text-sm font-medium text-slate-800">
                      {selectedCaseDetail.game}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Status
                  </label>
                  <div className="flex items-center px-3 py-2 border border-slate-200 rounded-lg bg-white">
                    <StatusBadge status={selectedCaseDetail.status} />
                  </div>
                </div>
              </div>

              {/* ROW 3: Problem  */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  ปัญหา (Problem)
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                  {selectedCaseDetail.problemType || selectedCaseDetail.problem}
                </div>
              </div>

              {/* ROW 4: Details */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  รายละเอียด (Details)
                </label>
                <textarea
                  disabled
                  rows={3}
                  value={selectedCaseDetail.details}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* ROW 5: Solution */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block text-emerald-700">
                  วิธีการแก้ไข (Solution)
                </label>
                <textarea
                  disabled
                  rows={3}
                  value={selectedCaseDetail.solution || "-"}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-800 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* ROW 6: People */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-slate-700  mb-1 flex items-center gap-1.5">
                    <User size={14} className="text-orange-500" /> ผู้ร้องขอ
                    (Requester)
                  </label>
                  <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white">
                    {selectedCaseDetail.reporter}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700  mb-1 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" /> ผู้ดำเนินเเก้ไข
                    (Operator)
                  </label>
                  <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white">
                    {selectedCaseDetail.operator}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsCaseDetailModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-medium text-xl text-slate-800 flex items-center gap-2">
                <Send size={20} className="text-indigo-600" />
                Send Daily Report
              </h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <label className=" text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <User size={16} /> Select Recipients
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsRecipientDropdownOpen(!isRecipientDropdownOpen)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white text-left transition-all ${
                      isRecipientDropdownOpen
                        ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2 items-center w-full overflow-hidden">
                      {selectedRecipientIds.length === 0 ? (
                        <span className="text-slate-400">
                          Select email addresses...
                        </span>
                      ) : (
                        <>
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-normal whitespace-nowrap">
                            {selectedRecipientIds.length} Selected
                          </span>
                          <span className="text-sm text-slate-600 truncate flex-1">
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
                      <ChevronUp
                        size={20}
                        className="text-slate-400 shrink-0 ml-2"
                      />
                    ) : (
                      <ChevronDown
                        size={20}
                        className="text-slate-400 shrink-0 ml-2"
                      />
                    )}
                  </button>
                  {isRecipientDropdownOpen && (
                    <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-100">
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
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div
                                className={`shrink-0 ${
                                  isSelected
                                    ? "text-indigo-600"
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
                                <span className="text-sm truncate text-slate-500 font-normal text-left">
                                  {user.name}
                                </span>
                                <span className="font-normal text-sm truncate text-slate-800 text-left ">
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 text-left ml-1">
                    Subject
                  </label>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 text-left ml-1">
                    Message
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
              {/* ส่วน Attachments ที่ถูกต้อง (เริ่ม) */}
              <div>
                <label className=" text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Paperclip size={16} /> Attachments (ไม่บังคับ, สูงสุด 5 ไฟล์)
                </label>

                <div className="space-y-3">
                  {/* วนลูป 5 ช่อง */}
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {file ? (
                        // --- Display Area when File Exists ---
                        <div className="flex-1 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText
                              size={16}
                              className="text-indigo-500 shrink-0"
                            />
                            <span className="truncate font-medium text-slate-700">
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
                            className="block border-2 border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors group"
                          >
                            <span className="text-sm text-slate-600 font-medium flex items-center justify-center gap-2 ">
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
                  <p className="text-xs text-slate-400 mt-1 text-left">
                    * ไฟล์แนบแต่ละไฟล์สูงสุด {CONFIG.MAX_FILE_SIZE_MB}MB (PDF,
                    JPG, PNG, DOCX, XLSX, XLS)
                  </p>
                </div>
              </div>
              {/* ❌ โค้ดซ้ำซ้อน 1: Input และ div แสดงไฟล์แบบเก่า */}

              {/* ❌ โค้ดซ้ำซ้อน 2: List แสดงไฟล์แนบแบบเก่า */}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin " />
                ) : (
                  <Send size={16} />
                )}{" "}
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {/* {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              ส่งรายงานเรียบร้อย
            </h3>
            <p className="text-slate-500 text-center mb-6">
              ระบบได้ทำการส่งอีเมลรายงานประจำวันให้ผู้รับเรียบร้อยแล้ว
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-transform active:scale-95"
            >
              ตกลง
            </button>
          </div>
        </div>
      )} */}

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
