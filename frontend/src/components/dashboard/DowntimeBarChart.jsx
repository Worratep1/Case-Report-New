import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart2, Activity } from "lucide-react";

const DowntimeBarChart = ({ data }) => {

  const maxMinutes = data && data.length > 0 ? Math.max(...data.map(d => d.minutes)) : 0;
  const tickInterval = 180; // ล็อกไว้ที่ 3 ชม.
  const generatedTicks = [];
  
  for (let i = 0; i <= maxMinutes + tickInterval; i += tickInterval) {
    generatedTicks.push(i);
  }
  
  // ฟังก์ชันแปลงนาที เป็น "Xh Ym"
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Custom Label: แสดง "เวลา (จำนวนครั้ง)" ที่ปลายแท่ง
  // ใช้ index เพื่อดึงข้อมูลที่ถูกต้อง ป้องกัน error
  const renderCustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const item = data[index];
    const count = item ? item.count : 0;
    const timeLabel = formatTime(value);

    return (
      <text 
        x={x + width + 5} 
        y={y + height / 2 + 4} 
        fill="#64748b" 
        fontSize={12}
        textAnchor="start"
        fontWeight="bold"
      >
         {timeLabel} ({count} ครั้ง)
      </text>
    );
  };
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="text-blue-500 dark:text-blue-400" size={24} />
        <div>
            <h3 className="text-lg flex font-medium text-slate-800 dark:text-white">
            Downtime Breakdown
            </h3>
            <p className="text-xs text-slate-500">ระยะเวลา (ชม/นาที) และจำนวนครั้งที่เกิดปัญหา</p>
        </div>
      </div>

      <div className="h-64 w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 0, right: 120, left: 0, bottom: 2 }} // เผื่อขอบขวาให้ข้อความ
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
            <XAxis 
                type="number" 
                axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }} 
                tickLine={{ stroke: "#94a3b8" }} 
                tick={{ fill: "#64748b", fontSize: 12.5 }}
                tickFormatter={(val) => `${Math.floor(val / 60)}h`}
                ticks={generatedTicks}
                domain={[0, generatedTicks[generatedTicks.length - 1]]} 
                
                interval={0} // บังคับให้แสดงทุกตัวเลขถ้าพื้นที่พอ
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg">
                            <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{d.name}</p>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 flex justify-between gap-4">
                                    <span>Downtime:</span>
                                    <span className="font-medium text-indigo-600">{formatTime(d.minutes)}</span>
                                </p>
                                <p className="text-xs text-slate-500 flex justify-between gap-4">
                                    <span>Count:</span>
                                    <span className="font-medium text-orange-600">{d.count} ครั้ง</span>
                                </p>
                            </div>
                        </div>
                    );
                    }
                    return null;
                }}
              />
              <Bar
                dataKey="minutes"
                radius={[0, 4, 4, 0]}
                barSize={24}
                label={renderCustomBarLabel}
                isAnimationActive={true}
                
              >
                {/* ใช้สีเดียว (Indigo) ทั้งหมด */}
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
            <Activity size={32} className="mb-2 opacity-50 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
            <span className="text-xs">ไม่พบ Downtime ในช่วงเวลานี้</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DowntimeBarChart;