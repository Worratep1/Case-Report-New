import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const StatusPieChart = ({ data }) => {
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (value === 0) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: "11px", fontWeight: "bold", pointerEvents: "none" }}>
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col justify-center hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <PieChartIcon size={14} /> Status Summary
        </h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 h-full">
        {/* Chart */}
        <div className="w-full sm:w-1/2 h-[140px] relative">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                  isAnimationActive={true}>
                
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
              ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
              <PieChartIcon size={32} className="mb-1 opacity-50" />
              <p className="text-xs">ไม่พบข้อมูล</p>
            </div>
          )}
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-1/2 grid grid-cols-1 gap-y-3">
          {data && data.length > 0 ? (
            data.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{entry.name}</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">({entry.value})</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500  text-center col-span-2">ไม่พบข้อมูล </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPieChart;