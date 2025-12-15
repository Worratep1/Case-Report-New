import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
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
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus,
  HelpCircle,
  RotateCcw,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';
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
  Pie 
} from 'recharts';
import {getCases} from "../api/case"
import {getProblems} from "../api/problems"
import {getStatuses } from "../api/status"
import {getproducts} from "../api/products"
import {createCase} from "../api/case"
import {deleteCase} from "../api/case"
import {updateCase} from "../api/case"
import { getMembers } from "../api/member";
import { getRecipients } from '../api/recipients';
import { sendDailyReport } from "../api/report";
import { exportReport } from "../api/export"; 
import { useNavigate } from "react-router-dom";
import ExportButton from '../components/ButtonExport';
import ButtonHome from '../components/ButtonHome';
import ButtonSend from '../components/ButtonSend';
import ButtonCancel from '../components/ButtonCancel';
import ButtonSave from '../components/ButtonSave';
import ActionFeedbackModal from "../components/ActionFeedbackModal";
import { STATUS_CONFIG } from "../constants/status";

// --- CONSTANTS ---
const CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [
    "application/pdf", 
    "image/jpeg", 
    "image/png", 
    "application/msword", 
    "application/vnd.ms-excel", // ✅ XLS
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // ✅ XLSX
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  ],
};

const ITEMS_PER_PAGE = 5;

// Helper: Get Today's Date String YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

// --- CUSTOM DATE PICKER COMPONENT (UPDATED for Dark Mode) ---
const CustomDatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const offset = newDate.getTimezoneOffset();
    const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onChange(localDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const setToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    const todayStr = localDate.toISOString().split('T')[0];
    onChange(todayStr);
    setViewDate(today);
    setIsOpen(false);
  };

  const clearDate = () => {
    onChange('');
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(viewDate.getMonth(), viewDate.getFullYear());
    const startDay = firstDayOfMonth(viewDate.getMonth(), viewDate.getFullYear());

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const currentDayStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), i).toISOString().split('T')[0];
      const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
      const checkDateStr = new Date(checkDate.getTime() - (checkDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      const isSelected = value === checkDateStr;
      const isToday = checkDateStr === getTodayString();

      days.push(
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${isSelected 
              ? 'bg-indigo-600 text-white' 
              : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300'
            }
            ${isToday && !isSelected 
              ? 'border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
              : ''
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
          bg-white dark:bg-slate-900
          ${isOpen 
            ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm' 
            : 'border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className=" text-indigo-500" />
          <span className={`${value ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 rounded-2xl shadow-xl w-[300px] animate-in fade-in zoom-in-95 duration-200 left-0 sm:left-auto right-0 sm:right-0
          bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-200">
              {thaiMonths[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} 
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeft size={20}/>
              </button>
              <button onClick={() => changeMonth(1)} 
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2 text-center">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
              <span key={day} className="text-xs font-bold text-slate-400">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 justify-items-center">
            {renderCalendarDays()}
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button onClick={clearDate} className="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">ล้างค่า</button>
            <button onClick={setToday} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">วันนี้</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CUSTOM TIME PICKER COMPONENT (UPDATED for Dark Mode) ---
const CustomTimePicker = ({ value, onChange, placeholder = "--:--" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [selectedHour, selectedMinute] = value ? value.split(':') : ["", ""];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleSelect = (type, val) => {
    let newHour = selectedHour || "00";
    let newMinute = selectedMinute || "00";

    if (type === 'hour') newHour = val;
    if (type === 'minute') newMinute = val;

    onChange(`${newHour}:${newMinute}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
          bg-white dark:bg-slate-900
          ${isOpen 
            ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm' 
            : 'border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-indigo-500" />
          <span className={`${value ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 rounded-xl shadow-xl border w-full sm:w-48 flex h-64 overflow-hidden animate-in fade-in zoom-in-95 duration-200
          bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
           <div className="flex-1 overflow-y-auto custom-scrollbar p-1 border-r border-slate-100 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-400 text-center py-1 sticky top-0 
                bg-white dark:bg-slate-800 z-10 border-b border-slate-50 dark:border-slate-700">ชม.</div>
              {hours.map(h => (
                  <div 
                    key={h} 
                    onClick={() => handleSelect('hour', h)}
                    className={`text-center py-2 rounded-lg cursor-pointer text-sm font-medium mb-1 transition-colors 
                      ${selectedHour === h 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    {h}
                  </div>
              ))}
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              <div className="text-xs font-bold text-slate-400 text-center py-1 sticky top-0 
                bg-white dark:bg-slate-800 z-10 border-b border-slate-50 dark:border-slate-700">นาที</div>
              {minutes.map(m => (
                  <div 
                    key={m} 
                    onClick={() => handleSelect('minute', m)}
                    className={`text-center py-2 rounded-lg cursor-pointer text-sm font-medium mb-1 transition-colors 
                      ${selectedMinute === m 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    {m}
                  </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

// --- CUSTOM SELECT COMPONENT (UPDATED for Dark Mode) ---
const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (!value) return placeholder || "Select...";
    const selectedOption = options.find(opt => (typeof opt === 'object' ? opt.value === value : opt === value));
    return selectedOption ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption) : value;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
          bg-white dark:bg-slate-900
          ${isOpen 
            ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm' 
            : 'border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
          }
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
          <span className={`truncate ${!value ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
            {getDisplayLabel()}
          </span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100 text-left
          bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          {options.map((option, index) => {
            const optValue = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            const isSelected = value === optValue;

            return (
              <div
                key={index}
                onClick={() => handleSelect(optValue)}
                className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors mb-0.5 last:mb-0
                  ${isSelected 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
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

// --- Status Badge Component (unchanged) ---
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.others;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} border-transparent bg-opacity-90`}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></div>
      {config.label}
    </span>
  );
};

// --- StatCard (UPDATED for Dark Mode) ---
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow h-full`}>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} dark:bg-opacity-20`}>
      {icon}
    </div>
  </div>
);

// --- StatusSummaryCard (UPDATED for Dark Mode) ---
const StatusSummaryCard = ({ data }) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
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
        style={{ fontSize: '11px', fontWeight: 'bold', textShadow: '0px 1px 2px rgba(0,0,0,0.25)', pointerEvents: 'none' }}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col justify-center  duration-500 
                  hover:shadow-md">
       <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-medium text-slate-800 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon size={14} /> Status Summary
          </h4>
       </div>
       
       <div className="flex flex-col sm:flex-row items-center gap-6 h-full">
          {/* Donut Chart */}
          <div className="w-full sm:w-1/2 h-[140px] relative">
              {data.length > 0 ? (
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
                                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                              ))}
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <PieChartIcon size={32} className="mb-1 opacity-50"/>
                      <p className="text-xs">No Data</p>
                  </div>
              )}
          </div>

          {/* Status List */}
          <div className="w-full sm:w-1/2 grid grid-cols-1 gap-y-3">
              {data.length > 0 ? (
                  data.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">{entry.name}</span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">({entry.value})</span>
                      </div>
                  ))
              ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center col-span-2">No data available</p>
              )}
          </div>
       </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
 export default function CustomReport (){
  const fileInputRef = useRef(null);

  const navigate = useNavigate()

  // --- 1. STATE ---
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  // Data State
  const [cases, setCases] = useState([]);
  const [lookupData, setLookupData ] = useState({
    products:[],
    statuses :[],
    problems:[],
    users:[]

  })

  const [loadingData,setLoadingData] = useState(false);

  //export file
  
  const [isExporting, setIsExporting] = useState(false);


  // Email States
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  // ✅ ถูกต้อง: ประกาศ State 5 ช่อง
  const [attachedFiles, setAttachedFiles] = useState(Array(5).fill(null)); 
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // --- 2. EFFECTS (API CALLS) ---
  
  useEffect(() => {
    const fetchLookup = async () => {
        try {
            const [resProds, resStats, resProbs, resUsers , resRecipients] = await Promise.all([
                getproducts(),
                getStatuses(),
                getProblems(),
                getMembers(),
                getRecipients()
            ]);
            setLookupData({
                products: resProds.products || [],
                statuses: resStats.statuses || resStats.data || [],
                problems: resProbs.problems || [],
                users: resUsers.users || resUsers.data || [],
                recipients: resRecipients.recipients || []
            });
            
            setAvailableRecipients(resRecipients || []);
        } catch (err) {
            console.error("Error fetching master data:", err);
        }
        
    };
    fetchLookup();
  }, []);

// ✅ 2.2 โหลด Cases ตามวันที่
  const fetchCases = async () => {
      // if (!selectedDate) return; 
      setLoadingData(true);
      try {
          const res = await getCases({ date: selectedDate });
          
          const rawCases = res.cases || [];

          // แปลงข้อมูลให้ตรงกับ UI
          const mappedCases = rawCases.map(c => {
              const productObj = lookupData.products.find(p => p.product_id === c.product_id);
              const statusObj = lookupData.statuses.find(s => s.status_id === c.status_id);
              const problemObj = lookupData.problems.find(p => p.problem_id === c.problem_id); 

              const start = new Date(c.start_datetime);
              const end = new Date(c.end_datetime);
              const formatTime = (d) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
              
              const diffMs = end - start;
              const durationMins = Math.floor(diffMs / 60000);
              const durationStr = durationMins > 60 
                  ? `${Math.floor(durationMins/60)} ชม. ${durationMins%60} นาที` 
                  : `${durationMins} นาที`;

              const statusKey = (statusObj?.status_name || '').toLowerCase().replace(/\s+/g, '') || 'others';
              const finalStatus = STATUS_CONFIG[statusKey] ? statusKey : 'others';

              return {
                  ...c, 
                  id: c.case_id, 
                  startTime: formatTime(start),
                  endTime: formatTime(end),
                  duration: durationStr,
                  problem: problemObj ? problemObj.problem_name : 'Unknown',
                  game: productObj ? productObj.product_name : 'Unknown',
                  details: c.description,
                  solution: c.solution,
                  reporter: c.requester_name,
                  operator: c.solver,
                  status: finalStatus,
                  date: selectedDate,
                  
                  raw_product_id: c.product_id,
                  raw_status_id: c.status_id,
                  raw_problem_id: c.problem_id
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
  }, [selectedDate, lookupData]);
  
  // --- DASHBOARD DATA CALCULATION ---
  const casesOfSelectedDate = cases.filter(c => c.date === selectedDate);

  const dashboardData = useMemo(() => {
      const stats = {
        total: casesOfSelectedDate.length,
      };
      
      const counts = {};
      const gameMap = {};

      casesOfSelectedDate.forEach(c => {
          counts[c.status] = (counts[c.status] || 0) + 1;
          const game = c.game || "Unknown";
          gameMap[game] = (gameMap[game] || 0) + 1;
      });

      const pieData = Object.keys(STATUS_CONFIG).map(key => {
          const count = counts[key] || 0;
          return {
             name: STATUS_CONFIG[key].label,
             value: count,
             color: STATUS_CONFIG[key].color
          };
      }).filter(item => item.value > 0);

      const chartData = Object.keys(gameMap).map(game => ({
          name: game,
          count: gameMap[game]
      })).sort((a, b) => b.count - a.count);

      return { stats, pieData, chartData };
  }, [casesOfSelectedDate]);

  // --- HELPER: AUTO-CALCULATE DURATION (unchanged) ---
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startDate = new Date(0, 0, 0, startHour, startMinute, 0);
    const endDate = new Date(0, 0, 0, endHour, endMinute, 0);
    
    let diff = endDate.getTime() - startDate.getTime();
    if (diff < 0) return  "เวลาไม่ถูกต้อง "; 

    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours} ชม. ${remainingMinutes > 0 ? remainingMinutes + ' นาที' : ''}`;
    }
    return `${minutes} นาที`;
  };

  // --- 3. ACTIONS (ADD / EDIT / DELETE) ---

  const handleTimeChange = (field, value) => {
    const updatedCase = { ...currentCase, [field]: value };
    if (updatedCase.startTime && updatedCase.endTime) {
        const duration = calculateDuration(updatedCase.startTime, updatedCase.endTime);
        updatedCase.duration = duration;
    }
    setCurrentCase(updatedCase);
  };

const openNewCaseModal = () => {
      const now = new Date();
     const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
     const currentTime = `${currentHour}:${currentMinute}`; // เช่น "14:30"
    setCurrentCase({
        id: null, 
        date: selectedDate,
        endDate: selectedDate,
        startTime: currentTime,
        endTime: currentTime,
        duration: '',
        
        // ใช้ ID สำหรับ Dropdown
        product_id: null,
        status_id: null,
        problem_id: null,
        
        details: '',
        solution: '',
        reporter: '',
        operator: '' // Default value
    });
    setIsEditModalOpen(true);
  }
  
  const openEditModal = (item) => {
    setCurrentCase({
        ...item,
        // เอาค่า raw ID มาใส่ในตัวแปรที่จะใช้กับ Form
        product_id: item.raw_product_id,
        status_id: item.raw_status_id,
        problem_id: item.raw_problem_id,
        
        // แปลงเวลาให้เป็น format HH:mm (ถ้ายังไม่ได้เป็น)
        startTime: item.startTime.substring(0, 5), 
        endTime: item.endTime.substring(0, 5)
    }); 
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setCurrentCase(item);
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
            type: 'error',
            title: 'ข้อมูลไม่ครบถ้วน',
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
        });
        return; // สำคัญ: ต้องหยุดโค้ดตรงนี้
    }

  
    setIsSaveConfirmModalOpen(true); 
  };

  const confirmSave = async () => {
   setIsLoading(true); 
    try {
        const startDateTime = `${currentCase.date}T${currentCase.startTime}:00.000`;
        const endDateTime = `${currentCase.endDate || currentCase.date}T${currentCase.endTime}:00.000`;

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
        };

        if (currentCase.id === null) {
            await createCase(payload);
            setFeedbackModal({
              isOpen : true,
              type : "success",
              title : "สร้างเคสสำเร็จ",
              message : "ข้อมูลถูกบันทึกเรียบร้อยแล้ว"
            })
            
        } else {
            await updateCase(currentCase.id, payload); 
            setFeedbackModal({
              isOpen : true,
              type : "success",
              title : "แก้ไขข้อมูลสำเร็จ",
              message : "ข้อมูลถูกบันทึกเรียบร้อยแล้ว"
            })
            
        }

        setIsSaveConfirmModalOpen(false);
        setIsEditModalOpen(false);
        fetchCases(); 

    } catch (error) {
        console.error("Save Error:", error);

        setFeedbackModal({
          isOpen : true ,
          type : "error",
          title : "บันทึกไม่สำเร็จ",
          message : error.response?.data?.message || error.message
        });
        
    } finally {
        setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentCase || !currentCase.id) return;

    try {
        await deleteCase(currentCase.id);
        
        setFeedbackModal({
          isOpen : true,
          type : "success",
          title : "ลบข้อมูลสำเร็จ",
          message: 'รายการถูกลบออกจากระบบแล้ว'

        });
        
        setIsDeleteModalOpen(false);
        setCurrentCase(null);
        fetchCases(); 

    } catch (error) {
        console.error("Delete Error:", error);
        setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'ลบไม่สำเร็จ',
            message: error.response?.data?.message || error.message
        });
    }
  };
  
  // --- 4. OTHER HANDLERS ---
  const handleOpenEmailModal = () => {
  
    setAttachedFiles(Array(5).fill(null)); // ✅ Reset attachedFiles เป็น 5 ช่องว่าง // reset ฟอร์ม
    setSelectedRecipientIds([]);
    setIsRecipientDropdownOpen(false);
    setIsEmailModalOpen(true);

    setEmailSubject("");
      setEmailBody("");
  };

  const toggleRecipient = (id) => {
    setSelectedRecipientIds(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };


    const handleExport = async () => {
    try {
      setIsExporting(true);

      // เรียก API exportReport (ได้ blob กลับมา)
      const blob = await exportReport(selectedDate);

      // สร้าง URL ชั่วคราวจาก blob
      const url = window.URL.createObjectURL(blob);

      // สร้างแท็ก <a> ชั่วคราวสำหรับดาวน์โหลดไฟล์
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `daily-report-${selectedDate}.xlsx`;
      // downloadLink.style.display = "none";

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
      type: 'error',
      title: 'Export ไม่สำเร็จ',
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ กรุณาลองใหม่อีกครั้ง'
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
        type: 'error',
        title: 'ไม่สามารถอัปโหลดไฟล์นี้ได้',
        message: errors.join('\n') // แสดงรายการ error
    });
        // alert(`ไม่สามารถอัปโหลดไฟล์นี้ได้:\n- ${errors.join('\n- ')}`);
        e.target.value = null; // เคลียร์ input field เพื่อให้เลือกใหม่ได้
        return;
    }

    // 5. อัปเดต State array ณ ตำแหน่ง index ที่ส่งเข้ามา
    setAttachedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = file; // เก็บไฟล์จริง
        return newFiles;
    });
  };

  const removeFile = (indexToRemove) => {
    // ถูกต้อง: เปลี่ยนจากการ filter เป็นการ set ช่องนั้นให้เป็น null
    setAttachedFiles(prev => prev.map((file, index) => index === indexToRemove ? null : file));
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
    //   setFeedbackModal({
    //     isOpen : true ,
    //     type : "error",
    //     title : "",
    //   })
    //   alert("ไม่พบอีเมลของผู้รับที่เลือก");
    //   return;
    // }
  
  // 2) สร้าง FormData
    const formData = new FormData()
    formData.append("toEmails",JSON.stringify(toEmails))
    formData.append("subject",emailSubject);
    formData.append("body", emailBody);
  
     // 3) แนบไฟล์ (จาก state attachedFiles ที่ฟอร์ดทำไว้แล้ว)
    attachedFiles
      .filter((file) => !!file) // เอาเฉพาะช่องที่มีไฟล์จริง
      .forEach((file) => {
        formData.append("attachments", file); // ชื่อ field ต้องตรงกับ upload.array("attachments")
      });
  
  
    // const payload = {
    //   toEmails,               // <- array ตามที่ backend ต้องการ
    //   subject: emailSubject,  // string
    //   body: emailBody,        // string (ข้อความธรรมดา)
    // };
  
    setIsLoading(true);
  
    try {
      await sendDailyReport(formData);   //  เรียก API ที่เราแก้ในข้อ 1
      setIsEmailModalOpen(false);

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
          title: 'ส่งเมลไม่เสำเร็จ',
           message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTER & PAGINATION ---
  const filterStatusOptions = useMemo(() => {
    const defaultOpt = [{ value: 'all', label: 'สถานะ: ทั้งหมด' }];
    if (!lookupData.statuses.length) return defaultOpt;
    
    const dbOpts = lookupData.statuses.map(s => ({
        value: s.status_name.toLowerCase().replace(/\s+/g, ''), 
        label: `สถานะ: ${s.status_name}`
    }));
    return [...defaultOpt, ...dbOpts];
  }, [lookupData.statuses]);

  const filteredCases = cases.filter(c=>{
  const isSameStatus = filterStatus === 'all' ? true : c.status === filterStatus;

    const searchLower = searchText.toLowerCase();
    const isMatchSearch = 
        (c.game || '').toLowerCase().includes(searchLower) || 
        (c.problem || '').toLowerCase().includes(searchLower) ||
        (c.details || '').toLowerCase().includes(searchLower);
    
    return isSameStatus && isMatchSearch;

  })

// --- OPTIONS สำหรับ Modal (แปลงจาก lookupData) ---

const modalGameOptions = useMemo(
  () =>
    lookupData.products.map(p => ({
      value: p.product_id,
      label: p.product_name,
    })),
  [lookupData.products]   
);

const modalStatusOptions = useMemo(
  () =>
    lookupData.statuses.map(s => ({
      value: s.status_id,
      label: s.status_name,
    })),
  [lookupData.statuses]   
);

const modalProblemOptions = useMemo(
  () =>
    lookupData.problems.map(pr => ({
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
    <div className="fixed inset-0 w-full h-full overflow-y-auto font-sans text-slate-900 pb-20 
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900">
      
      {/* --- HEADER ---  */}
         <div className="sticky top-0 z-40 shadow-sm
        bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"> {/* Header Bar Dark Mode */}
        <div className="w-full px-1 sm:px-8 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-3 md:py-0 gap-3 md:gap-0">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 w-full md:w-auto px-48">
              <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-700">
                <button
                  className=" p-2 rounded-full
                   text-slate-500 dark:text-slate-400 
                   transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
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
                  <h1 className="text-xl font-medium text-slate-800 dark:text-white leading-tight">
                    Custom Report
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ระบบจัดการและแก้ไขเคส </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end px-40">
              <div className="w-48 ">
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
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Date Header & Title */}
        <div className="mb-6 flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    ภาพรวมประจำวันที่ <span className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600/20 dark:border-indigo-400/30 px-1">{selectedDate}</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-left">จัดการข้อมูล รายละเอียด และสถานะของเคส</p>
            </div>
            
            {/* --- NEW CASE BUTTON --- */}
            <button 
                onClick={openNewCaseModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-normal shadow-md hover:bg-emerald-700 transition-all active:scale-95
                 duration-500 
                    hover:-translate-y-1 
                  hover:shadow-md"
            >
                <Plus size={18} /> New Case
            </button>
        </div>

        {/* --- DASHBOARD SECTION (Copied Logic from DailyReport) --- */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
          {/* Total Cases Card */}
          <div className="md:col-span-1 h-full">
             <StatCard 
                title="Total Cases" 
                value={dashboardData.stats.total } 
                icon={<AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />} 
                color="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30"
             />
          </div>

          {/* Status Summary Card */}
          <div className="md:col-span-2">
             <StatusSummaryCard data={dashboardData.pieData} />
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-8 
        duration-500 
                  hover:shadow-md">
            <div className="flex items-center gap-2 mb-6">
                <Gamepad2 className="text-blue-500 dark:text-blue-400" size={24} />
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Game Issues Breakdown ({selectedDate})</h3>
            </div>
            <div className="h-64 w-full">
                {dashboardData.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.chartData}
                         margin={{ top: 7, right: 80, left: -8, bottom: 0 }}>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              vertical={false} 
                              stroke="#f1f5f9" 
                              strokeOpacity={0.1}
                            />
                             <XAxis
                                              dataKey="name"
                                              axisLine={false}
                                              tickLine={false}
                                              tick={{  //ทำให้ชื่อเกมเอียง 45 
                                                fill: "gray", // สีตัวอักษร
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
                                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                allowDecimals={false}
                            />
                            {/* <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            /> */}

                            <Bar
                            dataKey="count"
                            fill="#4f46e5"  
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                            //  ใส่ label เพื่อโชว์เลขบนหัวกราฟ
                            label={{ position: 'top', fill: 'gray', fontSize: 12, fontWeight: 'bold' }}>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center 
                      bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                        <BarChart2 size={32} className="mb-2 opacity-50"/>
                        <span className="text-sm">ยังไม่มีเคสในวันที่เลือก</span>
                    </div>
                )}
            </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-t-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white">รายการแจ้งปัญหา</h2>
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
             <div className="relative w-full sm:w-auto">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                  placeholder="ค้นหาปัญหา, เกม..." 
                  className="pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64
                  bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" />
             </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-b-xl shadow-sm overflow-hidden min-h-[300px]
          bg-white dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className='whitespace-nowrap'>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold tracking-wider
                  bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 text-center w-16">ID</th>
                  <th className="px-6 py-4 ">STATUS</th>
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
      <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
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

        {/* TIME / DURATION */}
        <td className="px-6 py-4 align-top">
          <div className="flex flex-col gap-1.5">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              {item.startTime} - {item.endTime}
            </div>
            <span className="text-xs px-2 py-0.5 rounded w-fit
              bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              ใช้เวลา: {item.duration}
            </span>
          </div>
        </td>

        {/* GAME / PROBLEM */}
        <td className="px-6 py-4 align-top">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Gamepad2 size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
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
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              <span className="font-semibold text-slate-900 dark:text-white">รายละเอียด:</span> {item.details}
            </p>
            {item.solution && (
              <div className="text-xs px-3 py-2 rounded-lg line-clamp-2
                bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">แก้ไข:</span> {item.solution}
              </div>
            )}
          </div>
        </td>

        {/* REPORTER / OPERATOR */}
        <td className="px-6 py-4 align-top">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                R
              </div>
              <span className="text-sm font-normal text-slate-700 dark:text-slate-300">
                {item.reporter}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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
    // 3. ถ้าโหลดเสร็จแล้วแต่ไม่มีข้อมูล -> แสดง Empty State
    <tr>
      <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <Search size={32} className="text-slate-300 dark:text-slate-600" />
          <p>ไม่พบข้อมูล</p>
        </div>
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
           {/* Pagination */}
           <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between
            bg-white dark:bg-slate-800">
            <span className="text-sm text-slate-500 dark:text-slate-400">
               หน้า {currentPage} จาก {totalPages} ({filteredCases.length}{" "}
              รายการ)
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage===1} 
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 disabled:opacity-50"
              >
                <ChevronLeft size={18}/>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                      ${currentPage === page 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage===totalPages || totalPages === 0} 
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 disabled:opacity-50"
              >
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* --- EDIT / ADD MODAL --- */}
      {isEditModalOpen && currentCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] 
              bg-white dark:bg-slate-800">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center 
                  bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                        {currentCase.id === null ? <Plus size={20} className="text-emerald-600"/> : <Pencil size={20} className="text-indigo-600 dark:text-indigo-400" />}
                        {currentCase.id === null ? 'เพิ่มเคสใหม่' : `แก้ไขข้อมูลเคส`}
                    </h3>
                    <button onClick={() => setIsEditModalOpen(false)} 
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                      <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleInitiateSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4 ">
                    {/* [UPDATED] Date & End Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">วันที่ (Date)</label>
                            <CustomDatePicker 
                                value={currentCase.date}
                                onChange={(val) => setCurrentCase({...currentCase, date: val})}
                                placeholder="เลือกวันที่"
                            />
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left ml-1">* สามารถเลือกวันที่ย้อนหลังได้</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">วันที่สิ้นสุด (End Date)</label>
                            {/* [ADDED] End Date Field */}
                            <CustomDatePicker 
                                value={currentCase.endDate}
                                onChange={(val) => setCurrentCase({...currentCase, endDate: val})}
                                placeholder="เลือกวันที่สิ้นสุด"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">เวลาเริ่ม (Start Time)</label>
                            <CustomTimePicker 
                                value={currentCase.startTime} 
                                onChange={(val) => handleTimeChange('startTime', val)} 
                                placeholder="เลือกเวลา"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">เวลาจบ (End Time)</label>
                            <CustomTimePicker 
                                value={currentCase.endTime} 
                                onChange={(val) => handleTimeChange('endTime', val)} 
                                placeholder="เลือกเวลา"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">ระยะเวลา (Duration)</label>
                      <input 
                            type="text" 
                            value={currentCase.duration} 
                            onChange={(e) => setCurrentCase({...currentCase, duration: e.target.value})} 
                            //  เช็คว่าถ้ามีคำว่า "ไม่ถูกต้อง" ให้เป็นสีแดง+พื้นหลังแดงจางๆ
                            className={`w-full border rounded-xl p-2.5 text-sm transition-colors
                              ${currentCase.duration.includes("ไม่ถูกต้อง") 
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-900/50 font-bold" 
                                : "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                              }`} 
                            placeholder="ระบบคำนวณอัตโนมัติ"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Game</label>
                            <CustomSelect 
                                options={modalGameOptions}
                                value={currentCase.product_id}
                                onChange={(val) => setCurrentCase({...currentCase, product_id: val})}
                                placeholder="เลือกเกม"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1 ">Status</label>
                            <CustomSelect 
                                options={modalStatusOptions}
                                value={currentCase.status_id}
                                onChange={(val) => setCurrentCase({...currentCase, status_id: val})}
                                placeholder="เลือกสถานะ"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">ปัญหา (Problem)</label>
                        <CustomSelect 
                            options={modalProblemOptions}
                            value={currentCase.problem_id}
                            onChange={(val) => setCurrentCase({...currentCase, problem_id: val})}
                            placeholder="เลือกปัญหา"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">รายละเอียด (Details)</label>
                        <textarea 
                          rows={3} 
                          value={currentCase.details} 
                          onChange={(e) => setCurrentCase({...currentCase, details: e.target.value})} 
                          className="w-full border rounded-xl p-2.5 text-sm resize-none
                            bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left ml-1">วิธีการแก้ไข (Solution)</label>
                        <textarea 
                          rows={3} 
                          value={currentCase.solution} 
                          onChange={(e) => setCurrentCase({...currentCase, solution: e.target.value})} 
                          className="w-full border rounded-xl p-2.5 text-sm resize-none
                           bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div>
                            <label className=" text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 ml-1">
                                <User size={14} className="text-orange-500"/> ผู้ร้องขอ (Requester)
                            </label>
                            <input 
                              type="text" 
                              value={currentCase.reporter} 
                              onChange={(e) => setCurrentCase({...currentCase, reporter: e.target.value})} 
                              className="w-full border rounded-xl p-2.5 text-sm
                                 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" 
                              placeholder="ระบุชื่อผู้แจ้ง" 
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 ml-1">
                                <User size={14} className="text-blue-500"/> ผู้ดำเนินเเก้ไข (Operator)
                            </label>
                            <input 
                              type="text" 
                              value={currentCase.operator} 
                              onChange={(e) => setCurrentCase({...currentCase, operator: e.target.value})} 
                              className="w-full border rounded-xl p-2.5 text-sm
                                 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" 
                              placeholder="ระบุชื่อผู้ดำเนินการ" 
                            />
                        </div>
                    </div>

                </form>
                <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">

                    <ButtonCancel   
                    onClick={()=>setIsEditModalOpen(false)}> Cancel </ButtonCancel>


                    <ButtonSave onClick={handleInitiateSave}  >
                      <Save size={20}/> {currentCase.id === null ? 'Create Case' : 'Save Changes'} 
        
                    </ButtonSave>
                </div>
            </div>
        </div>
      )}

      {/* --- SAVE CONFIRMATION MODAL (UPDATED for Dark Mode) --- */}
      {isSaveConfirmModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
                 <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                     <HelpCircle size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ยืนยันการบันทึก?</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะบันทึกข้อมูลนี้? <br/>กรุณาตรวจสอบความถูกต้องก่อนยืนยัน</p>
                 <div className="flex gap-3 justify-center">
                     <button onClick={() => setIsSaveConfirmModalOpen(false)} 
                      className="px-4 py-2 border rounded-xl font-bold text-sm transition-colors
                        bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                      >ยกเลิก</button>
                     <button onClick={confirmSave} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50"
                      >ยืนยัน</button>
                 </div>
             </div>
         </div>
      )}

      {/* --- DELETE CONFIRM MODAL (UPDATED for Dark Mode) --- */}
      {isDeleteModalOpen && currentCase && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
                 <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertTriangle size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ยืนยันการลบ?</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะลบรายการเคสนี้? <br/>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                 <div className="flex gap-3 justify-center">
                     <button onClick={() => setIsDeleteModalOpen(false)} 
                      className="px-4 py-2 border rounded-xl font-bold text-sm transition-colors
                        bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                      >ยกเลิก</button>
                     <button onClick={confirmDelete} 
                      className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-red-900/50"
                      >ยืนยันลบ</button>
                 </div>
             </div>
         </div>
      )}

      {/* --- SEND MAIL MODAL (UPDATED for Dark Mode) --- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]
            bg-white dark:bg-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center 
              bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Send size={20} className="text-indigo-600 dark:text-indigo-400" /> Send Daily Report
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
                      ${isRecipientDropdownOpen
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
                    <div className="absolute z-20 left-0 right-0 mt-2 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-100
                      bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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
                    className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
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
             {/* ✅ ส่วน Attachments ที่ถูกต้อง (เริ่ม) */}
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
                                <div className="flex-1 flex items-center justify-between p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700 
                                  bg-slate-50 dark:bg-slate-900">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                       <FileText size={16} className="text-indigo-500 shrink-0" />
                                       <span className="truncate font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
                                       <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
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
                                    <label htmlFor={`file-input-${index}`} 
                                        className="block border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:border-indigo-400 transition-colors group
                                          border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        <span className="text-sm font-medium flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Paperclip size={16} className="text-slate-400 group-hover:text-indigo-500"/>
                                            Click to attach File {index + 1}
                                        </span>
                                    </label>
                                    <input 
                                        id={`file-input-${index}`} 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => handleFileChange(e, index)} 
                                        accept={CONFIG.ALLOWED_FILE_TYPES.join(',')} 
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left">
                        * ไฟล์แนบแต่ละไฟล์สูงสุด {CONFIG.MAX_FILE_SIZE_MB}MB (PDF, JPG, PNG, DOCX, XLSX, XLS)
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
              <button
                onClick={handleSendEmail}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}{" "}
                Confirm Send
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