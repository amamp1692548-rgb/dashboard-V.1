import React from 'react';
import { Search, Bell, Maximize } from 'lucide-react';

interface HeaderProps {
  availableLocations: string[];
  setRegion: (region: string) => void;
}

export default function Header({ availableLocations, setRegion }: HeaderProps) {
  const dashboardFeatures = [
    { name: 'KPI Overview (Temp, Sensors)', id: 'kpi-section', keywords: ['kpi', 'temperature', 'active', 'sensors', 'cards'] },
    { name: 'Marine Map & Regions', id: 'map-section', keywords: ['map', 'thailand', 'regions', 'reefs'] },
    { name: 'Biodiversity & Algae Trends', id: 'trends-section', keywords: ['trends', 'biodiversity', 'algae', 'charts'] },
    { name: 'Spectral Sensor Analysis', id: 'spectral-section', keywords: ['spectral', 'sensor', 'data', 'analysis'] },
  ];

  const handleSearch = (term: string) => {
    const val = term.toLowerCase();
    if (!val) return;

    const match = dashboardFeatures.find(feature => 
      feature.name.toLowerCase().includes(val) || 
      feature.keywords.some(k => k.includes(val))
    );

    if (match) {
      const element = document.getElementById(match.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Add a temporary highlight effect
        element.classList.add('ring-2', 'ring-[#38bdf8]', 'ring-offset-4', 'ring-offset-[#090e17]');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-[#38bdf8]', 'ring-offset-4', 'ring-offset-[#090e17]');
        }, 2000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Welcome back, Miguel! <span>👋 🐬</span>
          </h1>
          <p className="text-sm text-slate-200 mt-1 font-medium opacity-100">Ecosystem Analytics Dashboard 🌊</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search charts or data..." 
              className="pl-10 pr-4 py-2 text-sm bg-[#0d1624]/90 border border-[#1e293b] rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/30 w-64 transition-all focus:w-80"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-200 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 bg-[#0d1624]/90 border border-[#1e293b] backdrop-blur-md rounded-lg hover:bg-[#090e17] transition-colors">
            <Maximize className="w-4 h-4" />
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
