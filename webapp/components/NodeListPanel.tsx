"use client";
import { useState, useEffect } from "react";
import { useWebSocketData } from "./WebSocketProvider";

const getStatusColor = (status: string): string => {
  if (!status) return "#64748b";
  if (status.includes("ระดับ 4")) return "var(--red)";
  if (status.includes("ระดับ 3")) return "var(--orange)";
  if (status.includes("ระดับ 2")) return "var(--yellow)";
  if (status.includes("ระดับ 1")) return "var(--cyan)";
  if (status.includes("ปกติ") || status.includes("Healthy")) return "var(--green)";
  return "#64748b"; // Offline or Unknown
};

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ width: "100%", height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

function MiniSpectralChart({ nodeId, data }: { nodeId: number; data: any[] }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.value));
  const isNode1 = nodeId === 1;
  return (
    <div id={isNode1 ? "node-1-raw" : undefined} style={{ margin: "8px 0", padding: "6px", background: "var(--bg-surface)", borderRadius: 4, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 4, opacity: 0.7 }}>
        SPECTRAL SENSOR (RAW DATA)
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 30 }}>
        {data.map(d => {
          const heightPct = max > 0 ? (d.value / max) * 100 : 0;
          return (
            <div key={d.band} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div 
                style={{ 
                  width: "100%", 
                  background: d.band === "680nm" ? "var(--red)" : "var(--cyan)", 
                  height: `${Math.max(heightPct, 2)}%`, 
                  borderRadius: "2px 2px 0 0", 
                  opacity: 0.8 
                }} 
                title={`${d.band}: ${d.value}`} 
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 4, fontSize: 10, color: "var(--text-primary)", justifyContent: "space-between" }}>
        {data.map(d => (
          <span
            key={d.band}
            style={{ flex: 1, textAlign: "center", display: "block", fontSize: 10, color: "var(--text-primary)" }}
          >
            {d.value}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
        {data.map(d => (
          <div key={d.band} style={{ flex: 1, textAlign: "center", fontSize: 6, color: "var(--text-muted)", overflow: "hidden", textOverflow: "clip", whiteSpace: "nowrap" }}>
            {d.band.replace("nm", "")}
          </div>
        ))}
      </div>
    </div>
  );
}

const REGIONS = [
  {
    title: "ฝั่งอันดามันตอนเหนือ",
    islands: [
      { name: "หมู่เกาะสุรินทร์", keys: ["สุรินทร์"] },
      { name: "หมู่เกาะสิมิลัน", keys: ["สิมิลัน"] },
      { name: "เกาะราชาใหญ่ / เกาะราชาน้อย", keys: ["ราชา"] },
    ]
  },
  {
    title: "ฝั่งอันดามันตอนใต้",
    islands: [
      { name: "เกาะหลีเป๊ะ", keys: ["หลีเป๊ะ"] },
      { name: "เกาะรอก", keys: ["รอก", "ห้า"], limit: 16 },
      { name: "เกาะกระดาน", keys: ["กระดาน"], limit: 10 },
    ]
  },
  {
    title: "ฝั่งอ่าวไทย",
    islands: [
      { name: "เกาะเต่า / เกาะนางยวน", keys: ["เต่า", "นางยวน"], limit: 20 },
      { name: "เกาะร้านเป็ด / เกาะร้านไก่", keys: ["ร้านเป็ด", "ร้านไก่"], limit: 13 },
      { name: "เกาะขาม / เกาะแสมสาร", keys: ["ขาม", "แสมสาร"], limit: 25 },
    ]
  }
];

function DummyNodeCard({ islandName, index }: { islandName: string, index: number }) {
  return (
    <button
      onClick={() => alert(`Node ${index} at ${islandName} is currently NOT AVAILABLE`)}
      className="panel-raised"
      style={{
        padding: "8px 12px",
        border: `1px dashed var(--border)`,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        background: "var(--bg-raised)",
        color: "var(--text-muted)",
        opacity: 0.7
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border-bright)" }} />
        <span style={{ fontSize: 10, fontWeight: 600, flex: 1 }}>
          Node {index}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#4a6080", letterSpacing: "0.08em" }}>
          UNAVAILABLE
        </span>
      </div>
    </button>
  );
}

function NodeCard({ node, onSelectNode }: { node: any, onSelectNode?: (node: any) => void }) {
  const statusColor = getStatusColor(node.status);
  const isOffline = node.status === "Offline" || !node.status;
  const isCritical = node.status?.includes("ระดับ 4");
  
  return (
    <button
      key={node.id}
      onClick={() => onSelectNode?.(node)}
      className="panel-raised animate-fade-in-up"
      style={{
        padding: "10px 12px",
        border: `1px solid var(--border)`,
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.2s",
        width: "100%",
        background: "transparent",
        color: "inherit",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = statusColor + "88")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            id={`node-${node.id}-dot`}
            style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: statusColor,
              animation: isCritical ? "blink-red 1.5s infinite" : undefined,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Node {node.id} <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 500 }}>({node.name})</span>
          </span>
        </div>
        <div>
          <span
            id={`node-${node.id}-status`}
            style={{ fontSize: 9, fontWeight: 800, color: statusColor, letterSpacing: "0.08em", opacity: 0.9 }}
          >
            AI PREDICT: {node.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 6 }} className="font-mono">
        {node.node_id} · {node.location} · {node.lat.toFixed(6)}, {node.lng.toFixed(6)}
      </div>

      {(node.health_score !== null || isOffline) && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--text-muted)", marginBottom: 2 }}>
            <span>Health</span>
            <span className="font-mono" style={{ color: statusColor }}>{isOffline ? 0 : node.health_score}</span>
          </div>
          <MiniBar value={isOffline ? 0 : node.health_score} color={statusColor} />
        </div>
      )}

      {node.predictions && !isOffline && (
        <div style={{ margin: "8px 0", padding: "6px", background: "var(--bg-surface)", borderRadius: 4, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 4, opacity: 0.7 }}>
            AI PREDICTION PROBABILITY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 8, width: 45, color: "var(--text-muted)" }}>Bleaching</span>
              <div style={{ flex: 1 }}><MiniBar value={node.predictions.bleaching} color="var(--yellow)" /></div>
              <span style={{ fontSize: 8, width: 20, textAlign: "right" }}>{node.predictions.bleaching}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 8, width: 45, color: "var(--text-muted)" }}>Sediment</span>
              <div style={{ flex: 1 }}><MiniBar value={node.predictions.sedimentation} color="var(--orange)" /></div>
              <span style={{ fontSize: 8, width: 20, textAlign: "right" }}>{node.predictions.sedimentation}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 8, width: 45, color: "var(--text-muted)" }}>Chemical</span>
              <div style={{ flex: 1 }}><MiniBar value={node.predictions.chemical} color="var(--red)" /></div>
              <span style={{ fontSize: 8, width: 20, textAlign: "right" }}>{node.predictions.chemical}%</span>
            </div>
          </div>
        </div>
      )}

      {!isOffline && node.id === 1 && node.spectral_raw && (
        <MiniSpectralChart nodeId={node.id} data={node.spectral_raw} />
      )}

      <div style={{ display: "flex", gap: 12, fontSize: 9, color: "var(--text-muted)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span>BAT {node.battery}%</span>
          <MiniBar value={node.battery < 0 ? 0 : node.battery} color={node.battery < 20 ? "var(--red)" : "var(--cyan)"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span>SIG {node.signal}%</span>
          <MiniBar value={node.signal < 0 ? 0 : node.signal} color="var(--cyan)" />
        </div>
        <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono, monospace" }}>SYNC {node.last_sync}</span>
      </div>
    </button>
  );
}

export default function NodeListPanel({ onSelectNode }: { onSelectNode?: (node: any) => void }) {
  const { data } = useWebSocketData();
  const nodes: any[] = data?.dashboard?.mapData || [];
  
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    "ฝั่งอันดามันตอนเหนือ": true // Default open one for demo
  });
  const [expandedIslands, setExpandedIslands] = useState<Record<string, boolean>>({});

  // Auto-expand the island that contains Node 1 so its NodeCard is always rendered
  useEffect(() => {
    if (!nodes || !nodes.length) return;
    const next: Record<string, boolean> = { ...expandedIslands };
    for (const region of REGIONS) {
      for (const island of region.islands) {
        const islandNodes = nodes.filter(n => (island as any).keys.some((k: string) => n.name.includes(k)));
        if (islandNodes.some(n => n.id === 1)) {
          next[island.name] = true;
        }
      }
    }
    setExpandedIslands(p => ({ ...next, ...p }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const toggleRegion = (title: string) => setExpandedRegions(p => ({ ...p, [title]: !p[title] }));
  const toggleIsland = (name: string) => setExpandedIslands(p => ({ ...p, [name]: !p[name] }));
  
  const mappedNodeIds = new Set();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ 
        padding: "20px 20px 16px", 
        borderBottom: "1px solid var(--border)", 
        background: "linear-gradient(to bottom, var(--bg-surface), var(--bg-deep))",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }}></span>
          NETWORK EXPLORER
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>
          Real-time Station Monitoring
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", flex: 1, paddingBottom: 24 }}>
        {REGIONS.map((region, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div 
              onClick={() => toggleRegion(region.title)}
              style={{ 
                fontSize: 11, fontWeight: 700, color: "#FFFFFF", 
                padding: "16px 20px 12px", cursor: "pointer", 
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid var(--border)",
                letterSpacing: "0.05em",
                background: "var(--cyan)"
              }}
            >
              <span>{region.title}</span>
              <span style={{ fontSize: 10 }}>{expandedRegions[region.title] ? "▼" : "▶"}</span>
            </div>
            
            {expandedRegions[region.title] && region.islands.map((island, iIdx) => {
              const islandNodes = nodes.filter(n => island.keys.some(k => n.name.includes(k)));
              islandNodes.forEach(n => mappedNodeIds.add(n.id));
              const activeCount = islandNodes.length;
              const isExpanded = expandedIslands[island.name];
              const limit = (island as any).limit || 25;

              return (
                <div key={iIdx} style={{ display: "flex", flexDirection: "column" }}>
                  <div 
                    onClick={() => toggleIsland(island.name)}
                    style={{ 
                      display: "flex", alignItems: "center", justifyContent: "space-between", 
                      cursor: "pointer", padding: "14px 20px",
                      background: isExpanded ? "var(--cyan-dim)" : "transparent",
                      borderLeft: isExpanded ? "3px solid var(--cyan)" : "3px solid transparent",
                      color: isExpanded ? "var(--text-primary)" : "var(--text-secondary)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isExpanded ? 1 : 0.7 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{island.name}</span>
                    </div>
                    <span style={{ fontSize: 11, opacity: 0.4 }}>{activeCount}/{limit}</span>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 20px", background: "var(--bg-raised)", borderBottom: "1px solid var(--border)" }}>
                      {(() => {
                        const activeIds = new Set(islandNodes.map(n => n.id));
                        const items = [...islandNodes.map(n => ({ type: 'active', id: n.id, data: n }))];
                        
                        let currentIdx = 1;
                        while (items.length < limit) {
                          if (!activeIds.has(currentIdx)) {
                            items.push({ type: 'dummy', id: currentIdx, data: null });
                          }
                          currentIdx++;
                        }
                        
                        items.sort((a, b) => a.id - b.id);
                        
                        return items.map(item => {
                          if (item.type === 'active') {
                            // For nodes other than 1, zero-out metrics and hide spectral raw data
                            const nodeData = { ...item.data };
                            if (nodeData.id !== 1) {
                              nodeData.health_score = 0;
                              nodeData.predictions = { bleaching: 0, sedimentation: 0, chemical: 0 };
                              nodeData.battery = 0;
                              nodeData.signal = 0;
                              nodeData.last_sync = "--";
                              nodeData.spectral_raw = [];
                            }
                            return <NodeCard key={`active-${item.id}`} node={nodeData} onSelectNode={onSelectNode} />;
                          } else {
                            return <DummyNodeCard key={`dummy-${item.id}`} islandName={island.name} index={item.id} />;
                          }
                        });
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Other Zones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 16 }}>
          <div 
            onClick={() => toggleRegion("Other Zones")}
            style={{ 
              fontSize: 11, fontWeight: 700, color: "#FFFFFF", 
              padding: "16px 20px 12px", cursor: "pointer", 
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid var(--border)",
              letterSpacing: "0.05em",
              background: "var(--orange)"
            }}
          >
            <span>พื้นที่อื่นๆ (Other Zones)</span>
            <span style={{ fontSize: 10 }}>{expandedRegions["Other Zones"] ? "▼" : "▶"}</span>
          </div>
          
          {expandedRegions["Other Zones"] && (
            <div style={{ 
              padding: "16px 20px", 
              textAlign: "center", 
              fontSize: 11, 
              color: "var(--text-muted)", 
              fontStyle: "italic",
              background: "var(--bg-raised)",
              borderBottom: "1px solid var(--border)"
            }}>
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
