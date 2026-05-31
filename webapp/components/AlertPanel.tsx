"use client";
import { useState } from "react";
import { useWebSocketData } from "./WebSocketProvider";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  critical: { color: "var(--red)", bg: "var(--red-dim)", icon: "", label: "CRITICAL" },
  warning:  { color: "var(--orange)", bg: "var(--orange-dim)", icon: "", label: "WARNING" },
  caution:  { color: "var(--yellow)", bg: "var(--yellow-dim)", icon: "", label: "CAUTION" },
  offline:  { color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "", label: "OFFLINE" },
};

export default function AlertPanel() {
  const { data } = useWebSocketData();
  const alerts: any[] = data?.dashboard?.alerts || [];
  
  const [clearedIds, setClearedIds] = useState<Set<number>>(new Set());

  const activeAlerts = alerts.filter(a => !clearedIds.has(a.id));

  const handleReset = () => {
    const newCleared = new Set(clearedIds);
    alerts.forEach(a => newCleared.add(a.id));
    setClearedIds(newCleared);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-deep)" }}>
      {/* Terminal Header */}
      <div style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.1em" }}>SYSTEM LOGS</div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--red)" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--yellow)" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green)" }} />
          </div>
        </div>
        <button 
          onClick={handleReset}
          style={{ 
            fontSize: 9, fontWeight: 700, color: "var(--cyan)", background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.3)", padding: "4px 12px", borderRadius: 4, cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,212,255,0.1)"}
        >
          RESET LOGS
        </button>
      </div>

      {/* Logs Area */}
      <div className="font-mono" style={{ padding: "12px 16px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {activeAlerts.length === 0 ? (
          <div className="animate-fade-in-up" style={{ color: "var(--text-muted)", fontSize: 12 }}>
            {">"} System is running normally. No active alerts.
          </div>
        ) : (
          activeAlerts.map((alert, i) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.caution;
            return (
              <div key={alert.id} className="animate-fade-in-up" style={{ fontSize: 12, display: "flex", gap: 10, color: "var(--text-primary)", animationDelay: `${i * 0.05}s` }}>
                <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>[{alert.time}]</span>
                <span style={{ color: cfg.color, fontWeight: 700, minWidth: 80 }}>[{cfg.label}]</span>
                <span style={{ flex: 1 }}>{alert.message}</span>
                <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>— {alert.location}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
