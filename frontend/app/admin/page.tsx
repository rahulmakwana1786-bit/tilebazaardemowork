"use client";

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/adminSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IoCashOutline, IoCartOutline, IoPeopleOutline, IoCubeOutline } from 'react-icons/io5';
const DashboardSkeleton = () => (
  <div className="p-8 bg-white animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-10">
      <div className="h-8 w-64 bg-gray-100 rounded-sm mb-2" />
      <div className="h-3 w-48 bg-gray-50 rounded-sm" />
    </div>

    {/* Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 border border-gray-100 rounded-sm bg-gray-50/50">
          <div className="flex justify-between mb-4">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-5 w-5 bg-gray-100 rounded-full" />
          </div>
          <div className="h-8 w-24 bg-gray-100 rounded" />
        </div>
      ))}
    </div>

    {/* Graph & Side Panel Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white border border-gray-100 p-8 h-[400px]">
        <div className="h-4 w-40 bg-gray-100 rounded mb-8" />
        <div className="h-full w-full bg-gray-50 rounded" />
      </div>
      <div className="bg-gray-100 p-8 h-[400px] rounded-sm" />
    </div>
  </div>
);
export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.admin);
  const [isMounted, setIsMounted] = React.useState(false); // Track mounting

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    dispatch(fetchDashboardStats());
  }, [dispatch]);

if (loading || !stats || !isMounted) {
    return <DashboardSkeleton />;
  }

  // Formatting data for the Graph
  const chartData = [
    { name: 'Total Orders', value: stats.totalOrders, color: '#4a2c2a' },
    { name: 'Pending', value: stats.pendingOrders, color: '#d97706' },
    { name: 'Shipped', value: stats.shippedOrders, color: '#7c3aed' },
    { name: 'Users', value: stats.totalUsers, color: '#2563eb' },
    { name: 'Products', value: stats.totalProducts, color: '#059669' },
  ];

  const statCards = [
    { label: 'Revenue', value: `£${stats.totalRevenue.toLocaleString()}`, icon: <IoCashOutline size={20}/>, color: 'text-green-600' },
    { label: 'Orders', value: stats.totalOrders, icon: <IoCartOutline size={20}/>, color: 'text-[#4a2c2a]' },
    { label: 'Users', value: stats.totalUsers, icon: <IoPeopleOutline size={20}/>, color: 'text-blue-600' },
    { label: 'Inventory', value: stats.totalProducts, icon: <IoCubeOutline size={20}/>, color: 'text-gray-600' },
  ];

  return (
    <div className="p-8 bg-white min-h-full">
      <header className="mb-10">
        <h1 className="text-3xl font-serif text-[#4a2c2a]">Dashboard Overview</h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mt-1">Real-time performance of TileBazaar</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, i) => (
          <div key={i} className="p-6 border border-gray-100 rounded-sm bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.label}</span>
              <div className={`${card.color} opacity-80`}>{card.icon}</div>
            </div>
            <p className="text-2xl font-serif text-[#4a2c2a]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 p-8 rounded-sm min-h-[400px]">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4a2c2a] mb-8">Inventory & Engagement Distribution</h3>
          <div className="h-[300px] w-full relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '0px', border: '1px solid #f0f0f0', fontSize: '10px', textTransform: 'uppercase'}}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY PLACEHOLDER */}
        <div className="bg-[#4a2c2a] text-white p-8 rounded-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 mb-6">Quick Insights</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] opacity-60 uppercase mb-1">Conversion Warning</p>
              <p className="text-sm font-serif">{stats.pendingOrders} orders require your immediate attention.</p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] opacity-60 uppercase mb-1">Catalog Status</p>
              <p className="text-sm font-serif">Average revenue per order is £{(stats.totalRevenue / (stats.totalOrders || 1)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}