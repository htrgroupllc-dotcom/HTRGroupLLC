import React from "react";
import { SERVICE_ZIP_POLYGONS, ringToPath } from "@/lib/serviceAreaGeo";

const VB_W = 1000;
const VB_H = 300;

const FILL = "rgba(56, 189, 248, 0.28)";
const STROKE = "#333333";

/** Semi-transparent ZIP overlays aligned to the Google Maps embed (z=9). */
export default function ServiceAreaMapOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {SERVICE_ZIP_POLYGONS.map((z) => (
        <path
          key={z.zip}
          d={ringToPath(z.ring, VB_W, VB_H)}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
