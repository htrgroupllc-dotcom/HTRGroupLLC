import React, { useLayoutEffect, useRef, useState } from "react";
import { SERVICE_ZIP_POLYGONS, ringToPath } from "@/lib/serviceAreaGeo";

const FILL = "rgba(56, 189, 248, 0.28)";
const STROKE = "#333333";

/** Semi-transparent ZIP overlays aligned to the Google Maps embed (z=9, Web Mercator). */
export default function ServiceAreaMapOverlay() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 300 });

  useLayoutEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.max(1, Math.round(width));
      const h = Math.max(1, Math.round(height));
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none z-[1]">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        {SERVICE_ZIP_POLYGONS.map((z) => (
          <path
            key={z.zip}
            d={ringToPath(z.ring, w, h)}
            fill={FILL}
            stroke={STROKE}
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
