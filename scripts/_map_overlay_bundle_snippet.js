const SERVICE_AREA_MAP_VB = { w: 1e3, h: 300 };
const SERVICE_AREA_MAP_VIEW = { west: -96.28, east: -94.52, north: 30.48, south: 28.92 };
const SERVICE_AREA_MAP_FILL = "rgba(92, 58, 33, 0.32)";
const SERVICE_AREA_MAP_STROKE = "#6B4423";
const SERVICE_AREA_MAP_STROKE_OUTER = "#5C3D1E";
function serviceAreaRingAround(lng, lat, dLng = 0.11, dLat = 0.09) {
  return [
    [lng - dLng, lat + dLat * 0.7],
    [lng + dLng * 0.35, lat + dLat],
    [lng + dLng, lat],
    [lng + dLng * 0.55, lat - dLat],
    [lng - dLng * 0.25, lat - dLat],
    [lng - dLng, lat - dLat * 0.35],
    [lng - dLng, lat + dLat * 0.7]
  ];
}
const SERVICE_AREA_METRO_OUTLINE = [
  [-96.05, 30.42], [-95.15, 30.44], [-94.62, 30.12], [-94.58, 29.72], [-94.72, 29.38],
  [-95.05, 29.22], [-95.55, 29.28], [-95.95, 29.45], [-96.12, 29.85], [-96.05, 30.42]
];
const SERVICE_AREA_ZONES = [
  { id: "houston", ring: serviceAreaRingAround(-95.37, 29.76, 0.14, 0.11) },
  { id: "katy", ring: serviceAreaRingAround(-95.82, 29.79, 0.1, 0.08) },
  { id: "sugar-land", ring: serviceAreaRingAround(-95.63, 29.62, 0.09, 0.08) },
  { id: "pearland", ring: serviceAreaRingAround(-95.29, 29.56, 0.09, 0.08) },
  { id: "woodlands", ring: serviceAreaRingAround(-95.49, 30.17, 0.1, 0.09) },
  { id: "pasadena", ring: serviceAreaRingAround(-95.21, 29.69, 0.09, 0.08) },
  { id: "baytown", ring: serviceAreaRingAround(-94.98, 29.74, 0.1, 0.08) },
  { id: "league-city", ring: serviceAreaRingAround(-95.09, 29.51, 0.09, 0.08) },
  { id: "missouri-city", ring: serviceAreaRingAround(-95.54, 29.62, 0.08, 0.08) },
  { id: "conroe", ring: serviceAreaRingAround(-95.46, 30.31, 0.1, 0.09) },
  { id: "friendswood", ring: serviceAreaRingAround(-95.2, 29.53, 0.08, 0.07) },
  { id: "rosenberg", ring: serviceAreaRingAround(-95.81, 29.55, 0.08, 0.08) }
];
function serviceAreaProject(lng, lat) {
  const { west, east, north, south } = SERVICE_AREA_MAP_VIEW;
  const { w, h } = SERVICE_AREA_MAP_VB;
  const x = (lng - west) / (east - west) * w;
  const y = (north - lat) / (north - south) * h;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}
function serviceAreaRingPath(ring) {
  const pts = ring.map(([lng, lat]) => serviceAreaProject(lng, lat));
  return `M ${pts.join(" L ")} Z`;
}
function ServiceAreaMapOverlay() {
  const outer = serviceAreaRingPath(SERVICE_AREA_METRO_OUTLINE);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", {
    className: "absolute inset-0 w-full h-full pointer-events-none z-[1]",
    viewBox: `0 0 ${SERVICE_AREA_MAP_VB.w} ${SERVICE_AREA_MAP_VB.h}`,
    preserveAspectRatio: "none",
    "aria-hidden": true,
    children: [
      ...SERVICE_AREA_ZONES.map((z) => /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
        d: serviceAreaRingPath(z.ring),
        fill: SERVICE_AREA_MAP_FILL,
        stroke: SERVICE_AREA_MAP_STROKE,
        strokeWidth: 2,
        vectorEffect: "non-scaling-stroke"
      }, z.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
        d: outer,
        fill: "none",
        stroke: SERVICE_AREA_MAP_STROKE_OUTER,
        strokeWidth: 2.5,
        vectorEffect: "non-scaling-stroke"
      })
    ]
  });
}
/* SERVICE_AREA_MAP_OVERLAY */