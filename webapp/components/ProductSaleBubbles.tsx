"use client";
import React from 'react';
import { useWebSocketData } from './WebSocketProvider';

export default function ProductSaleBubbles() {
  const { data: wsData } = useWebSocketData();
  const data = wsData?.dashboard?.productSale || [];

  const vals = data.length === 3 ? data.map(d => d.val) : [0, 0, 0];

  return (
    <div className="relative flex-1 min-h-[160px] flex items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] text-slate-100 flex items-center justify-center font-bold absolute left-4 z-10 shadow-sm transition-transform hover:scale-105">
        {vals[0]}
      </div>
      <div className="w-32 h-32 rounded-full bg-blue-200/50 text-slate-300 flex items-center justify-center text-xl font-bold z-0 shadow-sm transition-transform hover:scale-105">
        {vals[1]}
      </div>
      <div className="w-16 h-16 rounded-full bg-cyan-200/60 text-cyan-800 flex items-center justify-center font-bold absolute right-8 bottom-6 z-10 shadow-sm transition-transform hover:scale-105">
        {vals[2]}
      </div>
    </div>
  );
}
