"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import CommandTopBar from "@/components/CommandTopBar";
import KPICards from "@/components/KPICards";
import AlertPanel from "@/components/AlertPanel";
import NodeListPanel from "@/components/NodeListPanel";
import AIPredictionPanel from "@/components/AIPredictionPanel";
import CoralHealthGauge from "@/components/CoralHealthGauge";
import {
  CoralHealthTrendChart,
  ThreatTrendChart,
  CoralStatusPieChart,
  NodeSpectralRealtimeChart
} from "@/components/Charts";
import { useWebSocketData } from "@/components/WebSocketProvider";

const CoralReefMap = dynamic(() => import("@/components/CoralReefMap"), { ssr: false });

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-glass" style={{ padding: 14 }}>
      <div className="section-label" style={{ marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showSpectralGraph, setShowSpectralGraph] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const { data, isConnected } = useWebSocketData();
  
  // Drag state for System Notifications
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStartPos.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
  };

  const handleHeaderClick = () => {
    if (hasDragged.current) return;
    setIsLogsOpen(!isLogsOpen);
  };

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node);
    setShowSpectralGraph(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      if (Math.abs(newX - dragOffset.x) > 3 || Math.abs(newY - dragOffset.y) > 3) {
        hasDragged.current = true;
      }
      
      setDragOffset({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        let dx = 0;
        let dy = 0;
        
        const distLeft = rect.left;
        const distRight = winW - rect.right;
        const distTop = rect.top;
        const distBottom = winH - rect.bottom;
        
        // 1. Bound to screen (prevent escaping)
        if (distLeft < 0) dx = Math.abs(distLeft) + 20;
        else if (distRight < 0) dx = -(Math.abs(distRight) + 20);
        
        if (distTop < 0) dy = Math.abs(distTop) + 20;
        else if (distBottom < 0) dy = -(Math.abs(distBottom) + 20);
        
        // 2. Snap to nearest edge (if not already out of bounds)
        if (dx === 0 && dy === 0) {
            const minEdge = Math.min(distLeft, distRight, distTop, distBottom);
            if (minEdge === distLeft) dx = -(distLeft - 20);
            else if (minEdge === distRight) dx = (distRight - 20);
            else if (minEdge === distTop) dy = -(distTop - 20);
            else if (minEdge === distBottom) dy = (distBottom - 20);
        }
        
        if (dx !== 0 || dy !== 0) {
            setDragOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        }
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const avgHealth = data?.dashboard?.kpi?.find((k: any) => k.id === "avg_health")?.value || "—";
  const nodes: any[] = data?.dashboard?.mapData || [];

  return (
    <div style={{ height: "100vh", background: "var(--bg-deep)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <CommandTopBar />
      {!isConnected && (
        <div style={{ padding: 12, margin: "10px 14px", borderRadius: 8, background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
          กำลังเชื่อมต่อกับ backend... ถ้าโหลดนานเกิน 10 วินาที ให้รีเฟรชหน้าจอ
        </div>
      )}
      {isConnected && !data && (
        <div style={{ padding: 12, margin: "10px 14px", borderRadius: 8, background: "rgba(56, 189, 248, 0.1)", color: "#0ea5e9", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          เชื่อมต่อ WebSocket แล้ว แต่กำลังรอข้อมูลจาก backend...
        </div>
      )}

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "220px 1fr 280px",
        gridTemplateRows: "1fr",
        gap: 10,
        padding: "10px 14px",
        minHeight: 0,
        maxWidth: 1600,
        width: "100%",
        margin: "0 auto",
      }}
        className="main-grid"
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <aside className="left-panel panel-glass" style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <NodeListPanel onSelectNode={handleNodeSelect} />
          </div>
        </aside>

        {/* ── CENTER ─────────────────────────────────────────────────── */}
        <main style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "auto" }}>
          {/* KPI Row */}
          <KPICards />

          {/* Map */}
          <div className="panel-glass" style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", padding: 14 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>
              THAILAND MARINE SENSOR NETWORK — REAL-TIME
            </div>
            <div style={{ flex: 1, position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
              <CoralReefMap 
                region="All Regions" 
                selectedNode={selectedNode}
                onNodeSelect={handleNodeSelect}
                onNodeClose={() => { setSelectedNode(null); setShowSpectralGraph(false); }}
              />
            </div>
          </div>

          {/* Spectral Graph Overlay */}
          {showSpectralGraph && selectedNode && (
            <div style={{ background: "rgba(8, 16, 30, 0.98)", padding: 14, borderRadius: 8, color: "#fff", position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", border: "1px solid rgb(74, 96, 128)", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", color: "#60a5fa" }}>
                    REAL-TIME SPECTRAL
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                    <span style={{ fontWeight: 700 }}>Node {selectedNode.id}</span> — {selectedNode.name} ({selectedNode.location}) · <span className="font-mono" style={{ fontSize: 11, color: "var(--cyan)" }}>[{selectedNode.lat.toFixed(6)}, {selectedNode.lng.toFixed(6)}]</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "right", paddingRight: 16, borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em", marginBottom: 2 }}>AI ASSESSMENT</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: selectedNode.status?.includes("ระดับ 4") ? "#f43f5e" : selectedNode.status?.includes("ระดับ 3") ? "#f97316" : selectedNode.status?.includes("ระดับ 2") ? "#eab308" : selectedNode.status?.includes("ระดับ 1") ? "#0ea5e9" : "#10b981" }}>
                      {selectedNode.status?.toUpperCase() || "UNKNOWN"} <span style={{ opacity: 0.9, fontSize: 11, marginLeft: 4, color: "#fff" }}>{Math.max(...(Object.values(selectedNode.predictions || {a: 0}) as number[]))}% CONF</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSpectralGraph(false)}
                    style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 10, color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>
                <span><span style={{ color: "#3b82f6" }}>—</span> 610nm (Healthy: 2.58)</span>
                <span><span style={{ color: "#10b981" }}>—</span> 680nm (Healthy: 23.03)</span>
                <span><span style={{ color: "#f97316" }}>—</span> 730nm (Healthy: 310.4)</span>
                <span><span style={{ color: "#f43f5e" }}>—</span> 760nm (Healthy: 180.5)</span>
                <span><span style={{ color: "#a855f7" }}>—</span> 810nm (Healthy: 9.12)</span>
                <span><span style={{ color: "#0ea5e9" }}>—</span> 860nm (Healthy: 3.64)</span>
              </div>
              
              <NodeSpectralRealtimeChart node={selectedNode} />
            </div>
          )}

          {/* Bottom charts grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ChartCard title="OVERALL CORAL HEALTH TREND">
              <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>
                <span><span style={{ color: "var(--cyan)" }}>—</span> Overall Health Score</span>
              </div>
              <CoralHealthTrendChart />
            </ChartCard>

            <ChartCard title="THREAT TREND BREAKDOWN">
              <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>
                <span><span style={{ color: "var(--orange)" }}>—</span> Sediment</span>
                <span><span style={{ color: "var(--purple)" }}>—</span> Chemical</span>
                <span><span style={{ color: "var(--yellow)" }}>—</span> Bleaching</span>
                <span><span style={{ color: "var(--cyan)" }}>—</span> Hypoxia</span>
                <span><span style={{ color: "var(--red)" }}>—</span> Oil Spill</span>
              </div>
              <ThreatTrendChart />
            </ChartCard>
          </div>
        </main>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <aside className="right-panel" style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "auto" }}>
          {/* AI Prediction */}
          <AIPredictionPanel selectedNode={selectedNode} />

          {/* Coral Health Gauge */}
          <div className="panel-glass" style={{ padding: 14 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>AVG ECOSYSTEM HEALTH</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CoralHealthGauge
                value={parseFloat(String(avgHealth).replace(/[^0-9.]/g, "")) || 62}
                max={100}
                label="Ecosystem Health Score"
                size={150}
              />
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8
            }}>
              {[
                { label: "Healthy", value: nodes.filter(n => n.status?.includes("ปกติ")).length, color: "var(--green)" },
                { label: "Warning/Low", value: nodes.filter(n => n.status?.includes("ระดับ 1") || n.status?.includes("ระดับ 2")).length, color: "var(--yellow)" },
                { label: "High Risk", value: nodes.filter(n => n.status?.includes("ระดับ 3")).length, color: "var(--orange)" },
                { label: "Critical", value: nodes.filter(n => n.status?.includes("ระดับ 4")).length, color: "var(--red)" },
              ].map(item => (
                <div key={item.label} className="panel-raised" style={{ padding: "6px 8px", textAlign: "center" }}>
                  <div className="font-mono" style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Coral Status Pie Chart */}
          <ChartCard title="REEF STATUS DISTRIBUTION">
            <CoralStatusPieChart />
          </ChartCard>
        </aside>
      </div>
      
      {/* ── SYSTEM NOTIFICATIONS (Fixed Overlay / Top Layer) ─────────── */}
      <div 
        ref={panelRef}
        style={{
        position: "fixed", bottom: 20, right: 20, width: 420, 
        maxHeight: isLogsOpen ? 350 : 42,
        zIndex: 9999, borderRadius: 8, overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        border: "1px solid var(--border)",
        background: "var(--bg-surface)",
        display: "flex", flexDirection: "column",
        transition: isDragging ? "none" : "max-height 0.3s ease-in-out, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}>
        <div 
          onMouseDown={handleMouseDown}
          onClick={handleHeaderClick}
          style={{ 
            padding: "10px 16px", background: "var(--bg-raised)", 
            cursor: isDragging ? "grabbing" : "grab", display: "flex", justifyContent: "space-between", 
            alignItems: "center", borderBottom: isLogsOpen ? "1px solid var(--border)" : "none" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ opacity: 0.5 }}>
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.1em" }}>
              SYSTEM NOTIFICATIONS {nodes.filter(n => n.status?.includes("ระดับ 4")).length > 0 && <span style={{ color: "var(--red)", marginLeft: 8 }}>● ALERT</span>}
            </div>
          </div>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{isLogsOpen ? "COLLAPSE ▼" : "EXPAND ▲"}</span>
        </div>
        {isLogsOpen && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <AlertPanel />
          </div>
        )}
      </div>
    </div>
  );
}
