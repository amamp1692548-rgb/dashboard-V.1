"use client";

import React, { useState } from "react";

const REEF_IMAGES = [
  "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600", // Colorful Coral
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600", // Diver near Reef
  "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&q=80&w=600", // Turquoise Sea Depth
  "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=600", // Soft Pink Coral Reef
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600", // Blue Sea Reef
];

export default function CameraStreamPanel({ node, onClose }: { node: any; onClose: () => void }) {
  const [hasVideo, setHasVideo] = useState(false); // Default to false to show the standby camera-off screen

  if (!node) return null;
  const imageIndex = (node.id || 0) % REEF_IMAGES.length;
  const reefImage = REEF_IMAGES[imageIndex];

  return (
    <div className="animate-slide-right" style={{
      position: "absolute", top: 16, right: 296, width: 340,
      background: "rgba(8,16,30,0.95)", border: "1px solid var(--border-bright)",
      borderRadius: 12, zIndex: 1000,
      padding: 12, display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "-5px 5px 25px rgba(0,0,0,0.6)",
      backdropFilter: "blur(10px)",
    }}>
      {/* Minimal Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: hasVideo ? "#00ff88" : "#94a3b8",
            boxShadow: hasVideo ? "0 0 6px #00ff88" : "none",
            display: "inline-block"
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.05em" }}>
            Node {node.id} — LIVE MONITOR
          </span>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF",
          width: 20, height: 20, borderRadius: 4, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        >✕</button>
      </div>

      {/* Screen Frame Container (Dedicated VDO Frame) */}
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "#000000",
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
      }}>
        
        {/* State A: NO VIDEO CONNECTED (Exact Standby screen matching the user's attachment) */}
        {!hasVideo && (
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "#000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 10,
          }}>
            {/* Camera-off SVG Icon */}
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" style={{ opacity: 0.85 }}>
              {/* Slashed Camera path */}
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m4 0h6a2 2 0 0 1 2 2v3.5" />
              <path d="M23 7l-7 5 7 5V7z" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            <div style={{
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.03em",
              opacity: 0.9,
            }}>
              There is no connected camera.
            </div>
          </div>
        )}

        {/* State B: ACTIVE VIDEO FEED */}
        {hasVideo && (
          <>
            {/* CRT Scanline Overlay */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
              backgroundSize: "100% 4px, 6px 100%",
              zIndex: 2,
              pointerEvents: "none",
            }} />

            {/* Dynamic Ocean Wave Glow */}
            <div className="animate-pulse-glow" style={{
              position: "absolute",
              width: "150%", height: "150%",
              background: "radial-gradient(ellipse at center, rgba(3, 105, 161, 0.18) 0%, transparent 70%)",
              top: "-25%", left: "-25%",
              pointerEvents: "none",
              zIndex: 1,
            }} />

            {/* Telemetry Overlays */}
            <div style={{
              position: "absolute",
              top: 8, left: 8,
              color: "#00ff88", fontFamily: "monospace", fontSize: 8,
              zIndex: 3, textShadow: "0 0 3px rgba(0,255,136,0.6)",
              display: "flex", flexDirection: "column", gap: 1
            }}>
              <div>CAM_01_FEED</div>
              <div>DEPTH: {node.depth || 9.1}m</div>
              <div>TEMP: {node.temperature || 28.5}°C</div>
            </div>

            <div style={{
              position: "absolute",
              top: 8, right: 8,
              color: "#00ff88", fontFamily: "monospace", fontSize: 8,
              zIndex: 3, textShadow: "0 0 3px rgba(0,255,136,0.6)",
              textAlign: "right",
            }}>
              <div>REC ●</div>
              <div>{new Date().toLocaleTimeString()}</div>
            </div>

            {/* Lens crosshairs */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 44, height: 44,
              border: "1px solid rgba(0, 255, 136, 0.2)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 3, pointerEvents: "none"
            }}>
              <div style={{ width: 4, height: 4, background: "rgba(0, 255, 136, 0.3)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", width: 10, height: 1, background: "rgba(0, 255, 136, 0.3)" }} />
              <div style={{ position: "absolute", width: 1, height: 10, background: "rgba(0, 255, 136, 0.3)" }} />
            </div>

            {/* Actual Image Stream Specific to Pinned Node */}
            <img 
              src={reefImage} 
              alt={`Underwater Stream Node ${node.id}`} 
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0, left: 0,
                opacity: 0.85,
              }}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600";
              }}
            />

            {/* Coordinate Overlay */}
            <div style={{
              position: "absolute",
              bottom: 8, left: 8, right: 8,
              display: "flex", justifyContent: "space-between",
              color: "#FFFFFF", fontSize: 8, fontFamily: "monospace",
              zIndex: 3, opacity: 0.7
            }}>
              <span>LAT: {node.lat.toFixed(6)}</span>
              <span>LNG: {node.lng.toFixed(6)}</span>
            </div>
          </>
        )}
      </div>

      {/* Interactive Simulation Controller */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.5)", fontWeight: 700 }}>CAMERA STREAM</span>
          <span style={{ fontSize: 8, color: "rgba(255, 255, 255, 0.3)" }}>
            {hasVideo ? "TRANSMITTING DATA" : "STANDBY / POWER OFF"}
          </span>
        </div>
        <button 
          onClick={() => setHasVideo(!hasVideo)}
          style={{
            background: hasVideo ? "rgba(255, 51, 102, 0.15)" : "rgba(0, 255, 136, 0.12)",
            border: `1px solid ${hasVideo ? "#ff3366" : "rgba(0, 255, 136, 0.4)"}`,
            color: hasVideo ? "#ff3366" : "#00ff88",
            fontSize: 9,
            padding: "5px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 0.2s",
            boxShadow: hasVideo ? "none" : "0 0 8px rgba(0, 255, 136, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hasVideo ? "rgba(255, 51, 102, 0.25)" : "rgba(0, 255, 136, 0.22)";
            e.currentTarget.style.borderColor = hasVideo ? "#ff3366" : "#00ff88";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hasVideo ? "rgba(255, 51, 102, 0.15)" : "rgba(0, 255, 136, 0.12)";
            e.currentTarget.style.borderColor = hasVideo ? "#ff3366" : "rgba(0, 255, 136, 0.4)";
          }}
        >
          {hasVideo ? "DISCONNECT FEED" : "CONNECT CAMERA"}
        </button>
      </div>
    </div>
  );
}
