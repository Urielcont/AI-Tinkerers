"use client";

import { motion } from "framer-motion";
import type { BodyZone } from "@/lib/triage-schema";

interface BodyHeatMapProps {
  zone: BodyZone | null;
  severity: number;
}

const ZONE_COORDINATES: Record<BodyZone, { x: string; y: string }> = {
  head: { x: "50%", y: "12%" },
  chest: { x: "50%", y: "28%" },
  abdomen: { x: "50%", y: "42%" },
  back: { x: "50%", y: "35%" }, // Simplified for front view
  arm: { x: "25%", y: "35%" }, // Right arm in front view
  leg: { x: "40%", y: "75%" }, // Right leg in front view
};

export function BodyHeatMap({ zone, severity }: BodyHeatMapProps) {
  const coords = zone ? ZONE_COORDINATES[zone] : null;
  
  // Severity color mapping (1-5) - More vibrant/hot colors
  const colors = [
    "rgba(192, 133, 82, 0.4)",  // 1: Sandy Gold
    "rgba(255, 183, 77, 0.6)",  // 2: Warm Amber
    "rgba(255, 112, 67, 0.8)",  // 3: Deep Orange
    "rgba(229, 57, 53, 0.9)",   // 4: Bright Red
    "rgba(255, 0, 0, 1)",       // 5: Pure Heat Red
  ];
  
  const activeColor = severity >= 1 ? colors[severity - 1] : colors[0];

  return (
    <div className="relative aspect-[1/2] w-full max-w-[240px] overflow-hidden rounded-[2.5rem] bg-[rgba(255,255,255,0.02)] border border-white/5 shadow-inner">
      {/* Human Silhouette background */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <svg viewBox="0 0 100 200" className="h-full w-auto opacity-30 fill-[#c9bdb0]">
           {/* Simple Head */}
           <circle cx="50" cy="20" r="12" />
           {/* Torso */}
           <path d="M35 35 Q50 30 65 35 L60 90 L40 90 Z" />
           {/* Arms */}
           <path d="M35 35 L15 80 L22 85 L38 45 Z" />
           <path d="M65 35 L85 80 L78 85 L62 45 Z" />
           {/* Legs */}
           <path d="M40 90 L35 180 L48 180 L50 95 Z" />
           <path d="M60 90 L65 180 L52 180 L50 95 Z" />
        </svg>
      </div>

      {/* Heat Spots */}
      {coords && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute z-10"
          style={{ 
            left: coords.x, 
            top: coords.y,
            transform: "translate(-50%, -50%)"
          }}
        >
          {/* Main Glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute rounded-full blur-2xl"
            style={{ 
              width: "120px", 
              height: "120px", 
              backgroundColor: activeColor,
              transform: "translate(-50%, -50%)"
            }}
          />
          
          {/* Core Spot */}
          <div 
            className="relative h-6 w-6 rounded-full border-2 border-white/40 shadow-lg"
            style={{ 
              backgroundColor: activeColor,
              transform: "translate(-50%, -50%)"
            }}
          />
        </motion.div>
      )}

      {/* Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#173634_1px,transparent_1px)] [background-size:20px_20px]" />
    </div>
  );
}
