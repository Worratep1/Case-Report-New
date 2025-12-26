import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Wrench,
  AlertTriangle,
} from "lucide-react";

import ButtonCancel from "../components/ButtonCancel";
import ButtonSubmit from "../components/ButtonSubmit";
import ActionFeedbackModal from "../components/ActionFeedbackModal";
import DarkModeToggle from "../components/DarkModeToggle";

import { createCase } from "../api/case";
import { getproducts } from "../api/products";
import { getStatuses } from "../api/status";
import { getMembers } from "../api/member";
import { getProblems } from "../api/problems";

// ==========================================
// 1. Helper Functions
// ==========================================
const THAI_MONTHS = [
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

const formatThaiDate = (dateObj) => {
  if (!dateObj) return "";
  const day = dateObj.getDate();
  const month = THAI_MONTHS[dateObj.getMonth()];
  const year = dateObj.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

const calculateDuration = (sDate, sTime, eDate, eTime) => {
  if (!sDate || !sTime || !eDate || !eTime) return "";

  const start = new Date(`${sDate}T${sTime}:00`);
  const end = new Date(`${eDate}T${eTime}:00`);

  const diffMs = end - start;

  if (diffMs < 0) return "เวลาไม่ถูกต้อง";

  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minute = diffMins % 60;

  if (hours > 0) {
    return `${hours} ชม. ${minute} นาที`;
  }
  return `${minute} นาที`;
};

// ==========================================
// 2. Reusable Components
// ==========================================

// --- Custom Time Picker ---
const CustomTimePicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const [currentH, currentM] =
    value && value.includes(":") ? value.split(":") : ["--", "--"];

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

  const handleSelect = (type, val) => {
    let newH = currentH === "--" ? "00" : currentH;
    let newM = currentM === "--" ? "00" : currentM;
    if (type === "hour") newH = val;
    if (type === "minute") newM = val;
    onChange(`${newH}:${newM}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl border px-4 py-3 text-sm cursor-pointer flex items-center gap-3 transition-all 
          bg-white dark:bg-slate-900 
          ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50"
              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
          }`}
      >
        <Clock
          className={`w-5 h-5 ${
            value ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
          }`}
        />
        <span
          className={
            value
              ? "text-slate-800 dark:text-slate-200 font-medium"
              : "text-slate-400"
          }
        >
          {value || "--:--"}
        </span>
      </div>
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-2 w-48 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down flex flex-col
          bg-white dark:bg-slate-800"
        >
          <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex-1 py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
              ชม.
            </div>
            <div className="flex-1 py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400 border-l border-slate-100 dark:border-slate-700">
              นาที
            </div>
          </div>
          <div className="flex h-48">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
              {hours.map((h) => (
                <div
                  key={h}
                  onClick={() => handleSelect("hour", h)}
                  className={`py-2 text-center text-sm cursor-pointer transition-colors ${
                    currentH === h
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
                    currentM === m
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

// --- Custom Select ---
const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  displayKey,
  valueKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((opt) => opt[valueKey] === value);
  const displayValue = selectedOption
    ? selectedOption[displayKey]
    : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">
        {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl border px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-all 
          bg-white dark:bg-slate-900 
          ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50"
              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
          }`}
      >
        <span
          className={
            value
              ? "text-slate-700 dark:text-slate-200 font-medium"
              : "text-slate-400"
          }
        >
          {displayValue}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down
          bg-white dark:bg-slate-800"
        >
          <div className="max-h-60 overflow-y-auto py-1">
            <div
              className="px-3 py-2 text-xs font-medium border-b border-slate-100 dark:border-slate-700
              bg-slate-50 dark:bg-slate-900 text-slate-400"
            >
              เลือก{label}...
            </div>
            {safeOptions.map((option) => (
              <div
                key={option[valueKey]}
                onClick={() => {
                  onChange(option[valueKey]);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  value === option[valueKey]
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700"
                }`}
              >
                {option[displayKey]}
                {value === option[valueKey] && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-2.5 text-sm text-slate-500">
                ไม่พบข้อมูล
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Custom Date Picker ---
const CustomDatePicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef(null);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelectDate = (day) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const localDateStr = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    onChange(localDateStr);
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++)
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const month = viewDate.getMonth() + 1;
      const year = viewDate.getFullYear();
      const currentDateString = `${year}-${String(month).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;
      const isSelected = value === currentDateString;
      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleSelectDate(d)}
          className={`h-9 w-9 rounded-full text-sm flex items-center justify-center transition-all ${
            isSelected
              ? "bg-blue-600 text-white shadow-md shadow-blue-300 dark:shadow-blue-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl border px-4 py-3 text-sm cursor-pointer flex items-center gap-3 transition-all 
          bg-white dark:bg-slate-900 
          ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50"
              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
          }`}
      >
        <CalendarIcon
          className={`w-5 h-5 ${
            value ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
          }`}
        />
        <span
          className={
            value
              ? "text-slate-800 dark:text-slate-200 font-medium"
              : "text-slate-400"
          }
        >
          {value ? formatThaiDate(new Date(value)) : "วว/ดด/ปปปป"}
        </span>
      </div>
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-2 w-72 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 animate-fade-in-down
          bg-white dark:bg-slate-800"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg">
              {THAI_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                type="button"
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                type="button"
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2 text-center">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
              <span key={d} className="text-xs font-semibold text-slate-400">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 justify-items-center">
            {renderCalendarDays()}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ล้างค่า
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const offset = today.getTimezoneOffset() * 60000;
                onChange(new Date(today - offset).toISOString().slice(0, 10));
                setIsOpen(false);
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700"
            >
              วันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. Main Component
// ==========================================

export default function CasePage() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUserId = storedUser?.user_id ?? null;

  // State
  const [lookupData, setLookupData] = useState({
    products: [],
    statuses: [],
    problems: [],
    users: [],
  });
  const [loadingLookup, setLoadingLookup] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null); // Keep for inline error if needed

  // [UPDATED] Unified Modal State
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const closeFeedbackModal = () =>
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));

  const initialFormState = () => {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMinute = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;

    return {
      start_datetime: now.toISOString().split("T")[0],
      end_datetime: now.toISOString().split("T")[0],
      timeStart: currentTime,
      timeEnd: currentTime,
      product_id: null,
      status_id: null,
      problem_id: null,
      description: "",
      requester_name: "",
      solution: "",
      solver: "",
      created_by: loggedInUserId,
    };
  };

  const [formData, setFormData] = useState(() => initialFormState());

  const currentDuration = calculateDuration(
    formData.start_datetime,
    formData.timeStart,
    formData.end_datetime,
    formData.timeEnd
  );

  useEffect(() => {
    const fetchLookupData = async () => {
      setLoadingLookup(true);
      try {
        const [products, statuses, problems, members] = await Promise.all([
          getproducts(),
          getStatuses(),
          getProblems(),
          getMembers(),
        ]);
        setLookupData({
          products: products.products || [],
          statuses: statuses.statuses || statuses.data || [],
          problems: problems.problems || [],
          users: members.users || members.data || [],
        });
      } catch (err) {
        console.error("Error fetching lookup data:", err);
      } finally {
        setLoadingLookup(false);
      }
    };
    fetchLookupData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // [UPDATED] Save Click Logic with Validation
  const handleSaveClick = (e) => {
    e.preventDefault();

    // 1. Check Empty Fields
    if (
      !formData.product_id ||
      !formData.problem_id ||
      !formData.status_id ||
      !formData.solver
    ) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบ",
        message: "กรุณากรอกข้อมูลให้ครบถ้วน ",
      });
      return;
    }

    // 2. Check Date/Time Logic (End < Start)
    const startStr = `${formData.start_datetime}T${formData.timeStart}:00`;
    const endStr = `${formData.end_datetime}T${formData.timeEnd}:00`;

    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    if (endObj < startObj) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ช่วงเวลาไม่ถูกต้อง",
        message: "กรุณาเลือกช่วงเวลาที่ถูกต้อง",
      });
      return; // Stop here
    }

    // 3. Confirm
    setSubmitError(null);
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      title: "ยืนยันการส่งข้อมูล?",
      message: "กรุณาตรวจสอบความถูกต้องก่อนกดส่ง",
      onConfirm: confirmSubmit,
    });
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const start_datetime = `${formData.start_datetime}T${formData.timeStart}:00.000`;
    const end_datetime = `${formData.end_datetime}T${formData.timeEnd}:00.000`;

    const payload = {
      start_datetime,
      end_datetime,
      product_id: formData.product_id,
      status_id: formData.status_id,
      problem_id: formData.problem_id,
      description: formData.description,
      requester_name: formData.requester_name,
      solution: formData.solution,
      solver: formData.solver,
      created_by: formData.created_by,
    };

    try {
      await createCase(payload);

      // [UPDATED] Success Modal
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "ส่งข้อมูลสำเร็จ!",
        message: "ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว",
        showSecondaryButton: true,
        cancelText: "กลับหน้าหลัก",
        confirmText: "ดูรายการเคส",
        onClose: () => navigate("/menu"),
        onConfirm: () => {
          setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
          navigate("/dailyreport", { replace: true });
        },
      });

      setFormData(initialFormState());
    } catch (error) {
      console.error("Error on submission:", error.response || error);
      const errMsg =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล";
      setSubmitError(errMsg);

      // Close confirm modal implicitly by overwriting or explicitly closing
      setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState());
    setSubmitError(null);
  };

  return (
    <div
      className="fixed grid place-items-center inset-0 w-full h-full overflow-y-auto z-0 p-10
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900"
    >
      {" "}
      {/* ✅ Background Dark Mode */}
      {/* ปุ่ม Toggle Dark Mode */}
      <DarkModeToggle />
      <div
        className="w-full max-w-2xl rounded-3xl shadow-2xl border p-8 sm:p-10 relative
        bg-white/90 backdrop-blur-xl border-white/50
        dark:bg-slate-900/95 dark:border-slate-700/50"
      >
        {" "}
        {/* ✅ Card Dark Mode */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
            Create New Case
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {" "}
            {/* ✅ Text Dark Mode */}
            บันทึกข้อมูลเคสประจำวัน
          </p>
        </div>
        {submitError && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2
            bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          >
            {" "}
            {/* ✅ Error Box Dark Mode */}
            <AlertTriangle className="w-5 h-5" /> Error: {submitError}
          </div>
        )}
        {loadingLookup && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-50 rounded-3xl
            bg-white/60 dark:bg-slate-900/60"
          >
            {" "}
            {/* ✅ Loading Screen Dark Mode */}
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        )}
        <form onSubmit={handleSaveClick} className="space-y-6">
          <div className="space-y-4 text-left">
            <h2 className="text-base font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              {" "}
              {/* ✅ Section Title Dark Mode */}
              วันที่-เวลา
            </h2>

            <div className="space-y-4 ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  ">
                <CustomDatePicker
                  label="วันที่เริ่ม (Start Date)"
                  value={formData.start_datetime}
                  onChange={(val) => handleCustomChange("start_datetime", val)}
                />
                <CustomDatePicker
                  label="วันที่สิ้นสุด (End Date)"
                  value={formData.end_datetime}
                  onChange={(val) => handleCustomChange("end_datetime", val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomTimePicker
                  label="เวลาเริ่ม (Start Time)"
                  value={formData.timeStart}
                  onChange={(val) => handleCustomChange("timeStart", val)}
                />
                <CustomTimePicker
                  label="เวลาสิ้นสุด (End Time)"
                  value={formData.timeEnd}
                  onChange={(val) => handleCustomChange("timeEnd", val)}
                />
              </div>

              {/* ส่วนแสดง Duration */}
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">
                  ระยะเวลาที่ใช้ (Duration)
                </label>
                <div
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium border transition-colors
                   ${
                     currentDuration.includes("ไม่ถูกต้อง")
                       ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                       : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                   }
                   
                  `}
                >
                  {/* ✅ แก้ตรงนี้ครับ */}
                  {currentDuration === "0 นาที" ? (
                    <span className="text-slate-400 dark:text-slate-500 opacity-70">
                      ระบบคำนวณอัตโนมัติ
                    </span>
                  ) : (
                    currentDuration
                  )}
                </div>
              </div>
            </div>
          </div>
          <hr className="border-slate-100 dark:border-slate-700" />{" "}
          {/* ✅ HR Dark Mode */}
          <div className="space-y-4 text-left">
            <h2 className="text-base font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              ข้อมูลเคส
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm ">
              <CustomSelect
                label="Game "
                placeholder="เลือกเกม..."
                options={lookupData.products}
                value={formData.product_id}
                onChange={(val) => handleCustomChange("product_id", val)}
                displayKey="product_name"
                valueKey="product_id"
              />
              <CustomSelect
                label="Status"
                placeholder="เลือกสถานะ..."
                options={lookupData.statuses}
                value={formData.status_id}
                onChange={(val) => handleCustomChange("status_id", val)}
                displayKey="status_name"
                valueKey="status_id"
              />
            </div>

            <CustomSelect
              label="ปัญหา (Problem)"
              placeholder="เลือกประเภทปัญหา..."
              options={lookupData.problems}
              value={formData.problem_id}
              onChange={(val) => handleCustomChange("problem_id", val)}
              displayKey="problem_name"
              valueKey="problem_id"
            />

            <div>
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 block ml-1">
                รายละเอียด (Detail)
              </label>
              <textarea
                name="description"
                rows="3"
                maxLength={1000}
                value={formData.description}
                onChange={handleChange}
                placeholder="พิมพ์รายละเอียดเคส..."
                className="w-full rounded-xl border border-transparent px-4 py-3 text-sm transition-all resize-none
                  bg-slate-50 dark:bg-slate-900 
                  text-slate-700 dark:text-slate-200 
                  placeholder-slate-400 dark:placeholder-slate-500
                  hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600
                  focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />{" "}
              {/* ✅ Textarea Dark Mode */}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block ml-1">
                วิธีการแก้ไข (Solution)
              </label>
              <div className="relative">
                <Wrench className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <textarea
                  name="solution"
                  rows="2"
                  maxLength={1000}
                  value={formData.solution}
                  onChange={handleChange}
                  placeholder="อธิบายวิธีแก้ไข..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-3 text-sm transition-all resize-none
                    bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />{" "}
                {/*  Textarea Dark Mode */}
              </div>
            </div>
          </div>
          <hr className="border-slate-100 dark:border-slate-700" />{" "}
          {/* ✅ HR Dark Mode */}
          <div className="space-y-4 text-left">
            <h2 className="text-base font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              ผู้เกี่ยวข้อง
            </h2>

            <div>
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">
                ผู้ร้องขอ (Requester)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
                <input
                  type="text"
                  name="requester_name"
                  value={formData.requester_name}
                  maxLength={150}
                  onChange={handleChange}
                  placeholder="ระบุชื่อผู้ร้องขอ"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-sm transition-all
                    bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />{" "}
                {/* ✅ Input Dark Mode */}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">
                ผู้ดำเนินการแก้ไข (Operator)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                <input
                  type="text"
                  name="solver"
                  value={formData.solver}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="ระบุชื่อผู้ดำเนินการเเก้ไข"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-sm transition-all
                    bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />{" "}
                {/* ✅ Input Dark Mode */}
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-6 mt-4 gap-8">
            <ButtonCancel
              type="button"
              onClick={() => {
                handleCancel();
                navigate("/menu");
              }}
            >
              Cancel
            </ButtonCancel>
            <ButtonSubmit
              type="submit"
              disabled={loadingLookup || isSubmitting} 
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Case"
              )}
            </ButtonSubmit>
          </div>
        </form>
      </div>
      {/* ✅ Action Feedback Modal (เหลือตัวเดียว) */}
      <ActionFeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={feedbackModal.onClose || closeFeedbackModal}
        onConfirm={feedbackModal.onConfirm}
        confirmText={feedbackModal.confirmText}
        cancelText={feedbackModal.cancelText}
        showSecondaryButton={feedbackModal.showSecondaryButton}
        isLoading={isSubmitting} // ส่ง loading state ไปด้วยตอนกด confirm
      />
    </div>
  );
}
