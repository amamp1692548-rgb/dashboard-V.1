"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWebSocketData } from '@/components/WebSocketProvider';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Activity, 
  Settings, 
  Bell, 
  Search,
  Droplets,
  Thermometer,
  Zap,
  ShieldAlert,
  ChevronRight,
  Maximize2
} from 'lucide-react';

// Dynamic import for the map to avoid SSR issues
const CoralReefMap = dynamic(() => import('@/components/CoralReefMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map Satellite...</div>
});

export default function ExperimentalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: wsData } = useWebSocketData();
  const kpis = wsData?.dashboard?.kpi || [];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* --- Glass Sidebar --- */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-slate-800/50 bg-[#020617]/80 backdrop-blur-xl z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Droplets className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            CORAL PRO
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<MapIcon size={20} />} label="Global Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          <NavItem icon={<Activity size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavItem icon={<Bell size={20} />} label="Alerts" active={false} />
          <div className="pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:block px-4">System</div>
          <NavItem icon={<Settings size={20} />} label="Config" active={false} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 hidden lg:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">System Live</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              V3.2.1 Connected to Andaman North Node.
            </p>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* --- Top Header Overlay --- */}
        <header className="h-20 flex items-center justify-between px-8 z-40 relative">
          <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 w-96">
            <Search className="text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search sensors or regions..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2 hidden sm:flex">
              <span className="text-xs font-semibold text-white">Thongchai R.</span>
              <span className="text-[10px] text-slate-400">Deep Sea Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden cursor-pointer hover:border-cyan-500 transition-colors">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        {/* --- Content Grid --- */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-y-auto">
          
          {/* Main Map Card (Spans 8 cols) */}
          <section className="col-span-12 lg:col-span-8 bg-slate-900/20 rounded-[2rem] border border-slate-800/50 overflow-hidden relative group min-h-[500px]">
             <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                   <h3 className="text-sm font-bold text-white flex items-center gap-2">
                     <MapIcon className="w-4 h-4 text-cyan-400" />
                     Live Geographic Status
                   </h3>
                   <p className="text-[11px] text-slate-400 mt-1">Monitoring 128 active reef nodes</p>
                </div>
             </div>

             <div className="absolute top-6 right-6 z-10">
                <button className="p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                  <Maximize2 size={18} />
                </button>
             </div>

             {/* The Actual Map Component */}
             <div className="w-full h-full">
                <CoralReefMap region="All Regions" />
             </div>

             {/* Bottom Map Info Bar */}
             <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
                <div className="flex gap-2">
                   <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                     Andaman: Stable
                   </div>
                   <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                     Gulf: Warning
                   </div>
                </div>
             </div>
          </section>

          {/* Side Panels (Spans 4 cols) */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* KPI Stack */}
            <div className="grid grid-cols-2 gap-4">
              {kpis.slice(0, 4).map((kpi: any, idx: number) => (
                <div key={idx} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-5 rounded-3xl hover:border-cyan-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-xl bg-slate-800/50 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 transition-colors">
                         {idx === 0 ? <Activity size={18} /> : idx === 1 ? <Zap size={18} /> : idx === 2 ? <ShieldAlert size={18} /> : <Thermometer size={18} />}
                      </div>
                      <span className={`text-[10px] font-bold ${kpi.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {kpi.yoy}
                      </span>
                   </div>
                   <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
                   <div className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{kpi.title}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions / Recent Alerts */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800/50 rounded-[2rem] p-6">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white">Critical Events</h3>
                  <button className="text-[10px] font-bold text-cyan-400 hover:underline uppercase tracking-widest">View All</button>
               </div>
               
               <div className="space-y-4">
                  <AlertItem 
                    type="critical" 
                    title="Bleaching Risk Detected" 
                    time="2 mins ago" 
                    location="Similan Islands" 
                  />
                  <AlertItem 
                    type="warning" 
                    title="Sensor Node-B4 Offline" 
                    time="14 mins ago" 
                    location="Koh Tao" 
                  />
                  <AlertItem 
                    type="info" 
                    title="Maintenance Scheduled" 
                    time="1h ago" 
                    location="Phuket Hub" 
                  />
               </div>
            </div>

            {/* Health Index Card */}
            <div className="bg-cyan-600/10 border border-cyan-500/20 rounded-[2rem] p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Droplets size={80} className="text-cyan-400" />
               </div>
               <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Overall Ecosystem Health</h3>
               <div className="flex items-end gap-3">
                  <div className="text-5xl font-black text-white">84.2</div>
                  <div className="text-xl font-bold text-cyan-500 mb-1">/100</div>
               </div>
               <div className="w-full bg-slate-800/50 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full w-[84%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
               </div>
               <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                 <ChevronRight size={12} className="text-cyan-500" />
                 Growth rate increased by 2.4% since last reading
               </p>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
          : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
      }`}
    >
      <div className={`${active ? 'text-cyan-400' : 'group-hover:scale-110 transition-transform'}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold hidden lg:block tracking-wide">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] hidden lg:block" />}
    </button>
  );
}

function AlertItem({ type, title, time, location }: { type: 'critical' | 'warning' | 'info', title: string, time: string, location: string }) {
  const colors = {
    critical: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[type].split(' ')[1]} ${colors[type].split(' ')[0]} transition-transform hover:scale-[1.02] cursor-pointer`}>
       <div className="flex justify-between items-start mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
          <span className="text-[9px] opacity-60 font-medium">{time}</span>
       </div>
       <div className="flex items-center gap-1.5 opacity-80">
          <MapPinIcon size={10} />
          <span className="text-[10px] font-medium">{location}</span>
       </div>
    </div>
  );
}

function MapPinIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
