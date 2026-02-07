"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Port } from "@/lib/ports";
import { Plus, Minus } from "lucide-react";

// Leaflet CSS must be imported
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  departurePort: Port;
  arrivalPort: Port;
  progress: number;
  zoom: number;
  seaRoute?: { lat: number; lng: number }[];
  onZoomIn: () => void;
  onZoomOut: () => void;
}

// Dynamic import to avoid SSR issues
const MapContent = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export function LeafletMap({
  departurePort,
  arrivalPort,
  progress,
  zoom,
  seaRoute = [],
  onZoomIn,
  onZoomOut,
}: LeafletMapProps) {
  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-slate-800">
      <MapContent
        departurePort={departurePort}
        arrivalPort={arrivalPort}
        progress={progress}
        zoom={zoom}
        seaRoute={seaRoute}
      />

      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-[1000]">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-white/20
                   flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-white/20
                   flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 z-[1000]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-white">출발</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-white">도착</span>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 z-[1000]">
        <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
