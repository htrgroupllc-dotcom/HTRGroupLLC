/** Geographic data for Houston-metro service area map overlay (z=9 embed). */
export const MAP_VIEW = {
  west: -96.28,
  east: -94.52,
  north: 30.48,
  south: 28.92,
} as const;

export type LngLat = readonly [number, number];

/** Outer boundary of the greater metro we serve. */
export const METRO_OUTLINE: LngLat[] = [
  [-96.05, 30.42],
  [-95.15, 30.44],
  [-94.62, 30.12],
  [-94.58, 29.72],
  [-94.72, 29.38],
  [-95.05, 29.22],
  [-95.55, 29.28],
  [-95.95, 29.45],
  [-96.12, 29.85],
  [-96.05, 30.42],
];

function ringAround(lng: number, lat: number, dLng = 0.11, dLat = 0.09): LngLat[] {
  return [
    [lng - dLng, lat + dLat * 0.7],
    [lng + dLng * 0.35, lat + dLat],
    [lng + dLng, lat],
    [lng + dLng * 0.55, lat - dLat],
    [lng - dLng * 0.25, lat - dLat],
    [lng - dLng, lat - dLat * 0.35],
    [lng - dLng, lat + dLat * 0.7],
  ];
}

/** City / zone highlights (listed on the home page). */
export const SERVICE_ZONES: { id: string; name: string; ring: LngLat[] }[] = [
  { id: "houston", name: "Houston", ring: ringAround(-95.37, 29.76, 0.14, 0.11) },
  { id: "katy", name: "Katy", ring: ringAround(-95.82, 29.79, 0.1, 0.08) },
  { id: "sugar-land", name: "Sugar Land", ring: ringAround(-95.63, 29.62, 0.09, 0.08) },
  { id: "pearland", name: "Pearland", ring: ringAround(-95.29, 29.56, 0.09, 0.08) },
  { id: "woodlands", name: "The Woodlands", ring: ringAround(-95.49, 30.17, 0.1, 0.09) },
  { id: "pasadena", name: "Pasadena", ring: ringAround(-95.21, 29.69, 0.09, 0.08) },
  { id: "baytown", name: "Baytown", ring: ringAround(-94.98, 29.74, 0.1, 0.08) },
  { id: "league-city", name: "League City", ring: ringAround(-95.09, 29.51, 0.09, 0.08) },
  { id: "missouri-city", name: "Missouri City", ring: ringAround(-95.54, 29.62, 0.08, 0.08) },
  { id: "conroe", name: "Conroe", ring: ringAround(-95.46, 30.31, 0.1, 0.09) },
  { id: "friendswood", name: "Friendswood", ring: ringAround(-95.2, 29.53, 0.08, 0.07) },
  { id: "rosenberg", name: "Rosenberg", ring: ringAround(-95.81, 29.55, 0.08, 0.08) },
];

export function projectPoint(lng: number, lat: number, width: number, height: number): string {
  const { west, east, north, south } = MAP_VIEW;
  const x = ((lng - west) / (east - west)) * width;
  const y = ((north - lat) / (north - south)) * height;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

export function ringToPath(ring: LngLat[], width: number, height: number): string {
  const pts = ring.map(([lng, lat]) => projectPoint(lng, lat, width, height));
  return `M ${pts.join(" L ")} Z`;
}
