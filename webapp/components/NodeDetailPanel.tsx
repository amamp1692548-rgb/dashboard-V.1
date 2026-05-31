"use client";

import { useState } from "react";

const STATUS_COLOR: Record<string, string> = {
  Healthy: "#00ff88",
  Stress: "#ff7c2a",
  Warning: "#ffcc00",
  Critical: "#ff3366",
  Offline: "#4a6080",
};

function ParamRow({ label, value, unit = "", color }: { label: string; value: any; unit?: string; color?: string }) {
  if (value === null || value === undefined) return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>—</span>
    </div>
  );
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: color || "#FFFFFF" }}>
        {value}{unit}
      </span>
    </div>
  );
}

export default function NodeDetailPanel({ 
  node, 
  onClose,
  isStreamOpen,
  setIsStreamOpen
}: { 
  node: any; 
  onClose: () => void;
  isStreamOpen: boolean;
  setIsStreamOpen: (val: boolean) => void;
}) {
  if (!node) return null;
  const statusColor = STATUS_COLOR[node.status] || "#4a6080";
  const isOffline = node.status === "Offline";

  return (
    <div className="animate-slide-right" style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 280,
      background: "rgba(8,16,30,0.98)", border: "1px solid var(--border-bright)",
      borderLeft: `2px solid ${statusColor}`, zIndex: 1000, overflowY: "auto",
      padding: 16, display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", marginBottom: 4 }} className="font-mono">{node.node_id}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "baseline", gap: 6 }}>
            Node {node.id} 
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{node.name}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{node.location}</div>
          <div style={{ fontSize: 10, color: "var(--cyan)", marginTop: 4 }} className="font-mono">
            Lat: {node.lat.toFixed(6)}, Lng: {node.lng.toFixed(6)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* Camera Circle Button */}
          <button 
            onClick={() => setIsStreamOpen(true)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = "#FFFFFF";
              e.currentTarget.style.boxShadow = "0 0 8px rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="ดูกล้องสตรีมสด (LIVE CAMERA)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>

          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF",
            width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>
      </div>

      {/* Status & Health score grid */}
      <div style={{ display: "grid", gridTemplateColumns: (!isOffline && node.health_score !== null) ? "1fr 1fr" : "1fr", gap: 6 }}>
        <div style={{
          padding: "8px 10px", borderRadius: 8, background: statusColor + "18",
          border: `1px solid ${statusColor}44`, display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ 
                fontSize: 8, fontWeight: 900, color: "#FFFFFF", 
                background: statusColor, padding: "1px 4px", borderRadius: 3,
                letterSpacing: "0.05em"
              }}>AI</span>
              <span style={{ fontSize: 9, color: statusColor, fontWeight: 700, letterSpacing: "0.05em" }}>STATUS</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, letterSpacing: "0.05em" }}>
              {node.status.toUpperCase()}
            </span>
          </div>
        </div>

        {!isOffline && node.health_score !== null && (
          <div style={{
            padding: "8px 10px", borderRadius: 8,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 8, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600, letterSpacing: "0.08em" }}>HEALTH</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF" }} className="font-mono">
                {node.health_score}<span style={{ fontSize: 10, fontWeight: 400, color: "rgba(255, 255, 255, 0.5)" }}>/100</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Confidence Breakdown */}
      {!isOffline && node.predictions && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>AI CONFIDENCE BREAKDOWN</div>
          {Object.entries(node.predictions).map(([key, val]: [string, any]) => {
            const labelMap: Record<string, string> = {
              normal: "ปกติ (Healthy)",
              bleaching: "ฟอกขาว (Bleaching)",
              sedimentation: "ตะกอนทับถม",
              chemical: "ปนเปื้อนสารเคมี"
            };
            const barColor = key === 'normal' ? "#00ff88" : (val > 50 ? "#ff3366" : "#ffcc00");
            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{labelMap[key] || key}</span>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}%</span>
                </div>
                <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 1.5, overflow: "hidden" }}>
                  <div style={{ width: `${val}%`, height: "100%", background: barColor, transition: "width 1s ease-out" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coral Status */}
      {!isOffline && (
        <>
          <div>
            <div className="section-label" style={{ marginBottom: 8, color: "var(--cyan)" }}>CORAL STATUS</div>
            <ParamRow label="Bleaching Probability" value={node.bleaching_probability} unit="%" color={node.bleaching_probability > 60 ? "#ff3366" : node.bleaching_probability > 30 ? "#ff7c2a" : "#00ff88"} />
            <ParamRow label="Stress Level" value={node.stress_level} unit="%" color={node.stress_level > 70 ? "#ff3366" : "#ffcc00"} />
            <ParamRow label="Color Degradation Index" value={node.color_degradation_index} color="var(--cyan)" />
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 8, color: "var(--cyan)" }}>WATER PARAMETERS</div>
            <ParamRow label="Temperature" value={node.temperature} unit="°C" color={node.temperature > 31 ? "#ff3366" : node.temperature > 29 ? "#ff7c2a" : "#00d4ff"} />
            <ParamRow label="Turbidity" value={node.turbidity} unit=" NTU" color={node.turbidity > 6 ? "#ff3366" : "#00d4ff"} />
            <ParamRow label="Salinity" value={node.salinity} unit=" ppt" />
            <ParamRow label="pH" value={node.ph} color={node.ph < 7.9 ? "#ff7c2a" : "#00ff88"} />
            <ParamRow label="Dissolved O₂" value={node.dissolved_oxygen} unit=" mg/L" color={node.dissolved_oxygen < 5.5 ? "#ff3366" : "#00ff88"} />
          </div>
        </>
      )}

      {/* System Status */}
      <div>
        <div className="section-label" style={{ marginBottom: 8, color: "var(--cyan)" }}>SYSTEM STATUS</div>
        <ParamRow label="Battery" value={node.battery} unit="%" color={node.battery < 20 ? "#ff3366" : node.battery < 40 ? "#ffcc00" : "#00ff88"} />
        <ParamRow label="Signal Strength" value={node.signal} unit="%" color={node.signal < 40 ? "#ff3366" : "#00d4ff"} />
        <ParamRow label="Last Sync" value={node.last_sync} />
        <ParamRow label="Depth" value={node.depth} unit=" m" />
      </div>
    </div>
  );
}
