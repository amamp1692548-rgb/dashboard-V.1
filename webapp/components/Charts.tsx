"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Legend,
} from "recharts";
import { useWebSocketData } from "./WebSocketProvider";

const CHART_STYLE = {
  background: "transparent",
  fontSize: 11,
  fontFamily: "Space Grotesk, sans-serif",
};

const GRID_PROPS = { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false };
const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 10 };
const AXIS_LINE = { axisLine: false, tickLine: false };
const TOOLTIP_STYLE = { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 11, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" };

// ── Coral Health Trend ──────────────────────────────────────────────────────
export function CoralHealthTrendChart() {
  const { data } = useWebSocketData();
  const chartData = data?.dashboard?.coralHealthTrend || [];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="time" tick={AXIS_TICK} {...AXIS_LINE} />
        <YAxis tick={AXIS_TICK} {...AXIS_LINE} domain={[0, 100]} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="health" name="Health Score" stroke="#00d4ff" strokeWidth={2} fill="url(#healthGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Threat Trend Breakdown ──────────────────────────────────────────────────
export function ThreatTrendChart() {
  const { data } = useWebSocketData();
  const chartData = data?.dashboard?.threatTrend || [];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="time" tick={AXIS_TICK} {...AXIS_LINE} />
        <YAxis tick={AXIS_TICK} {...AXIS_LINE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="sedimentation" stackId="1" name="Sedimentation" stroke="var(--orange)" fill="var(--orange)" fillOpacity={0.5} strokeWidth={1} />
        <Area type="monotone" dataKey="chemical" stackId="1" name="Chemical Stress" stroke="var(--purple)" fill="var(--purple)" fillOpacity={0.5} strokeWidth={1} />
        <Area type="monotone" dataKey="bleaching" stackId="1" name="Bleaching" stroke="var(--yellow)" fill="var(--yellow)" fillOpacity={0.5} strokeWidth={1} />
        <Area type="monotone" dataKey="hypoxia" stackId="1" name="Hypoxia" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.5} strokeWidth={1} />
        <Area type="monotone" dataKey="oil" stackId="1" name="Oil Spill" stroke="var(--red)" fill="var(--red)" fillOpacity={0.5} strokeWidth={1} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Temperature vs Health ───────────────────────────────────────────────────
export function TempVsHealthChart() {
  const { data } = useWebSocketData();
  const chartData = data?.dashboard?.temperatureVsHealth || [];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="time" tick={AXIS_TICK} {...AXIS_LINE} />
        <YAxis yAxisId="temp" orientation="right" tick={AXIS_TICK} {...AXIS_LINE} domain={[26, 35]} tickFormatter={v => `${v}°`} />
        <YAxis yAxisId="health" tick={AXIS_TICK} {...AXIS_LINE} domain={[0, 100]} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line yAxisId="health" type="monotone" dataKey="health" name="Health Score" stroke="#00d4ff" strokeWidth={2} dot={false} />
        <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature °C" stroke="#ff3366" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Turbidity Trend ─────────────────────────────────────────────────────────
export function TurbidityTrendChart() {
  const { data } = useWebSocketData();
  const chartData = data?.dashboard?.turbidityTrend || [];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="turbGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="time" tick={AXIS_TICK} {...AXIS_LINE} />
        <YAxis tick={AXIS_TICK} {...AXIS_LINE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#8b5cf6" strokeWidth={2} fill="url(#turbGrad)" dot={false} />
        <Line type="monotone" dataKey="threshold" name="Threshold" stroke="#ff7c2a" strokeWidth={1} strokeDasharray="6 3" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Spectral Signature ──────────────────────────────────────────────────────
export function SpectralSignatureChart() {
  const { data } = useWebSocketData();
  const chartData: any[] = data?.dashboard?.spectralSignature || [];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barSize={24}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="band" tick={AXIS_TICK} {...AXIS_LINE} />
        <YAxis tick={AXIS_TICK} {...AXIS_LINE} domain={[0, 1]} tickFormatter={v => v.toFixed(1)} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v.toFixed(3), "Reflectance"]} />
        <Bar dataKey="reflectance" name="Reflectance" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Node Spectral Realtime Chart ────────────────────────────────────────────
export function NodeSpectralRealtimeChart({ node }: { node: any }) {
  const chartData = node?.spectral_history || [];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="time" tick={AXIS_TICK} {...AXIS_LINE} />
        <YAxis tick={AXIS_TICK} {...AXIS_LINE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line type="monotone" dataKey="610nm" name="610nm" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="680nm" name="680nm" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="730nm" name="730nm" stroke="#f97316" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="760nm" name="760nm" stroke="#f43f5e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="810nm" name="810nm" stroke="#a855f7" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="860nm" name="860nm" stroke="#0ea5e9" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Environment Stress Radar ────────────────────────────────────────────────
export function EnvStressRadarChart() {
  const { data } = useWebSocketData();
  const chartData: any[] = data?.dashboard?.envStressRadar || [];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={chartData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="axis" tick={{ fill: "#4a6080", fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#4a6080", fontSize: 9 }} />
        <Radar name="Stress Level" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Status Pie Chart ────────────────────────────────────────────────────────
export function CoralStatusPieChart() {
  const { data } = useWebSocketData();
  const chartData: any[] = data?.dashboard?.statusDistribution || [];

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return percent > 0.08 ? (
      <text x={x} y={y} fill="var(--text-primary)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
        {chartData.find(d => d.name === name)?.value}
      </text>
    ) : null;
  };

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={chartData} cx="50%" cy="50%"
          outerRadius={70} innerRadius={35}
          dataKey="value" label={renderLabel} labelLine={false}
          paddingAngle={3}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          iconSize={8} iconType="circle"
          wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Legacy (kept for backward compat) ──────────────────────────────────────
export function RiskLevelChart({ region }: { region?: string }) {
  return <CoralHealthTrendChart />;
}
export function SalesVsTargetChart() {
  return <SpectralSignatureChart />;
}
