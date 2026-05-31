"use client";

interface GaugeProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export default function CoralHealthGauge({
  value, max = 100, label = "Coral Health Score",
  sublabel, color, size = 140
}: GaugeProps) {
  const pct = Math.min(Math.max(value / max, 0), 1);

  // Arc params
  const cx = size / 2, cy = size / 2 + 10;
  const r = (size / 2) - 18;
  const startAngle = -210;
  const sweep = 240;
  const endAngle = startAngle + sweep * pct;

  const toXY = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (from: number, to: number) => {
    const s = toXY(from), e = toXY(to);
    const large = (to - from) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const autoColor = value >= 70 ? "var(--green)" : value >= 40 ? "var(--yellow)" : "var(--red)";
  const activeColor = color || autoColor;
  const label2 = sublabel || (value >= 70 ? "STABLE" : value >= 40 ? "STRESSED" : "CRITICAL");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size * 0.85} style={{ overflow: "visible" }}>
        <defs>
          <filter id="glow-gauge">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path d={arcPath(startAngle, startAngle + sweep)} fill="none"
          stroke="var(--border)" strokeWidth={8} strokeLinecap="round" />
        {/* Fill */}
        {pct > 0 && (
          <path d={arcPath(startAngle, endAngle)} fill="none"
            stroke={activeColor} strokeWidth={8} strokeLinecap="round" />
        )}
        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = startAngle + sweep * t;
          const inner = toXY(a), outer = { x: cx + (r + 10) * Math.cos(a * Math.PI / 180), y: cy + (r + 10) * Math.sin(a * Math.PI / 180) };
          return <line key={t} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="var(--border-bright)" strokeWidth={1.5} />;
        })}
        {/* Value text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={activeColor}
          fontSize={size * 0.2} fontWeight={800} fontFamily="JetBrains Mono, monospace">
          {Math.round(value)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={9} letterSpacing="0.1em">
          / {max}
        </text>
        {/* Status label */}
        <text x={cx} y={cy + 30} textAnchor="middle" fill={activeColor} fontSize={10}
          fontWeight={700} letterSpacing="0.15em">
          {label2}
        </text>
      </svg>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}
