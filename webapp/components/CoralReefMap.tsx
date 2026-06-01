"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useWebSocketData } from "./WebSocketProvider";
import NodeDetailPanel from "./NodeDetailPanel";
import CameraStreamPanel from "./CameraStreamPanel";

const getStatusConfig = (status: string) => {
  if (!status || status === "Offline") return { color: "#94a3b8", glow: "rgba(148,163,184,0.4)", ring: "rgba(148,163,184,0.1)" };
  
  // Problems (Levels 1-4 or any impact mentioned)
  if (status.includes("ระดับ") || status.includes("Critical") || status.includes("Warning") || status.includes("Stress")) {
    return { color: "#ff3366", glow: "rgba(255,51,102,0.8)", ring: "rgba(255,51,102,0.25)" };
  }
  
  // Healthy/Normal
  if (status.includes("ปกติ") || status.includes("Healthy")) {
    return { color: "#00ff88", glow: "rgba(0,255,136,0.6)", ring: "rgba(0,255,136,0.2)" };
  }
  
  return { color: "#94a3b8", glow: "none", ring: "rgba(148,163,184,0.1)" };
};

function createGlowMarker(status: string, healthScore: number | null) {
  const cfg = getStatusConfig(status);
  const isCritical = status?.includes("ระดับ 4") || status?.includes("ระดับ 3");
  const scoreText = healthScore !== null ? `${Math.round(healthScore)}` : "—";

  const svgSize = 36;
  const html = `
    <div style="position:relative;width:${svgSize}px;height:${svgSize}px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
      <!-- Circular Sensor Icon (Smaller Version) -->
      <div style="
        width:24px;height:24px;border-radius:50%;overflow:hidden;
        border:1.5px solid ${cfg.color};
        background:#FFFFFF;
        box-shadow:0 0 6px ${cfg.glow};
        display:flex;align-items:center;justify-content:center;
        padding:2px;
      ">
        <img src="/picture/Coral%20sensor%20ICON.png" style="width:100%;height:100%;object-fit:contain;" />
      </div>
      
      <!-- Status Light Overlay -->
      <div style="
        position:absolute;top:4px;right:4px;
        width:6px;height:6px;border-radius:50%;
        background:${cfg.color};
        box-shadow:0 0 4px ${cfg.glow}, 0 0 8px ${cfg.ring};
        border:1px solid white;
        animation:${isCritical ? 'blink-red 1s infinite' : 'pulse-glow 2s infinite'};
        z-index:2;
      "></div>

      <!-- Health Score Label -->
      <div style="
        position:absolute;bottom:-2px;
        background:rgba(5,11,20,0.85);
        color:white;font-size:7px;font-weight:800;font-family:'JetBrains Mono',monospace;
        padding:1px 3px;border-radius:2px;border:1px solid ${cfg.color};
        backdrop-filter:blur(4px);
      ">
        ${scoreText}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [svgSize, svgSize],
    iconAnchor: [svgSize / 2, svgSize / 2],
    popupAnchor: [0, -svgSize / 2],
  });
}

function MapFlyTo({ region, nodes, selectedNode }: { region: string; nodes: any[], selectedNode: any }) {
  const map = useMap();
  const prevRegion = useRef(region);
  const prevSelectedNode = useRef(selectedNode);

  useEffect(() => {
    if (selectedNode && selectedNode !== prevSelectedNode.current) {
      prevSelectedNode.current = selectedNode;
      map.flyTo([selectedNode.lat, selectedNode.lng], 13, { duration: 1.5 });
      return;
    }

    if (region === prevRegion.current) return;
    prevRegion.current = region;

    if (region === "All Regions") {
      map.flyTo([9.0, 99.5], 6, { duration: 1.8 });
      return;
    }
    const node = nodes.find(n => n.name === region || n.location === region);
    if (node) map.flyTo([node.lat, node.lng], 11, { duration: 1.8 });
  }, [region, map, nodes, selectedNode]);

  return null;
}

export default function CoralReefMap({ 
  region = "All Regions",
  selectedNode = null,
  onNodeSelect,
  onNodeClose
}: { 
  region?: string;
  selectedNode?: any;
  onNodeSelect?: (node: any) => void;
  onNodeClose?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [internalSelectedNode, setInternalSelectedNode] = useState<any>(null);
  const [isStreamOpen, setIsStreamOpen] = useState(false);
  const { data } = useWebSocketData();
  const nodesRaw: any[] = data?.dashboard?.mapData || [];
  // Ensure offline nodes display zeroed metrics on the map
  const nodes: any[] = nodesRaw.map(n => {
    const isOffline = n.status === "Offline" || !n.status || String(n.status).toLowerCase().includes("ออฟไลน์") || String(n.status).toLowerCase().includes("offline");
    if (!isOffline) return n;
    return {
      ...n,
      health_score: 0,
      predictions: {
        bleaching: 0,
        sedimentation: 0,
        chemical: 0,
        normal: 0
      },
      battery: 0,
      signal: 0,
      last_sync: "--",
      spectral_raw: [],
      temperature: 0,
      turbidity: 0,
      salinity: 0,
      ph: 0,
      dissolved_oxygen: 0,
      bleaching_probability: 0,
      stress_level: 0,
      color_degradation_index: 0,
      depth: 0
    };
  });

  const activeNode = selectedNode || internalSelectedNode;

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div style={{ height: "100%", width: "100%", background: "var(--bg-surface)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading satellite imagery...</div>
    </div>
  );

  const handleMarkerClick = (node: any) => {
    if (onNodeSelect) {
      onNodeSelect(node);
    } else {
      setInternalSelectedNode(node);
    }
  };

  const handleClosePanel = () => {
    setIsStreamOpen(false);
    if (onNodeClose) {
      onNodeClose();
    } else {
      setInternalSelectedNode(null);
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <MapContainer
        center={[9.0, 99.5]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <MapFlyTo region={region} nodes={nodes} selectedNode={activeNode} />

        {/* Esri World Imagery — satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA'
          maxZoom={18}
        />

        {nodes.map((node) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={createGlowMarker(node.status, node.health_score)}
            eventHandlers={{ click: () => handleMarkerClick(node) }}
          />
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div style={{
        position: "absolute", bottom: 12, left: 12, zIndex: 999,
        background: "rgba(5,11,20,0.88)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4,
        backdropFilter: "blur(8px)",
      }}>
        {[
          { label: "ปกติ (Online)", color: "#00ff88" },
          { label: "ตรวจพบปัญหา (Issue)", color: "#ff3366" },
          { label: "ออฟไลน์ (Offline)", color: "#94a3b8" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: 9, color: "#FFFFFF", fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>


      {/* Node Detail & Camera Stream slide-in panels */}
      {activeNode && (
        <>
          <NodeDetailPanel 
            node={activeNode} 
            onClose={handleClosePanel} 
            isStreamOpen={isStreamOpen}
            setIsStreamOpen={setIsStreamOpen}
          />
          {isStreamOpen && (
            <CameraStreamPanel 
              node={activeNode} 
              onClose={() => setIsStreamOpen(false)} 
            />
          )}
        </>
      )}
    </div>
  );
}
