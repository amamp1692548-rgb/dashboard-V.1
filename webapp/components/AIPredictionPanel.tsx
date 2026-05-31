"use client";
import React, { useState, useEffect } from "react";
import { useWebSocketData } from "./WebSocketProvider";

const ISLANDS = [
  { name: "หมู่เกาะสุรินทร์", keys: ["สุรินทร์"] },
  { name: "หมู่เกาะสิมิลัน", keys: ["สิมิลัน"] },
  { name: "เกาะราชาใหญ่ / เกาะราชาน้อย", keys: ["ราชา"] },
  { name: "เกาะหลีเป๊ะ", keys: ["หลีเป๊ะ"] },
  { name: "เกาะรอก", keys: ["รอก"] },
  { name: "เกาะกระดาน", keys: ["กระดาน"] },
  { name: "เกาะเต่า / เกาะนางยวน", keys: ["เต่า", "นางยวน"] },
  { name: "เกาะร้านเป็ด / เกาะร้านไก่", keys: ["ร้านเป็ด", "ร้านไก่"] },
  { name: "เกาะขาม / เกาะแสมสาร", keys: ["ขาม", "แสมสาร"] }
];

function ScientificMetric({ label, value, unit, iconColor }: { label: string; value: string; unit: string; iconColor: string }) {
  return (
    <div className="panel-raised" style={{ padding: "8px 10px", borderRadius: 6, display: "flex", flexDirection: "column", gap: 2, background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.03em" }}>{label.toUpperCase()}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
        <span className="font-mono" style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{value}</span>
        <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>{unit}</span>
      </div>
    </div>
  );
}

function ImpactRow({ label, count, percentage, color, bg }: { label: string; count: number; percentage: number; color: string; bg: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{label}</span>
        </div>
        <span className="font-mono" style={{ color: "var(--text-secondary)", fontSize: 10 }}>
          {percentage}% <span style={{ color: "var(--text-muted)", fontSize: 9 }}>({count} nodes)</span>
        </span>
      </div>
      <div style={{ height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function AIPredictionPanel({ selectedNode }: { selectedNode?: any }) {
  const { data } = useWebSocketData();
  const [selectedIsland, setSelectedIsland] = useState<string>("All Islands");

  const nodes = data?.dashboard?.mapData || [];

  const findIslandName = (nodeName: string) => {
    const match = ISLANDS.find(isl => isl.keys.some(k => nodeName.includes(k)));
    return match ? match.name : "Other Zones";
  };

  // Sync selectedIsland when a node is clicked from the map or sidebar list
  useEffect(() => {
    if (selectedNode) {
      const island = findIslandName(selectedNode.name);
      setSelectedIsland(island);
    }
  }, [selectedNode]);

  // Filter nodes based on selected island
  const filteredNodes = selectedIsland === "All Islands"
    ? nodes
    : nodes.filter((n: any) => {
        const islandName = findIslandName(n.name);
        return islandName === selectedIsland;
      });

  const totalCount = filteredNodes.length;

  // Calculate averages safely
  const avgHealth = totalCount
    ? (filteredNodes.reduce((acc: number, n: any) => acc + (n.health_score || 0), 0) / totalCount)
    : 0;
  const avgTemp = totalCount
    ? (filteredNodes.reduce((acc: number, n: any) => acc + (n.temperature || 0), 0) / totalCount)
    : 0;
  const avgTurbidity = totalCount
    ? (filteredNodes.reduce((acc: number, n: any) => acc + (n.turbidity || 0), 0) / totalCount)
    : 0;
  const avgSalinity = totalCount
    ? (filteredNodes.reduce((acc: number, n: any) => acc + (n.salinity || 0), 0) / totalCount)
    : 0;

  // Calculate Threat Distribution
  const healthyCount = filteredNodes.filter((n: any) => n.status?.includes("ปกติ") || n.status?.includes("Healthy")).length;
  const bleachingCount = filteredNodes.filter((n: any) => n.status?.includes("ฟอกขาว") || n.status?.includes("Bleaching")).length;
  const sedimentCount = filteredNodes.filter((n: any) => n.status?.includes("ตะกอน") || n.status?.includes("Sediment")).length;
  const otherCount = totalCount - (healthyCount + bleachingCount + sedimentCount);

  const healthyPct = totalCount ? Math.round((healthyCount / totalCount) * 100) : 0;
  const bleachingPct = totalCount ? Math.round((bleachingCount / totalCount) * 100) : 0;
  const sedimentPct = totalCount ? Math.round((sedimentCount / totalCount) * 100) : 0;
  const otherPct = totalCount ? Math.round((otherCount / totalCount) * 100) : 0;

  // Determine Overall Health State Color
  const healthColor = avgHealth >= 80 ? "var(--green)" : avgHealth >= 65 ? "var(--yellow)" : "var(--red)";
  const healthBg = avgHealth >= 80 ? "var(--green-dim)" : avgHealth >= 65 ? "var(--yellow-dim)" : "var(--red-dim)";

  return (
    <div className="panel-glass animate-fade-in-up" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        <span className="section-label" style={{ color: "var(--cyan)", fontWeight: 800 }}>SCIENTIFIC REEF INTEGRITY REPORT</span>
        
        {/* Island Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>SELECT TARGET:</span>
          <select 
            value={selectedIsland} 
            onChange={(e) => setSelectedIsland(e.target.value)}
            style={{
              flex: 1,
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="All Islands">All Monitored Islands (Thailand)</option>
            {ISLANDS.map((isl) => (
              <option key={isl.name} value={isl.name}>{isl.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Island Overall Status */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="font-mono" style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
            {selectedIsland === "All Islands" ? "OVERALL SYSTEM SUMMARY" : selectedIsland.toUpperCase()}
          </span>
          <span className="font-mono" style={{ fontSize: 9, color: "var(--text-muted)" }}>
            {totalCount} active nodes
          </span>
        </div>
        
        {/* Coral health average block */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: healthBg,
          border: `1px solid ${healthColor}40`,
          borderRadius: 6,
          marginTop: 2
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, color: "var(--text-secondary)", fontWeight: 700 }}>CORAL REEF INTEGRITY</span>
            <span style={{ fontSize: 11, color: healthColor, fontWeight: 800 }}>
              {avgHealth >= 80 ? "EXCELLENT / STABLE" : avgHealth >= 65 ? "WARNING / STRESSED" : "CRITICAL RISKSTATE"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span className="font-mono" style={{ fontSize: 22, fontWeight: 900, color: healthColor }}>
              {avgHealth.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: healthColor, fontWeight: 700 }}>%</span>
          </div>
        </div>
      </div>

      {/* 3-Column water metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <ScientificMetric label="Water Temp" value={`${avgTemp.toFixed(1)}`} unit="°C" iconColor="var(--orange)" />
        <ScientificMetric label="Turbidity" value={`${avgTurbidity.toFixed(1)}`} unit="NTU" iconColor="var(--yellow)" />
        <ScientificMetric label="Salinity" value={`${avgSalinity.toFixed(1)}`} unit="ppt" iconColor="var(--cyan)" />
      </div>

      {/* Dynamic Sensor Threat Distribution */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
        <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.05em", fontWeight: 700 }}>SENSOR NODE IMPACT DISTRIBUTION</span>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ImpactRow label="ปกติ (Healthy)" count={healthyCount} percentage={healthyPct} color="var(--green)" bg="var(--green-dim)" />
          <ImpactRow label="ฟอกขาว (Bleaching)" count={bleachingCount} percentage={bleachingPct} color="var(--red)" bg="var(--red-dim)" />
          <ImpactRow label="ตะกอนทับถม (Sediment)" count={sedimentCount} percentage={sedimentPct} color="var(--orange)" bg="var(--orange-dim)" />
          {otherPct > 0 && (
            <ImpactRow label="อื่น ๆ (Chemical/Oil)" count={otherCount} percentage={otherPct} color="var(--purple)" bg="rgba(168,85,247,0.08)" />
          )}
        </div>
      </div>
    </div>
  );
}
