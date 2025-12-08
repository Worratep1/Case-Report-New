import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  BarChart3, 
  Download, 
  Filter, 
  RefreshCw,
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import ButtonBack from '../components/ButtonBack';

// ==========================================
// 1. Sub-Component: SummaryStatCard
// ==========================================
const SummaryStatCard = ({ title, value, unit, trend, trendType, icon, color }) => {
  const icons = {
    alert: <AlertCircle size={24} />,
    clock: <Clock size={24} />,
    check: <CheckCircle2 size={24} />,
    zap: <Zap size={24} />
  };

  const colorStyles = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };

  const trendColor = 
    trendType === 'good' ? 'text-emerald-600' :
    trendType === 'bad' ? 'text-red-600' : 
    'text-slate-400';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-slate-800">
            {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
          </h4>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} transition-transform group-hover:scale-110`}>
          {icons[icon]}
        </div>
      </div>
      
      <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
        {trendType === 'good' && <ArrowUp size={14} />}
        {trendType === 'bad' && <ArrowDown size={14} />} 
        {trendType === 'neutral' && <Minus size={14} />}
        {trend}
      </div>
    </div>
  );
};

// ==========================================
// 2. Sub-Component: SummaryCharts
// ==========================================
const SummaryCharts = ({ type, data }) => {
  const defaultBarData = [
    { name: 'Audition', downtime: 45 },
    { name: 'Yulgang', downtime: 30 },
    { name: 'PUBG', downtime: 60 },
    { name: 'ROV', downtime: 25 },
    { name: 'FreeFire', downtime: 15 },
    { name: 'TSX', downtime: 50 },
  ];

  const pieData = [
    { name: 'Success', value: 75, color: '#10B981' }, 
    { name: 'Pending', value: 15, color: '#F59E0B' }, 
    { name: 'Error', value: 10, color: '#EF4444' },   
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg text-xs shadow-xl">
          <p className="font-bold mb-1">{label}</p>
          <p>Downtime: {payload[0].value} mins</p>
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data || defaultBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748B', fontSize: 12}} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748B', fontSize: 12}} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#F1F5F9'}} />
            <Bar dataKey={data ? "downtime" : "downtime"} fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="w-full h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
            <span className="text-3xl font-bold text-slate-800">100%</span>
            <p className="text-xs text-slate-400">Total Status</p>
        </div>
      </div>
    );
  }
  return null;
};

// ==========================================
// 3. Sub-Component: SummaryTable
// ==========================================
const SummaryTable = ({ reportType }) => {
  const data = [
    { id: 1, game: 'Audition', downCount: 3, totalDownPercent: 37.5, time: '00:03', status: 'critical' },
    { id: 2, game: 'Yulgang', downCount: 3, totalDownPercent: 37.5, time: '00:03', status: 'critical' },
    { id: 3, game: 'TSX', downCount: 1, totalDownPercent: 12.5, time: '00:09', status: 'warning' },
    { id: 4, game: 'Yulgang Classic', downCount: 1, totalDownPercent: 12.5, time: '00:02', status: 'warning' },
    { id: 5, game: 'ROV', downCount: 0, totalDownPercent: 0, time: '00:00', status: 'normal' },
    { id: 6, game: 'Free Fire', downCount: 0, totalDownPercent: 0, time: '00:00', status: 'normal' },
    { id: 7, game: 'PUBG Mobile', downCount: 0, totalDownPercent: 0, time: '00:00', status: 'normal' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4">Game / Product</th>
            <th className="px-6 py-4 text-center">Down Count</th>
            <th className="px-6 py-4">Total Down (%)</th>
            <th className="px-6 py-4">Downtime (hrs:mns)</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm
                    ${item.game.charAt(0) === 'A' ? 'bg-pink-500' : 
                      item.game.charAt(0) === 'Y' ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                  >
                    {item.game.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-700">{item.game}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`font-bold ${item.downCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {item.downCount}
                </span>
              </td>
              <td className="px-6 py-4 align-middle">
                <div className="w-full max-w-[140px]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{item.totalDownPercent.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${item.totalDownPercent > 20 ? 'bg-red-500' : item.totalDownPercent > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                      style={{ width: `${item.totalDownPercent === 0 ? 0 : Math.max(item.totalDownPercent, 5)}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-sm text-slate-600">
                {item.time} hrs
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                  {item.status.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <ArrowUpRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// 4. Main Page Component
// ==========================================
export default function SummaryReportPage() {
  const navigate = useNavigate();
  
  // State Management
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Mock Data
  const summaryStats = {
    totalCases: 15,
    totalDowntime: "02:45:00",
    avgResponse: "15 min",
    successRate: 92.5
  };

  const chartData = [
    { name: 'Audition', downtime: 45, cases: 3 },
    { name: 'Yulgang', downtime: 30, cases: 2 },
    { name: 'PUBG M', downtime: 60, cases: 5 },
    { name: 'ROV', downtime: 15, cases: 1 },
    { name: 'Free Fire', downtime: 15, cases: 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <ButtonBack onClick={() => navigate('/menu')}>Back</ButtonBack>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={24}/> 
              Summary Report
            </h1>
            <p className="text-xs text-slate-500">ติดตามสถานะและสถิติระบบเกม</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${reportType === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daily
          </button>
          <button 
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${reportType === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Date Selection & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
              {reportType === 'daily' ? 'เลือกวันที่ดูรายงาน' : 'เลือกเดือนที่ดูรายงาน'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={reportType === 'daily' ? "date" : "month"}
                value={reportType === 'daily' ? selectedDate : selectedMonth}
                onChange={(e) => reportType === 'daily' ? setSelectedDate(e.target.value) : setSelectedMonth(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
              />
            </div>
          </div>

          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors">
                <RefreshCw size={16}/> <span className="hidden sm:inline">Refresh</span>
             </button>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 text-sm font-semibold transition-colors">
                <Download size={16}/> Export PDF
             </button>
          </div>
        </div>

        {/* Key Metrics (Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStatCard 
            title="Total Cases" 
            value={summaryStats.totalCases} 
            unit="items"
            trend="+2 from yesterday"
            trendType="up" 
            icon="alert"
            color="orange"
          />
          <SummaryStatCard 
            title="Total Downtime" 
            value={summaryStats.totalDowntime} 
            unit="hrs"
            trend="-15m from yesterday"
            trendType="good" 
            icon="clock"
            color="red"
          />
          <SummaryStatCard 
            title="Success Rate" 
            value={`${summaryStats.successRate}%`} 
            unit=""
            trend="+1.2% efficiency"
            trendType="good"
            icon="check"
            color="emerald"
          />
          <SummaryStatCard 
            title="Avg. Response" 
            value={summaryStats.avgResponse} 
            unit=""
            trend="Stable"
            trendType="neutral"
            icon="zap"
            color="blue"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Downtime by Game</h3>
                <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-500 outline-none">
                  <option>Sort by Time</option>
                  <option>Sort by Name</option>
                </select>
              </div>
              <SummaryCharts type="bar" data={chartData} />
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-6">Case Status</h3>
              <SummaryCharts type="pie" />
           </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">System Performance Details</h3>
            <div className="flex gap-2">
               <div className="relative">
                 <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                 <input type="text" placeholder="Filter games..." className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"/>
               </div>
            </div>
          </div>
          <SummaryTable reportType={reportType} />
        </div>

      </div>
    </div>
  );
}