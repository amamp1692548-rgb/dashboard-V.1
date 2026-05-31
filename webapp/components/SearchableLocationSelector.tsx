"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, X, Globe, Loader2 } from 'lucide-react';

interface LocationItem {
  name: string;
  lat?: number;
  lng?: number;
  type?: 'reef' | 'global';
}

interface SearchableLocationSelectorProps {
  currentRegion: string;
  onRegionChange: (region: string) => void;
  availableLocations: string[]; // This is the list of reef names/provinces
}

export default function SearchableLocationSelector({ 
  currentRegion, 
  onRegionChange, 
  availableLocations 
}: SearchableLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalResults, setGlobalResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter local locations
  const filteredLocal = availableLocations.filter(loc => 
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(loc => ({ name: loc, type: 'reef' as const }));

  // Global search function
  const searchEverywhere = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5`);
      const data = await response.json();
      const results = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: 'global' as const
      }));
      setGlobalResults(results);
    } catch (error) {
      console.error("Global search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item: LocationItem) => {
    if (item.type === 'global' && item.lat && item.lng) {
      (window as any)._lastSelectedLocation = { lat: item.lat, lng: item.lng };
      (window as any)._lastSelectedName = item.name;
      onRegionChange(item.name);
    } else {
      onRegionChange(item.name);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-100 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 backdrop-blur-md rounded-lg hover:bg-[#0ea5e9]/20 transition-all min-w-[240px] cursor-pointer shadow-sm"
      >
        <MapPin className="w-4 h-4 text-[#38bdf8] shrink-0" />
        <span className="truncate flex-1">{currentRegion}</span>
        <ChevronDown className={`w-4 h-4 text-[#38bdf8] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1624] border border-[#1e293b] rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl">
          <div className="p-2 border-b border-[#1e293b]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search reefs or global cities..." 
                className="w-full pl-9 pr-4 py-2 bg-[#090e17] border border-[#1e293b] rounded-lg text-sm text-slate-200 outline-none focus:ring-1 focus:ring-[#38bdf8]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchEverywhere()}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {/* Local Reef Results */}
            <div className="p-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Thailand Reefs & Regions</div>
              {filteredLocal.length > 0 ? (
                filteredLocal.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0ea5e9]/10 text-slate-300 hover:text-white cursor-pointer transition-colors text-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                    {item.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-500 italic">No local reefs found</div>
              )}
            </div>

            {/* Global Search Option */}
            <div className="p-2 border-t border-[#1e293b] bg-[#090e17]/30">
              <button 
                onClick={searchEverywhere}
                disabled={isSearching || !searchTerm}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-[#38bdf8]/10 text-[#38bdf8] transition-colors text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>Search Everywhere</span>
                </div>
                <span className="text-[10px] bg-[#38bdf8]/20 px-1.5 py-0.5 rounded uppercase">Enter</span>
              </button>

              {globalResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {globalResults.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className="flex flex-col px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors text-xs"
                    >
                      <div className="font-medium text-slate-200">{item.name.split(',')[0]}</div>
                      <div className="truncate opacity-60 text-[10px]">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
