import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Save, X, CheckCircle, AlertCircle, Loader2, Calendar as CalendarIcon, Clock,
    ChevronDown, ChevronLeft, ChevronRight, User, Wrench, Send, AlertTriangle,
} from "lucide-react";

// ✅ 1. Import API Functions (สมมติว่าอยู่ใน caseApi.js)
import {createCase} from '../api/case'; // ตรวจสอบ Path import ให้ถูกต้อง

import{getproducts} from"../api/products";
import{getStatuses} from"../api/status";
import{getMembers} from"../api/member";
import{getProblems} from"../api/problems";


// ==========================================
// 1. Helper Functions (ไม่เปลี่ยนแปลง)
// ==========================================
const THAI_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const formatThaiDate = (dateObj) => {
    if (!dateObj) return "";
    const day = dateObj.getDate();
    const month = THAI_MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear() + 543;
    return `${day} ${month} ${year}`;
};

// ==========================================
// 2. Reusable Components (ปรับ CustomSelect)
// ==========================================

// --- Custom Time Picker (โค้ดเดิม) ---
const CustomTimePicker = ({ label, value, onChange }) => { /* ... โค้ดเดิม ... */ 
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const [currentH, currentM] = (value && value.includes(':')) ? value.split(':') : ['--', '--'];

    useEffect(() => {
        const handleClickOutside = (event) => { if (containerRef.current && !containerRef.current.contains(event.target)) { setIsOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (type, val) => {
        let newH = currentH === '--' ? '00' : currentH;
        let newM = currentM === '--' ? '00' : currentM;
        if (type === 'hour') newH = val;
        if (type === 'minute') newM = val;
        onChange(`${newH}:${newM}`);
    };
    
    return (
        <div className="relative" ref={containerRef}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">{label}</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full bg-white rounded-xl border px-4 py-3 text-sm cursor-pointer flex items-center gap-3 transition-all ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'}`}>
                <Clock className={`w-5 h-5 ${value ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={value ? "text-slate-800 font-semibold" : "text-slate-400"}>{value || "--:--"}</span>
            </div>
            {isOpen && (
                <div className="absolute left-0 z-50 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-down flex flex-col">
                    <div className="flex border-b border-slate-100 bg-slate-50">
                        <div className="flex-1 py-2 text-center text-xs font-bold text-blue-600">ชม.</div>
                        <div className="flex-1 py-2 text-center text-xs font-bold text-blue-600 border-l border-slate-100">นาที</div>
                    </div>
                    <div className="flex h-48">
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                            {hours.map(h => (<div key={h} onClick={() => handleSelect('hour', h)} className={`py-2 text-center text-sm cursor-pointer transition-colors ${currentH === h ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>{h}</div>))}
                        </div>
                        <div className="flex-1 overflow-y-auto border-l border-slate-100 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                            {minutes.map(m => (<div key={m} onClick={() => handleSelect('minute', m)} className={`py-2 text-center text-sm cursor-pointer transition-colors ${currentM === m ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>{m}</div>))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    ); 
};


// ✅ --- Custom Select (ปรับให้รับ Object และคืนค่า ID) ---
const CustomSelect = ({ label, value, onChange, options, placeholder, displayKey, valueKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ค้นหาชื่อที่ต้องแสดงผลจาก options
  const safeOptions = Array.isArray(options) ? options : [];

  const selectedOption = safeOptions.find(opt => opt[valueKey] === value);
  const displayValue = selectedOption ? selectedOption[displayKey] : placeholder;

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
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white rounded-xl border px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-all ${
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"
        }`}
      >
        <span className={value ? "text-slate-700 font-medium" : "text-slate-400"}>
          {displayValue} {/* ✅ แสดงชื่อที่ค้นหามา */}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-down">
          <div className="max-h-60 overflow-y-auto py-1">
            <div className="px-3 py-2 text-xs text-slate-400 font-medium bg-slate-50 border-b border-slate-100">
              เลือก{label}...
            </div>
            {safeOptions.map((option) => (
              <div
                key={option[valueKey]} // ✅ ใช้ ID เป็น Key
                onClick={() => {
                  onChange(option[valueKey]); // ✅ ส่งค่า ID กลับไป
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  value === option[valueKey] ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50"
                }`}
              >
                {option[displayKey]} {/* ✅ แสดงชื่อ */}
                {value === option[valueKey] && <CheckCircle className="w-4 h-4 text-white" />}
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

// --- Custom Date Picker (โค้ดเดิม) ---
const CustomDatePicker = ({ label, value, onChange }) => { /* ... โค้ดเดิม ... */ 
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);
    
    // ... (logic เดิม)
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

const handleSelectDate = (day) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1; // 0-based → 1-based

  const localDateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  onChange(localDateStr);   // 👉 ได้ "2025-12-02" แบบไม่ยุ่ง timezone
  setIsOpen(false);
};


    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
for (let d = 1; d <= daysInMonth; d++) {
  const month = viewDate.getMonth() + 1;
  const year = viewDate.getFullYear();
  const currentDateString = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isSelected = value === currentDateString;
            days.push(
                <button
                    key={d}
                    type="button"
                    onClick={() => handleSelectDate(d)}
                    className={`h-9 w-9 rounded-full text-sm flex items-center justify-center transition-all ${
                        isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-300" : "text-slate-700 hover:bg-blue-100 hover:text-blue-600"
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
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">{label}</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full bg-white rounded-xl border px-4 py-3 text-sm cursor-pointer flex items-center gap-3 transition-all ${isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"}`}>
                <CalendarIcon className={`w-5 h-5 ${value ? "text-blue-600" : "text-slate-400"}`} />
                <span className={value ? "text-slate-800 font-semibold" : "text-slate-400"}>{value ? formatThaiDate(new Date(value)) : "วว/ดด/ปปปป"}</span>
                {/* <span>{value ? formatThaiDate(value) : "วว/ดด/ปปปป"}</span> */}
            </div>
            {isOpen && (
                <div className="absolute left-0 z-50 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-800 font-bold text-lg">{THAI_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear() + 543}</h3>
                        <div className="flex gap-1">
                            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
                            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 mb-2 text-center">{["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => <span key={d} className="text-xs font-semibold text-slate-400">{d}</span>)}</div>
                    <div className="grid grid-cols-7 gap-y-1 justify-items-center">{renderCalendarDays()}</div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                        <button type="button" onClick={() => { onChange(""); setIsOpen(false); }} className="text-slate-400 hover:text-slate-600">ล้างค่า</button>
                        <button type="button" onClick={() => { 
                            const today = new Date(); 
                            const offset = today.getTimezoneOffset() * 60000; 
                            onChange(new Date(today - offset).toISOString().slice(0, 10)); 
                            setIsOpen(false); 
                        }} className="text-blue-600 font-semibold hover:text-blue-700">วันนี้</button>
                    </div>
                </div>
            )}
        </div>
    ); 
};


// ==========================================
// 3. Main Component (แก้ไข)
// ==========================================

export default function CasePage() {
    const navigate = useNavigate();

    // ✅ 1. State สำหรับ Master Data
    const [lookupData, setLookupData] = useState({
        products: [], 
        statuses: [], 
        problems: [],
        users: [] // สำหรับ Solver
    });
    const [loadingLookup, setLoadingLookup] = useState(true);

    // ✅ 2. State สำหรับส่งไป Backend (เปลี่ยนชื่อให้ตรงกับ API)
const initialFormState = () => {
    // 1. หาเวลาปัจจุบัน
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`; // ตัวอย่าง: "14:30"

    return {
      start_datetime: now.toISOString().split("T")[0], // วันที่ปัจจุบัน
      end_datetime: now.toISOString().split("T")[0],   // วันที่ปัจจุบัน
      
      timeStart: currentTime, // ✅ ใช้เวลาปัจจุบัน
      timeEnd: currentTime,   // ✅ ใช้เวลาปัจจุบัน (หรือจะบวกเพิ่มก็ได้)
      
      product_id: null,
      status_id: null,
      problem_id: null,
      description: "",
      requester_name: "",
      solution: "",
      solver: "",
    };
  };
    
    const [formData, setFormData] = useState(initialFormState);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);


    // --- 4. Fetch Lookup Data (ดึง Master Data) ---
    useEffect(() => {
        const fetchLookupData = async () => {
            setLoadingLookup(true);
            try {
                // ดึงข้อมูลอ้างอิงทั้งหมดพร้อมกัน (Promise.all)
                const [products, statuses, problems, users] = await Promise.all([
                    getproducts(),// ดึงสถานะ
                    getStatuses(), // ดึงเกม
                    getProblems(), // ดึงปัญหา
                    getMembers()// ดึงสมาชิก (สำหรับ Solver)

                ]);
             setLookupData({

    products: products.products || [], 
    statuses: statuses.statuses || statuses.data || [], 
    problems: problems.problems ||  [],
    users: users.users || users.data || []
});
            console.log("product มายัง",products)

            } catch (err) {
                console.error("Error fetching lookup data:", err);
            } finally {
                setLoadingLookup(false);
            }
        };
        fetchLookupData();
    }, []);


    // --- 5. Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCustomChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    //เช็คว่ากรอกข้อมูลครมไหม

    const handleSaveClick = (e) => {
        e.preventDefault();
        // ✅ 6. Validation เช็ค ID แทนชื่อ
        if (!formData.product_id || !formData.problem_id || !formData.status_id || !formData.solver) {
            setShowWarningModal(true);
            return;
        }
        setSubmitError(null);
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        // ✅ 7. สร้าง Payload ให้ถูกต้อง (รวมวันที่และเวลาเข้าด้วยกัน)
        // ต้องใส่ 'Z' หรือ Timezone Offset ท้ายสุดเพื่อให้ PostgreSQL รู้ว่าเป็น ISO format
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
            solver: formData.solver, // ✅ User ID ของ Solver (user_id)
            created_by: formData.created_by // 🛑 สมมติ ID ของ User ที่กำลัง Login (ต้องแก้เมื่อทำ Auth เสร็จ)
        };

        try {
            // [BACKEND]: จุดเชื่อมต่อ API
            await createCase(payload); 

            setShowConfirmModal(false);
            setShowSuccessModal(true);
            setFormData(initialFormState); // Reset form
        } catch (error) {
            console.error("Error on submission:", error.response || error); 
            setSubmitError(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
            setShowConfirmModal(false); // ปิด Confirm Modal
            
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData(initialFormState);
        setSubmitError(null);
    };


    // [UI]: รวมวันที่และเวลาในฟอร์ม
    return (
        <div className="fixed grid place-items-center inset-0 w-full h-full bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 overflow-y-auto z-0 p-10">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10 relative">
            
            {/* Header */}
            <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                Create New Case
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
                บันทึกข้อมูลเคสประจำวัน
            </p>
            </div>

            {/* 🛑 Display Error Message from API */}
            {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5"/> Error: {submitError}
                </div>
            )}
            
                {loadingLookup && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-50">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="mt-3 text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
                  </div>
                )}


            <form onSubmit={handleSaveClick} className="space-y-6">
            {/* --- Section 1: วันที่และเวลา --- */}
            <div className="space-y-4 text-left">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                วันที่-เวลา
                </h2>

                <div className="space-y-4 ">
                {/* Custom Calendar Picker Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  ">
                    <CustomDatePicker
                    label="วันที่เริ่ม Case"
                    value={formData.start_datetime} 
                    onChange={(val) => handleCustomChange("start_datetime", val)} 
                    />
                    <CustomDatePicker
                    label="วันที่สิ้นสุด Case"
                    value={formData.end_datetime} 
                    onChange={(val) => handleCustomChange("end_datetime", val)} 
                    />
                </div>

                {/* Custom Time Pickers */}
                <div className="grid grid-cols-2 gap-4">
                    <CustomTimePicker
                    label="เวลาเริ่ม"
                    value={formData.timeStart}
                    onChange={(val) => handleCustomChange("timeStart", val)}
                    />
                    <CustomTimePicker
                    label="เวลาสิ้นสุด"
                    value={formData.timeEnd}
                    onChange={(val) => handleCustomChange("timeEnd", val)}
                    />
                </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- Section 2: ข้อมูลเคส --- */}
            <div className="space-y-4 text-left">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                ข้อมูลเคส
                </h2>

                <div className="grid grid-cols-2 gap-4 ">
                <CustomSelect 
                    label="Game "
                    placeholder="เลือกเกม..."
                    options={lookupData.products} //  ใช้ข้อมูล Lookup
                    value={formData.product_id} //  ใช้ ID
                    onChange={(val) => handleCustomChange("product_id", val)} // ✅ ส่ง ID
                    displayKey="product_name" // ชื่อเกม
                    valueKey="product_id"
                />
                <CustomSelect
                    label="Status"
                    placeholder="เลือกสถานะ..."
                    options={lookupData.statuses} // ✅ ใช้ข้อมูล Lookup
                    value={formData.status_id} // ✅ ใช้ ID
                    onChange={(val) => handleCustomChange("status_id", val)} // ✅ ส่ง ID
                    displayKey="status_name" 
                    valueKey="status_id"
                />
                </div>

                <CustomSelect
                label="ปัญหา"
                placeholder="เลือกประเภทปัญหา..."
                options={lookupData.problems} // ✅ ใช้ข้อมูล Lookup
                value={formData.problem_id} // ✅ ใช้ ID
                onChange={(val) => handleCustomChange("problem_id", val)} // ✅ ส่ง ID
                displayKey="problem_name" 
                valueKey="problem_id"
                />

                <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">
                    รายละเอียดเคส
                </label>
                <textarea
                    name="description" 
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="พิมพ์รายละเอียดเคส..."
                    className="w-full bg-slate-50 rounded-xl border border-transparent hover:bg-white hover:border-slate-200 px-4 py-3 text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- Section 3: ผู้เกี่ยวข้อง --- */}
            <div className="space-y-4 text-left">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                ผู้เกี่ยวข้อง
                </h2>

                <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">
                    ผู้ร้องขอ
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
                    <input
                    type="text"
                    name="requester_name" 
                    value={formData.requester_name}
                    onChange={handleChange}
                    placeholder="กรอกชื่อผู้ร้องขอ"
                    className="w-full bg-white rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                </div>

                <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">
                    วิธีแก้ไข
                </label>
                <div className="relative">
                    <Wrench className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <textarea
                    name="solution"
                    rows="2"
                    value={formData.solution}
                    onChange={handleChange}
                    placeholder="อธิบายวิธีแก้ไข"
                    className="w-full bg-white rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                </div>
                </div>
                
               <div>
  <label className="text-xs font-semibold text-slate-500 mb-1.5 block ml-1">
    ผู้ดำเนินการแก้ไข
  </label>
  <div className="relative">
    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
    <input
      type="text"
      name="solver"                 // 👈 ผูกกับ solver_name
      value={formData.solver}
      onChange={handleChange}
      placeholder="กรอกชื่อผู้ดำเนินการแก้ไข"
      className="w-full bg-white rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
    />
  </div>
</div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 mt-4">
                <button
                type="button"
                onClick={() => {
                    handleCancel();
                    navigate("/menu");
                }}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                disabled={loadingLookup} // ปิดปุ่มถ้าข้อมูลอ้างอิงยังไม่โหลด
                >
                Submit Case
                </button>
            </div>
            </form>
        </div>

        {/* --- Modals --- */}
        {showWarningModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center transform scale-100">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    ข้อมูลไม่ครบถ้วน
                </h3>
                <p className="text-s text-slate-500 mb-6">
                    กรุณากรอกข้อมูล Game, Status, ปัญหา และ Solver ให้ครบถ้วน
                </p>
                <button
                onClick={() => setShowWarningModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                ตกลง
                </button>
            </div>
            </div>
        )}

        {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100">
                <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                    ยืนยันการส่งข้อมูล?
                </h3>
                <p className="text-sm text-slate-500 mt-2 mb-6">
                    กรุณาตรวจสอบความถูกต้องก่อนกดส่ง
                </p>
                {submitError && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-xl text-xs font-medium">
                        {submitError}
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2 rounded-lg border text-slate-600 hover:bg-slate-50"
                    >
                    ยกเลิก
                    </button>
                    <button
                    onClick={confirmSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex justify-center items-center gap-2"
                    >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "ยืนยัน"
                    )}
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}

        {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-bounce-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                ส่งข้อมูลสำเร็จ!
                </h3>
                <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                ปิดหน้าต่าง
                </button>
            </div>
            </div>
        )}
        </div>
    );
}