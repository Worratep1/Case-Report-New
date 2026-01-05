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
  Loader2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus,
  HelpCircle,
  PieChart as PieChartIcon,
  FileCog,
  Flame,
} from "lucide-react";

import { getCases } from "../api/case";
import { getProblems } from "../api/problems";
import { getStatuses } from "../api/status";
import { getproducts } from "../api/products";
import { createCase } from "../api/case";
import { deleteCase } from "../api/case";
import { updateCase } from "../api/case";
import { getMembers } from "../api/member";
import { getRecipients } from "../api/recipients";
import { sendDailyReport } from "../api/report";
import { exportReport } from "../api/export";
import { useNavigate } from "react-router-dom";
import { captureReportImage } from "../utils/reportCapture";

import BackIconButton from "../components/BackIconButton.jsx";
import ExportButton from "../components/ButtonExport";
import ButtonHome from "../components/ButtonHome";
import ButtonSend from "../components/ButtonSend";
import ButtonCancel from "../components/ButtonCancel";
import ButtonSave from "../components/ButtonSave";
import ActionFeedbackModal from "../components/ActionFeedbackModal";
import ButtonConfirmsend from "../components/ButtonConfirmsend.jsx";
import ViewModeToggle from "../components/ViewModeToggle";
import PageHeader from "../components/PageHeader.jsx";
import SearchInput from "../components/SearchInput.jsx";

// --- IMPORT DASHBOARD COMPONENTS ---
import StatCard from "../components/dashboard/StatCard";
import DowntimeBarChart from "../components/dashboard/DowntimeBarChart";
import StatusPieChart from "../components/dashboard/StatusPieChart";

import { STATUS_CONFIG } from "../constants/status";

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

// Helper: Get Today's Date String YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split("T")[0];

// --- CUSTOM DATE PICKER COMPONENT ---
const CustomDatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
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
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const offset = newDate.getTimezoneOffset();
    const localDate = new Date(newDate.getTime() - offset * 60 * 1000);
    onChange(localDate.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1
    );
    setViewDate(newDate);
  };

  const setToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    const todayStr = localDate.toISOString().split("T")[0];
    onChange(todayStr);
    setViewDate(today);
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
      const currentDayStr = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        i
      )
        .toISOString()
        .split("T")[0];
      const checkDate = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        i
      );
      const checkDateStr = new Date(
        checkDate.getTime() - checkDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const isSelected = value === checkDateStr;
      const isToday = checkDateStr === getTodayString();

      days.push(
        <button
          type="button"
          key={i}
          onClick={() => handleDayClick(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
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
          <CalendarDays size={18} className=" text-blue-500" />
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
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
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
              type="button"
              onClick={clearDate}
              className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              ล้างค่า
            </button>
            <button
              type="button"
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

// --- CUSTOM TIME PICKER COMPONENT ---
const CustomTimePicker = ({ value, onChange, placeholder = "--:--" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [selectedHour, selectedMinute] = value ? value.split(":") : ["", ""];

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

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const handleSelect = (type, val) => {
    let newHour = selectedHour || "00";
    let newMinute = selectedMinute || "00";

    if (type === "hour") newHour = val;
    if (type === "minute") newMinute = val;

    onChange(`${newHour}:${newMinute}`);
  };

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
          <Clock size={18} className="text-blue-500" />
          <span
            className={`${
              value
                ? "text-slate-700 dark:text-slate-200 font-medium"
                : "text-slate-400"
            }`}
          >
            {value || placeholder}
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
          className="absolute z-50 mt-2 rounded-xl shadow-xl border w-full sm:w-48 overflow-hidden animate-fade-in-down flex flex-col
          bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
        >
          {/* 1. แยก Header ออกมาเป็นแถวเดียว ไม่ใช้ Sticky ภายในช่องเลื่อน */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex-1 py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
              ชม.
            </div>
            <div className="flex-1 py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400 border-l border-slate-100 dark:border-slate-700">
              นาที
            </div>
          </div>

          {/* 2. ส่วนช่องเลื่อน กำหนดความสูงให้ชัดเจนเหมือน CasePage */}
          <div className="flex h-48">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
              {hours.map((h) => (
                <div
                  key={h}
                  onClick={() => handleSelect("hour", h)}
                  className={`py-2 text-center text-sm cursor-pointer transition-colors ${
                    selectedHour === h
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto border-l border-slate-100 dark:border-slate-700 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
              {minutes.map((m) => (
                <div
                  key={m}
                  onClick={() => handleSelect("minute", m)}
                  className={`py-2 text-center text-sm cursor-pointer transition-colors ${
                    selectedMinute === m
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CUSTOM SELECT COMPONENT ---
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
          className="absolute z-50 w-full mt-1.5 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100 text-left
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

// --- Status Badge Component ---
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
export default function CustomReport() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("daily");

  // --- 1. STATE ---
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Edit & Delete & Save Confirm Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState(null);

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

  // Data State
  const [cases, setCases] = useState([]);
  const [lookupData, setLookupData] = useState({
    products: [],
    statuses: [],
    problems: [],
    users: [],
  });

  const [loadingData, setLoadingData] = useState(false);

  //export file
  const [isExporting, setIsExporting] = useState(false);

  // Email States
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  //  ประกาศ State 5 ช่อง
  const [attachedFiles, setAttachedFiles] = useState(Array(5).fill(null));
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // --- 2. EFFECTS (API CALLS) ---
  useEffect(() => {
    const fetchLookup = async () => {
      try {
        const [resProds, resStats, resProbs, resUsers, resRecipients] =
          await Promise.all([
            getproducts(),
            getStatuses(),
            getProblems(),
            getMembers(),
            getRecipients(),
          ]);
        setLookupData({
          products: resProds.products || [],
          statuses: resStats.statuses || resStats.data || [],
          problems: resProbs.problems || [],
          users: resUsers.users || resUsers.data || [],
          recipients: resRecipients.recipients || [],
        });

        setAvailableRecipients(resRecipients || []);
      } catch (err) {
        console.error("Error fetching master data:", err);
      }
    };
    fetchLookup();
  }, []);

  // 2.2 โหลด Cases ตามวันที่
  const fetchCases = async () => {
    if (!selectedDate) {
      // กดล้างค่าข้อมูลจะไม่มีขึ้นมา
      setCases([]);
      return;
    }
    setLoadingData(true);
    try {
      const res = await getCases({
        date: selectedDate,
        mode: viewMode,
      });

      const rawCases = res.cases || [];

      const formatDate = (date) => {
        if (!date || isNaN(date)) return "-";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}/${year}`;
      };

      // แปลงข้อมูลให้ตรงกับ UI
      const mappedCases = rawCases.map((c) => {
        const productObj = lookupData.products.find(
          (p) => p.product_id === c.product_id
        );
        const statusObj = lookupData.statuses.find(
          (s) => s.status_id === c.status_id
        );
        const problemObj = lookupData.problems.find(
          (p) => p.problem_id === c.problem_id
        );

        const start = new Date(c.start_datetime);
        const end = new Date(c.end_datetime);
        const startDateStr = formatDate(start);
        const endDateStr = formatDate(end);
        const formatTime = (d) =>
          d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

        const diffMs = end - start;
        const durationMins = Math.floor(diffMs / 60000);
        const durationStr =
          durationMins > 60
            ? `${Math.floor(durationMins / 60)} ชม. ${durationMins % 60} นาที`
            : `${durationMins} นาที`;

        const statusKey =
          (statusObj?.status_name || "").toLowerCase().replace(/\s+/g, "") ||
          "others";
        const finalStatus = STATUS_CONFIG[statusKey] ? statusKey : "others";

        const getLocalDateString = (dateObj) => {
          if (!dateObj || isNaN(dateObj)) return "";
          const offset = dateObj.getTimezoneOffset() * 60000;
          return new Date(dateObj.getTime() - offset)
            .toISOString()
            .split("T")[0];
        };

        return {
          ...c,
          id: c.case_id,
          startTime: formatTime(start),
          endTime: formatTime(end),
          startDate: startDateStr,
          raw_start_date: getLocalDateString(start), // เก็บ "2025-12-22"
          raw_end_date: getLocalDateString(end), //  เก็บ "2025-12-22"
          endDate: endDateStr,
          duration: durationStr,
          durationMins: durationMins,
          problem: problemObj ? problemObj.problem_name : "Unknown",
          game: productObj ? productObj.product_name : "Unknown",
          details: c.description,
          solution: c.solution,
          reporter: c.requester_name,
          operator: c.solver,
          status: finalStatus,
          date: selectedDate,

          raw_product_id: c.product_id,
          raw_status_id: c.status_id,
          raw_problem_id: c.problem_id,
        };
      });

      setCases(mappedCases);
    } catch (err) {
      console.error("Error loading cases:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (lookupData.statuses.length > 0 || lookupData.products.length > 0) {
      fetchCases();
    }
  }, [selectedDate, lookupData, viewMode]);

  // --- DASHBOARD DATA CALCULATION (UPDATED LOGIC) ---
  const casesOfSelectedDate = cases.filter((c) => c.date === selectedDate);

  const filteredCases = cases.filter((c) => {
    const isSameStatus =
      filterStatus === "all" ? true : c.status === filterStatus;

    const searchLower = searchText.toLowerCase();
    const isMatchSearch =
      (c.game || "").toLowerCase().includes(searchLower) ||
      (c.problem || "").toLowerCase().includes(searchLower) ||
      (c.details || "").toLowerCase().includes(searchLower);

    return isSameStatus && isMatchSearch;
  });

  const dashboardData = useMemo(() => {
    const safeCases = filteredCases; //ข้อมูลเปลี่ยนตามตัวกรอง

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
  }, [filteredCases]); //casesOfSelectedDate

  const getFriendlyErrorMessage = (error) => {
    //  ตรวจสอบ Error จากฝั่ง Backend (API Response)
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    //  ตรวจสอบ Error Technical ทั่วไป
    const message = error.message || "";

    if (
      message.includes("currentUserId is not defined") ||
      message.includes("null")
    ) {
      return "กรุณาลองใหม่อีกครั้ง";
    }
    if (message.includes("Network Error")) {
      return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
    }
    if (message.includes("timeout")) {
      return "การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง";
    }

    //  ค่าเริ่มต้นถ้าไม่ตรงกับเงื่อนไขใดเลย
    return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ ";
  };

  // --- HELPER: AUTO-CALCULATE DURATION ---
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startDate = new Date(0, 0, 0, startHour, startMinute, 0);
    const endDate = new Date(0, 0, 0, endHour, endMinute, 0);

    let diff = endDate.getTime() - startDate.getTime();
    if (diff < 0) return "เวลาไม่ถูกต้อง ";

    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours} ชม. ${
        remainingMinutes > 0 ? remainingMinutes + " นาที" : ""
      }`;
    }
    return `${minutes} นาที`;
  };

  useEffect(() => {
    // ถ้า Modal ปิดอยู่ หรือยังไม่มีข้อมูล case ไม่ต้องทำอะไร
    if (!isEditModalOpen || !currentCase) return;

    const { date, endDate, startTime, endTime } = currentCase;

    // ข้อมูลต้องครบถึงจะคำนวณ
    if (!date || !startTime || !endTime) return;

    const startStr = `${date}T${startTime}:00`;
    const endStr = `${endDate || date}T${endTime}:00`;

    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    const diffMs = endObj - startObj;

    let newDuration = "";

    if (diffMs < 0) {
      // กรณีเวลาติดลบ (จบก่อนเริ่ม)
      newDuration = "เวลาไม่ถูกต้อง ";
    } else {
      // กรณีเวลาถูกต้อง -> แปลงเป็น ชั่วโมง/นาที
      const totalMinutes = Math.floor(diffMs / 60000);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      if (h > 0) {
        newDuration = `${h} ชม. ${m > 0 ? m + " นาที" : ""}`;
      } else {
        newDuration = `${totalMinutes} นาที`;
      }
    }

    if (currentCase.duration !== newDuration) {
      setCurrentCase((prev) => ({ ...prev, duration: newDuration }));
    }
  }, [
    currentCase?.date,
    currentCase?.endDate,
    currentCase?.startTime,
    currentCase?.endTime,
    isEditModalOpen,
  ]);

  // --- 3. ACTIONS (ADD / EDIT / DELETE) ---

  const handleTimeChange = (field, value) => {
    // อัปเดตแค่ค่า field นั้นๆ พอ (ไม่ต้องคำนวณ duration ที่นี่แล้ว)
    setCurrentCase((prev) => ({ ...prev, [field]: value }));
  };

  const openNewCaseModal = () => {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMinute = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`; // เช่น "14:30"
    setCurrentCase({
      id: null,
      date: selectedDate,
      endDate: selectedDate,
      startTime: currentTime,
      endTime: currentTime,
      duration: "",

      // ใช้ ID สำหรับ Dropdown
      product_id: null,
      status_id: null,
      problem_id: null,

      details: "",
      solution: "",
      reporter: "",
      operator: "", // Default value
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentCase({
      ...item,
      date: item.raw_start_date, // ใช้ค่า YYYY-MM-DD
      endDate: item.raw_end_date, // ใช้ค่า YYYY-MM-DD
      // เอาค่า raw ID มาใส่ในตัวแปรที่จะใช้กับ Form
      product_id: item.raw_product_id,
      status_id: item.raw_status_id,
      problem_id: item.raw_problem_id,

      // แปลงเวลาให้เป็น format HH:mm (ถ้ายังไม่ได้เป็น)
      startTime: item.startTime.substring(0, 5),
      endTime: item.endTime.substring(0, 5),
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setCurrentCase(item);
    setFeedbackModal({
      isOpen: true,
      type: "error", // ใช้ type error เพื่อแสดงสีแดงและไอคอนเตือน
      title: "ยืนยันการลบ?",
      message: "คุณแน่ใจหรือไม่ที่จะลบรายการเคสนี้?",
      onConfirm: () => confirmDelete(item.id), // เมื่อกดยืนยัน ให้เรียกฟังก์ชัน confirmDelete
    });
    setIsDeleteModalOpen(true);
  };

  const handleInitiateSave = (e) => {
    e.preventDefault();
    if (
      !currentCase.product_id ||
      !currentCase.status_id ||
      !currentCase.problem_id ||
      !currentCase.reporter ||
      !currentCase.operator
    ) {
      // 1. ถ้าข้อมูลไม่ครบ -> แสดง Error Modal ทันที และหยุดการทำงาน
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบ",
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return; // สำคัญ: ต้องหยุดโค้ดตรงนี้
    }

    const startStr = `${currentCase.date}T${currentCase.startTime}:00`;
    const endStr = `${currentCase.endDate || currentCase.date}T${
      currentCase.endTime
    }:00`;

    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    if (endTime <= startTime) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ช่วงเวลาไม่ถูกต้อง",
        message: "กรุณาตรวจสอบอีกครั้ง",
      });
      return; // สั่งหยุดทันที ไม่ให้ไปต่อ
    }

    setFeedbackModal({
      isOpen: true,
      type: "confirm", // เปลี่ยนเป็นประเภท confirm
      title: "ยืนยันการบันทึก?",
      message: "กรุณาตรวจสอบความถูกต้องก่อนบันทึกข้อมูล ",
      onConfirm: confirmSave, // ส่งฟังก์ชันที่จะทำงานเมื่อกดยืนยัน
    });

    setIsSaveConfirmModalOpen(true);
  };

  const confirmSave = async () => {
    setIsSaveConfirmModalOpen(false);
    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const currentUserId = userData?.user_id || userData?.id;
      const cleanDate = currentCase.date.replaceAll("/", "-");
      const cleanEndDate = (currentCase.endDate || currentCase.date).replaceAll(
        "/",
        "-"
      );

      const startDateTime = `${cleanDate}T${currentCase.startTime}:00.000`;
      const endDateTime = `${cleanEndDate}T${currentCase.endTime}:00.000`;

      const payload = {
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        product_id: currentCase.product_id,
        status_id: currentCase.status_id,
        problem_id: currentCase.problem_id,
        description: currentCase.details,
        solution: currentCase.solution,
        requester_name: currentCase.reporter,
        solver: currentCase.operator,
        created_by: currentUserId,
      };

      if (currentCase.id === null) {
        await createCase(payload);
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "สร้างเคสสำเร็จ",
          message: "ข้อมูลถูกบันทึกเรียบร้อยแล้ว",
        });
      } else {
        await updateCase(currentCase.id, payload);
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "แก้ไขข้อมูลสำเร็จ",
          message: "ข้อมูลถูกบันทึกเรียบร้อยแล้ว",
        });
      }
      setIsSaveConfirmModalOpen(false);
      setIsEditModalOpen(false);
      fetchCases();
    } catch (error) {
      console.error("Save Error:", error);

      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "บันทึกไม่สำเร็จ",
        message: getFriendlyErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // แก้ไขจากเดิมที่ไม่รับค่า ให้รับ id เข้ามา
  const confirmDelete = async (idFromModal) => {
    // ใช้ ID ที่ส่งมาจาก Modal ถ้าไม่มีค่อยไปหาจาก currentCase
    const targetId = idFromModal || currentCase?.id;

    if (!targetId) {
      console.error("No case ID found for deletion");
      return;
    }

    setIsLoading(true);
    try {
      await deleteCase(targetId); // ใช้ targetId แทน

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "ลบข้อมูลสำเร็จ",
        message: "รายการถูกลบออกจากระบบแล้ว",
        onConfirm: () => setFeedbackModal({ isOpen: false }),
      });

      setCurrentCase(null);
      fetchCases();
    } catch (error) {
      console.error("Delete Error:", error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ลบไม่สำเร็จ",
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. OTHER HANDLERS ---
  const handleOpenEmailModal = () => {
    setAttachedFiles(Array(5).fill(null)); // Reset attachedFiles เป็น 5 ช่องว่าง
    setSelectedRecipientIds([]);
    setIsRecipientDropdownOpen(false);
    setIsEmailModalOpen(true);

    setEmailSubject("");
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

      // เรียก API exportReport (ได้ blob กลับมา)
      const blob = await exportReport(
        selectedDate,
        viewMode,
        filterStatus,
        searchText
      );

      // สร้าง URL ชั่วคราวจาก blob
      const url = window.URL.createObjectURL(blob);

      // สร้างแท็ก <a> ชั่วคราวสำหรับดาวน์โหลดไฟล์

      const filename =
        viewMode === "monthly"
          ? `monthly-report-${selectedDate}.xlsx`
          : `daily-report-${selectedDate}.xlsx`;

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;

      // สั่งให้ลิงก์คลิกเอง
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // ล้าง URL ทิ้ง
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

  //  ฟังก์ชัน handleFileChange ที่ถูกต้อง (รับ Index และตรวจสอบไฟล์เดียว)
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
        message: errors.join("\n"), // แสดงรายการ error
      });
      // alert(`ไม่สามารถอัปโหลดไฟล์นี้ได้:\n- ${errors.join('\n- ')}`);
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
    // ถูกต้อง: เปลี่ยนจากการ filter เป็นการ set ช่องนั้นให้เป็น null
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

    try {
      const imageBlob = await captureReportImage("custom-report-content");

      // 1) ดึง email จาก recipients ที่เลือก
      const toEmails = availableRecipients
        .filter((r) => selectedRecipientIds.includes(r.recipient_id))
        .map((r) => r.email);

      // 2) สร้าง FormData
      const formData = new FormData();
      formData.append("toEmails", JSON.stringify(toEmails));
      formData.append("subject", emailSubject);
      formData.append("body", emailBody);

      formData.append("reportImage", imageBlob, "report-screenshot.png");

      // 3) แนบไฟล์ (จาก state attachedFiles ที่ฟอร์ดทำไว้แล้ว)
      attachedFiles
        .filter((file) => !!file) // เอาเฉพาะช่องที่มีไฟล์จริง
        .forEach((file) => {
          formData.append("attachments", file); // ชื่อ field ต้องตรงกับ upload.array("attachments")
        });

      setIsLoading(true);

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
        title: "ส่งเมลไม่เสำเร็จ",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTER & PAGINATION ---
  const filterStatusOptions = useMemo(() => {
    const defaultOpt = [{ value: "all", label: "สถานะ: ทั้งหมด" }];
    if (!lookupData.statuses.length) return defaultOpt;

    const dbOpts = lookupData.statuses.map((s) => ({
      value: s.status_name.toLowerCase().replace(/\s+/g, ""),
      label: `สถานะ: ${s.status_name}`,
    }));
    return [...defaultOpt, ...dbOpts];
  }, [lookupData.statuses]);

  // --- OPTIONS สำหรับ Modal (แปลงจาก lookupData) ---

  const modalGameOptions = useMemo(
    () =>
      lookupData.products.map((p) => ({
        value: p.product_id,
        label: p.product_name,
      })),
    [lookupData.products]
  );

  const modalStatusOptions = useMemo(
    () =>
      lookupData.statuses.map((s) => ({
        value: s.status_id,
        label: s.status_name,
      })),
    [lookupData.statuses]
  );

  const modalProblemOptions = useMemo(
    () =>
      lookupData.problems.map((pr) => ({
        value: pr.problem_id,
        label: pr.problem_name,
      })),
    [lookupData.problems]
  );

  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  //ระบบจัดการและแก้ไขเคส Custom Report
  return (
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto font-sans text-slate-900 pb-20 
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900"
    >
      {/* --- HEADER ---  */}
      {/* Header Bar */}
      <PageHeader
        title="Custom Report"
        subtitle="เพิ่มข้อมูลย้อนหลัง/แก้ไข/ลบข้อมูล"
        icon={<FileCog size={24} />}
        iconColor="text-yellow-400"
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
                type="button"
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
        id="custom-report-content"
        className="max-w-[75%] mx-auto px-4 sm:px-6 lg:px-1 py-8"
      >
        {/* Date Header & Title - ปรับปรุงให้รองรับ View Mode */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {/* ตรวจสอบ viewMode เพื่อเปลี่ยนหัวข้อ */}
              {viewMode === "daily"
                ? "ภาพรวมประจำวันที่"
                : "ภาพรวมประจำเดือน"}{" "}
              <span className="text-blue-600 dark:text-blue-400 border-b-2 border-indigo-600/20 dark:border-indigo-400/30 px-1">
                {selectedDate
                  ? selectedDate.split("-").reverse().join("-")
                  : ""}
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-left">
              {/* ตรวจสอบ viewMode เพื่อเปลี่ยนคำอธิบาย */}
              สรุปข้อมูลการดำเนินงาน
              {viewMode === "daily" ? "ประจำวัน" : "ตลอดทั้งเดือน"}
            </p>
          </div>

          {/* --- NEW CASE BUTTON --- */}
          <button
            onClick={openNewCaseModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-md hover:bg-emerald-700 transition-all active:scale-95 duration-500 hover:-translate-y-1 hover:shadow-md"
          >
            <Plus size={18} /> New Case
          </button>
        </div>

        {/* --- DASHBOARD SECTION (UPDATED with reusable components) --- */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
          {/*  Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Downtime"
              value={dashboardData.stats.totalDowntimeStr}
              icon={
                <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
              }
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
              icon={
                <Flame className="w-6 h-6 text-red-600 dark:text-red-600" />
              }
              color="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30"
            />
          </div>

          {/*  Charts Section */}
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

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-t-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              รายการแจ้งปัญหา
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-20">
            {/* Use CustomSelect for Filter */}
            <div className="w-full sm:w-48">
              <CustomSelect
                options={filterStatusOptions}
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
            <table className="min-w-[1000px] w-full text-left border-collapse">
              <thead className="whitespace-nowrap">
                <tr
                  className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold tracking-wider
                  bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                >
                  <th className="px-6 py-4 text-center w-16">ID</th>
                  <th className="px-6 py-4 ">STATUS</th>
                  <th className="px-6 py-4 whitespace-nowrap ">Start Date</th>
                  <th className="px-6 py-4 whitespace-nowrap ">End Date</th>
                  <th className="px-6 py-4 ">TIME / DURATION</th>
                  <th className="px-6 py-4 ">GAME / PROBLEM</th>
                  <th className="px-6 py-4 ">DETAILS / SOLUTION</th>
                  <th className="px-6 py-4  ">REPORTER / OPERATOR</th>
                  <th className="px-6 py-4 text-right ">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {/* 1. เช็คว่ากำลังโหลดข้อมูลอยู่หรือไม่ */}
                {loadingData ? (
                  <tr>
                    <td
                      colSpan="7"
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
                      className="transition-colors group hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      {/* ID */}
                      <td className="px-6 py-4 text-center text-slate-400 font-medium align-top">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 align-top">
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

                      {/* TIME / DURATION */}
                      <td className="px-6 py-4 align-top">
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

                      {/* GAME / PROBLEM */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Gamepad2
                              size={14}
                              className="text-blue-500 dark:text-blue-400"
                            />
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-500  tracking-wide">
                              {item.game}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                            {item.problem}
                          </span>
                        </div>
                      </td>

                      {/* DETAILS & SOLUTION */}
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 ">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              รายละเอียด:
                            </span>{" "}
                            {item.details}
                          </p>
                          {item.solution && (
                            <div
                              className="text-xs px-3 py-2 rounded-lg 
                              bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                            >
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                แก้ไข:
                              </span>{" "}
                              {item.solution}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* REPORTER / OPERATOR */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
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
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
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

                      {/* ACTIONS */}
                      <td className="px-6 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-400 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 3. ถ้าโหลดเสร็จแล้วแต่ไม่มีข้อมูล -> แสดง ไม่พบข้อมูล
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
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
          {/* Pagination */}
          <div
            className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between
            bg-white dark:bg-slate-800"
          >
            <span className="text-sm text-slate-500 dark:text-slate-400">
              หน้า {currentPage} จาก {totalPages} ({filteredCases.length}{" "}
              รายการ)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                      ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }
                    `}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
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

      {/* --- เเก้ไขเคส / เพิ่มเคสใหม่  --- */}
      {isEditModalOpen && currentCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] 
              bg-white dark:bg-slate-800"
          >
            <div
              className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center 
                  bg-slate-50 dark:bg-slate-900"
            >
              <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                {currentCase.id === null ? (
                  <Plus size={20} className="text-emerald-600" />
                ) : (
                  <Pencil
                    size={20}
                    className="text-yellow-600 dark:text-yellow-400"
                  />
                )}
                {currentCase.id === null ? "เพิ่มเคสใหม่" : `แก้ไขข้อมูลเคส`}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleInitiateSave}
              className="p-6 overflow-y-auto custom-scrollbar space-y-4 "
            >
              {/* [UPDATED] Date & End Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                    วันที่เริ่ม (Start Date)
                  </label>
                  <CustomDatePicker
                    type="button"
                    value={currentCase.date}
                    onChange={(val) =>
                      setCurrentCase({ ...currentCase, date: val })
                    }
                    placeholder="เลือกวันที่"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left ml-1">
                    * สามารถเลือกวันที่ย้อนหลังได้
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                    วันที่สิ้นสุด (End Date)
                  </label>
                  {/* [ADDED] End Date Field */}
                  <CustomDatePicker
                    type="button"
                    value={currentCase.endDate}
                    onChange={(val) =>
                      setCurrentCase({ ...currentCase, endDate: val })
                    }
                    placeholder="เลือกวันที่สิ้นสุด"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                    เวลาเริ่ม (Start Time)
                  </label>
                  <CustomTimePicker
                    value={currentCase.startTime}
                    onChange={(val) => handleTimeChange("startTime", val)}
                    placeholder="เลือกเวลา"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                    เวลาจบ (End Time)
                  </label>
                  <CustomTimePicker
                    value={currentCase.endTime}
                    onChange={(val) => handleTimeChange("endTime", val)}
                    placeholder="เลือกเวลา"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                  ระยะเวลา (Duration)
                </label>
                <div
                  className={`w-full border rounded-xl p-2.5 text-sm transition-colors font-medium text-left
                ${
                  currentCase.duration.includes("ไม่ถูกต้อง")
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-900/50"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
                >
                  {currentCase.duration === "0 นาที" ||
                  !currentCase.duration ? (
                    <span className="text-slate-400 dark:text-slate-500 opacity-70 ">
                      ระบบคำนวณเวลาอัตโนมัติ
                    </span>
                  ) : (
                    currentCase.duration
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Game
                  </label>
                  <CustomSelect
                    options={modalGameOptions}
                    value={currentCase.product_id}
                    onChange={(val) =>
                      setCurrentCase({ ...currentCase, product_id: val })
                    }
                    placeholder="เลือกเกม"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1 ">
                    Status
                  </label>
                  <CustomSelect
                    options={modalStatusOptions}
                    value={currentCase.status_id}
                    onChange={(val) =>
                      setCurrentCase({ ...currentCase, status_id: val })
                    }
                    placeholder="เลือกสถานะ"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                  ปัญหา (Problem)
                </label>
                <CustomSelect
                  options={modalProblemOptions}
                  value={currentCase.problem_id}
                  onChange={(val) =>
                    setCurrentCase({ ...currentCase, problem_id: val })
                  }
                  placeholder="เลือกปัญหา"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                  รายละเอียด (Details)
                </label>
                <textarea
                  placeholder="พิมพ์รายละเอียด..."
                  rows={3}
                  maxLength={1000}
                  value={currentCase.details}
                  onChange={(e) =>
                    setCurrentCase({ ...currentCase, details: e.target.value })
                  }
                  className="w-full border rounded-xl p-2.5 text-sm resize-none
                            bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white
                             focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">
                  วิธีการแก้ไข (Solution)
                </label>

                <textarea
                  placeholder="อธิบายวิธีแก้ไข..."
                  rows={3}
                  maxLength={1000}
                  value={currentCase.solution}
                  onChange={(e) =>
                    setCurrentCase({ ...currentCase, solution: e.target.value })
                  }
                  className="w-full border rounded-xl p-2.5 text-sm resize-none
                           bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white
                            focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <label className=" text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 ml-1">
                    <User size={14} className="text-orange-500" /> ผู้ร้องขอ
                    (Requester)
                  </label>
                  <input
                    type="text"
                    value={currentCase.reporter}
                    onChange={(e) =>
                      setCurrentCase({
                        ...currentCase,
                        reporter: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-sm
                                 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white
                                  focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="ระบุชื่อผู้ร้องขอ"
                    maxLength={150}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 ml-1">
                    <User size={14} className="text-blue-500" /> ผู้ดำเนินเเก้ไข
                    (Operator)
                  </label>
                  <input
                    type="text"
                    value={currentCase.operator}
                    onChange={(e) =>
                      setCurrentCase({
                        ...currentCase,
                        operator: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-sm
                                 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white  focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="ระบุชื่อผู้ดำเนินการ"
                    maxLength={150}
                  />
                </div>
              </div>
            </form>
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <ButtonCancel onClick={() => setIsEditModalOpen(false)}>
                {" "}
                Cancel{" "}
              </ButtonCancel>

              <ButtonSave
                onClick={handleInitiateSave}
                disabled={isLoading} // ป้องกันการกดซ้ำขณะโหลด
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {currentCase.id === null ? "Add Case" : "Save Changes"}
                  </>
                )}
              </ButtonSave>
            </div>
          </div>
        </div>
      )}

      {/* --- SAVE CONFIRMATION MODAL (UPDATED for Dark Mode) ---
      {isSaveConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              ยืนยันการบันทึก?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              คุณแน่ใจหรือไม่ที่จะบันทึกข้อมูลนี้? <br />
              กรุณาตรวจสอบความถูกต้องก่อนยืนยัน
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsSaveConfirmModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold text-sm transition-colors
                        bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* --- DELETE CONFIRM MODAL (UPDATED for Dark Mode) ---
      {isDeleteModalOpen && currentCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              ยืนยันการลบ?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              คุณแน่ใจหรือไม่ที่จะลบรายการเคสนี้? <br />
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold text-sm transition-colors
                        bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-red-900/50"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* --- SEND MAIL MODAL (UPDATED for Dark Mode) --- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]
            bg-white dark:bg-slate-800"
          >
            <div
              className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center 
              bg-slate-50 dark:bg-slate-900"
            >
              <h3 className="font-medium text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Send
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />{" "}
                Send Daily Report
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
                <label className=" text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
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
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-normal whitespace-nowrap">
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
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div
                                className={`shrink-0 ${
                                  isSelected
                                    ? "text-blue-600 dark:text-blue-400"
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
                                <span className="text-sm truncate text-slate-500 dark:text-slate-400 font-normal text-left">
                                  {user.name}
                                </span>
                                <span className="font-normal text-sm truncate text-slate-800 dark:text-slate-200 text-left ">
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
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 text-left ml-1">
                    Subject
                  </label>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 text-left ml-1">
                    Message
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              {/* ส่วน Attachments ที่ถูกต้อง (เริ่ม) */}
              <div>
                <label className=" text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Paperclip size={16} /> Attachments (ไม่บังคับ, สูงสุด 5 ไฟล์)
                </label>

                <div className="space-y-3">
                  {/* วนลูป 5 ช่อง */}
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {file ? (
                        // --- Display Area when File Exists ---
                        <div
                          className="flex-1 flex items-center justify-between p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700 
                                  bg-slate-50 dark:bg-slate-900"
                        >
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
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left">
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
              ></ButtonConfirmsend>
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
