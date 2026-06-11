import React from "react";
import { METRO_OUTLINE, SERVICE_ZONES, ringToPath } from "@/lib/serviceAreaGeo";

const VB_W = 1000;
const VB_H = 300;

const FILL = "rgba(92, 58, 33, 0.32)";
const STROKE = "#6B4423";
const STROKE_OUTER = "#5C3D1E";

/** Semi-transparent brown overlays aligned to the Google Maps embed (z=9). */
export default function ServiceAreaMapOverlay() {
  const outer = ringToPath(METRO_OUTLINE, VB_W, VB_H);
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {SERVICE_ZONES.map((z) => (
        <path
          key={z.id}
          d={ringToPath(z.ring, VB_W, VB_H)}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path
        d={outer}
        fill="none"
        stroke={STROKE_OUTER}
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="none"
      />
    </svg>
  );
}
