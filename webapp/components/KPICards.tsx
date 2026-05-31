"use client";
import { useWebSocketData } from "./WebSocketProvider";

export default function KPICards() {
  const { data } = useWebSocketData();
  const kpiData: any[] = data?.dashboard?.kpi || [];

  if (kpiData.length === 0) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 90, background: "var(--bg-surface)", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 10,
      marginBottom: 12,
    }}>
      {kpiData.map((kpi, i) => {
        const isPositive = kpi.positive;
        const accentColor = kpi.color || "var(--cyan)";
        return (
          <div
            key={kpi.id || i}
            className="panel-glass animate-fade-in-up"
            style={{ padding: "12px 14px", animationDelay: `${i * 0.05}s`, borderTop: `2px solid ${accentColor}44` }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="section-label">
                {kpi.title}
              </span>
            </div>

            <div className="font-mono" style={{
              fontSize: 22, fontWeight: 800,
              color: accentColor,
              lineHeight: 1.1, marginBottom: 4
            }}>
              {kpi.value}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>{kpi.sub}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: isPositive ? "var(--green)" : "var(--red)",
                background: isPositive ? "var(--green-dim)" : "var(--red-dim)",
                padding: "1px 5px", borderRadius: 3,
              }} className="font-mono">
                {kpi.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
