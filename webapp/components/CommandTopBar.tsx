"use client";
import { useEffect, useState } from "react";
import { useWebSocketData } from "./WebSocketProvider";

export default function CommandTopBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const { data, isConnected } = useWebSocketData();
  const wsStatus = isConnected || data?.dashboard?.systemStatus?.ws_status === "live";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const lastUpdate = data?.dashboard?.systemStatus?.last_update;
  const lastUpdateStr = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  const activeNodes = data?.dashboard?.systemStatus?.active_nodes ?? "—";
  const totalNodes = data?.dashboard?.systemStatus?.total_nodes ?? "—";

  return (
    <header
      style={{
        background: "rgba(5,11,20,0.97)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 20px", height: 56, overflow: "hidden" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 24, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden"
          }}>
            <img 
              src="/picture/Logo coral blue matrix.png" 
              alt="Coral blumatriix Logo" 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ 
              fontSize: 16, 
              fontWeight: 800, 
              color: "#ffffff", 
              textShadow: "0 0 12px rgba(0,212,255,0.6)", 
              letterSpacing: "0.05em", 
              lineHeight: 1.2 
            }}>
              Coral blumatriix
            </div>
            <div style={{ 
              fontSize: 10, 
              fontWeight: 600,
              color: "var(--cyan)", 
              letterSpacing: "0.12em", 
              opacity: 0.9, 
              lineHeight: 1.1,
              marginTop: 1
            }}>
              Monitoring Dashboard
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: "flex", gap: 2, flex: 1, overflow: "hidden" }}>
          {[
            { label: "OVERVIEW", active: true },
            { label: "NODE MAP", active: false },
            { label: "ANALYTICS", active: false },
            { label: "AI PREDICT", active: false },
            { label: "REPORTS", active: false },
          ].map((item) => (
            <button
              key={item.label}
              style={{
                padding: "6px 14px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                borderRadius: 6,
                border: item.active ? "1px solid rgba(0,212,255,0.4)" : "1px solid transparent",
                background: item.active ? "rgba(0,212,255,0.1)" : "transparent",
                color: item.active ? "var(--cyan)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side info */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          
          {/* Nodes */}
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 10, color: "#FFFFFF", letterSpacing: "0.1em", opacity: 0.7 }}>NODES ONLINE</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }} className="font-mono">
              {activeNodes}<span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>/{totalNodes}</span>
            </span>
          </div>

          <div style={{ width: 1, height: 32, background: "var(--border)" }} />

          {/* Last update */}
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 10, color: "#FFFFFF", letterSpacing: "0.1em", opacity: 0.7 }}>LAST SYNC</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFF" }} className="font-mono">{lastUpdateStr}</span>
          </div>

          <div style={{ width: 1, height: 32, background: "var(--border)" }} />

          {/* WS Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className={wsStatus ? "animate-pulse-dot" : ""} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: wsStatus ? "var(--green)" : "#4a6080",
              boxShadow: wsStatus ? "0 0 8px rgba(0,255,136,0.8)" : "none",
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.1em" }}>
              {wsStatus ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          <div style={{ width: 1, height: 32, background: "var(--border)" }} />

          {/* Clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.08em" }} className="font-mono">{time}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{date}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
