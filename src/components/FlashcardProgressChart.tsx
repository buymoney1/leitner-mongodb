// src/components/FlashcardProgressChartDark.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { useSession } from 'next-auth/react';

const FlashcardProgressChartDark = () => {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlashcardData = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const res = await fetch('/api/flashcards/progress');
        if (!res.ok) throw new Error('خطا در دریافت داده‌ها');
        const data = await res.json();
        setChartData(data.data);
        setOverallProgress(data.overallProgress);
        setTotalCards(data.totalCards);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardData();
  }, [session]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
        <p className="font-bold">خطا در بارگذاری داده‌ها</p>
        <p>{error}</p>
      </div>
    );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-semibold text-cyan-400">{label}</p>
          <p className="text-blue-400">{`تعداد کارت‌ها: ${payload[0].value}`}</p>
          <p className="text-green-400">{`درصد پیشرفت: ${payload[0].payload.progress}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700">
      {/* Overall Progress */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-500 mb-4 px-3 py-3">پیشرفت شما</h2>
        <div className="flex items-center space-x-4 px-3">
          <div className="w-full bg-gray-800 rounded-full h-5">
            <div
              className="h-5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <span className="font-bold text-green-400 text-lg">{overallProgress}%</span>
        </div>
        <p className="text-gray-400 mt-2 px-3">
          تعداد کل کارت‌ها: <span className="text-blue-400 font-semibold">{totalCards}</span>
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="box" tick={{ fill: '#9CA3AF', fontWeight: 500 }} axisLine={{ stroke: '#555' }} />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#9CA3AF' }}
            axisLine={{ stroke: '#555' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#9CA3AF' }}
            axisLine={{ stroke: '#555' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#fff', fontWeight: 'bold', paddingTop: '20px' }}
          />
          <Bar
            yAxisId="left"
            dataKey="count"
            fill="#3B82F6"
            name="تعداد کارت‌ها"
            radius={[10, 10, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="progress"
            stroke="#10B981"
            strokeWidth={3}
            name="درصد پیشرفت"
            dot={{ fill: '#10B981', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Box Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 px-3 pb-3">
        {chartData.map((item) => (
          <div
            key={item.boxNumber}
            className="bg-gray-800 rounded-lg p-3 text-center shadow-md border border-gray-700 hover:scale-105 transition-transform"
          >
            <p className="text-sm text-gray-400">{item.box}</p>
            <p className="text-xl font-bold text-cyan-400">{item.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardProgressChartDark;
