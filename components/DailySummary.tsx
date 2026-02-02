
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DailyStats } from '../types';

interface DailySummaryProps {
  stats: DailyStats;
  goals?: DailyStats;
}

const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

export const DailySummary: React.FC<DailySummaryProps> = ({ stats, goals = { calories: 2000, protein: 150, carbs: 250, fat: 70 } }) => {
  const macroData = [
    { name: 'Protein (g)', value: Math.round(stats.protein) },
    { name: 'Carbs (g)', value: Math.round(stats.carbs) },
    { name: 'Fat (g)', value: Math.round(stats.fat) },
  ];

  const calPercentage = Math.min(100, Math.round((stats.calories / goals.calories) * 100));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-100 stroke-current"
              strokeWidth="8"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={`${calPercentage > 100 ? 'text-red-500' : 'text-blue-500'} stroke-current`}
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - calPercentage / 100)}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-gray-900">{Math.round(stats.calories)}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kcal consumed</span>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-500">
          Goal: {goals.calories} kcal
        </p>
      </div>

      <div className="w-full md:w-1/2">
        <h3 className="text-lg font-black text-gray-900 mb-4">Macro Distribution</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-green-50 rounded-xl p-2">
            <p className="text-[10px] uppercase font-bold text-green-600">Protein</p>
            <p className="text-lg font-black text-green-700">{Math.round(stats.protein)}g</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2">
            <p className="text-[10px] uppercase font-bold text-blue-600">Carbs</p>
            <p className="text-lg font-black text-blue-700">{Math.round(stats.carbs)}g</p>
          </div>
          <div className="bg-red-50 rounded-xl p-2">
            <p className="text-[10px] uppercase font-bold text-red-600">Fat</p>
            <p className="text-lg font-black text-red-700">{Math.round(stats.fat)}g</p>
          </div>
        </div>
      </div>
    </div>
  );
};
