type Pt = [number, number];

// Computes cumulative segment lengths for keyTimes on L-shaped paths
function keyTimesFor(pts: Pt[]): string {
  const dists: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const total = dists[dists.length - 1];
  return dists.map(d => (d / total).toFixed(3)).join(";");
}

function cxValues(pts: Pt[]): string {
  return pts.map(p => p[0]).join(";");
}
function cyValues(pts: Pt[]): string {
  return pts.map(p => p[1]).join(";");
}
function cxValuesRev(pts: Pt[]): string {
  return [...pts].reverse().map(p => p[0]).join(";");
}
function cyValuesRev(pts: Pt[]): string {
  return [...pts].reverse().map(p => p[1]).join(";");
}

// All waypoints: start near centre (r≈40), end near oval edge (r≈72), centre=(110,110)
// Mask: inner=36 (hide centre tools), outer=74 (clip at oval boundary)
const TRACKS: Pt[][] = [
  [[110, 68],[110, 52]],              // TOP straight
  [[138, 82],[158, 62]],              // TOP-RIGHT diagonal
  [[152,110],[183,110]],              // RIGHT straight
  [[152,100],[176,100],[176,78]],     // RIGHT upper L
  [[152,120],[176,120],[176,142]],    // RIGHT lower L
  [[143, 92],[167, 68]],              // RIGHT-UP diagonal
  [[138,138],[158,158]],              // BOTTOM-RIGHT diagonal
  [[110,152],[110,182]],              // BOTTOM straight
  [[ 82,138],[ 62,158]],             // BOTTOM-LEFT diagonal
  [[ 68,110],[ 37,110]],             // LEFT straight
  [[ 80,100],[ 52,100],[ 52, 76]],  // LEFT upper L
  [[ 80,120],[ 52,120],[ 52,144]],  // LEFT lower L
  [[ 82, 82],[ 62, 62]],             // TOP-LEFT diagonal
];

const TRACK_COLOR = "rgba(98,182,255,0.48)";
const NODE_COLOR  = "rgba(98,182,255,0.90)";

export function HeroCircuitEffect() {
  return (
    <div
      style={{
        position: "absolute",
        left: "77%",
        top: "24%",
        width: "27%",
        aspectRatio: "1",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      <svg
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          {/* Donut mask: inner=36 hides tools, outer=74 clips at oval edge */}
          <mask id="rm">
            <circle cx="110" cy="110" r="74" fill="white" />
            <circle cx="110" cy="110" r="36" fill="black" />
          </mask>
          <filter id="sg" x="-400%" y="-400%" width="900%" height="900%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g mask="url(#rm)">
          {/* ── Static tracks ── */}
          {TRACKS.map((pts, i) => {
            const d = "M " + pts.map(p => p.join(",")).join(" L ");
            return <path key={`t${i}`} d={d} stroke={TRACK_COLOR} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />;
          })}

          {/* ── Junction nodes ── */}
          {TRACKS.flatMap((pts, ti) =>
            pts.map((p, pi) => (
              <circle key={`n${ti}-${pi}`} cx={p[0]} cy={p[1]} r={2} fill={NODE_COLOR} />
            ))
          )}

          {/* ── Outward signals ── */}
          {TRACKS.map((pts, i) => {
            const dur = `${1.6 + i * 0.18}s`;
            const begin = `${i * 0.28}s`;
            const kt = keyTimesFor(pts);
            return (
              <circle key={`o${i}`} cx={pts[0][0]} cy={pts[0][1]} r="3.2" fill="#62B6FF" filter="url(#sg)">
                <animate attributeName="cx" values={cxValues(pts)} keyTimes={kt} calcMode="linear" dur={dur} repeatCount="indefinite" begin={begin} />
                <animate attributeName="cy" values={cyValues(pts)} keyTimes={kt} calcMode="linear" dur={dur} repeatCount="indefinite" begin={begin} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.88;1" dur={dur} repeatCount="indefinite" begin={begin} />
              </circle>
            );
          })}

          {/* ── Inward signals (half-cycle offset) ── */}
          {TRACKS.map((pts, i) => {
            const dur = `${1.6 + i * 0.18}s`;
            const durVal = 1.6 + i * 0.18;
            const begin = `${i * 0.28 + durVal / 2}s`;
            const kt = keyTimesFor([...pts].reverse());
            return (
              <circle key={`r${i}`} cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.3" fill="#ffffff" filter="url(#sg)">
                <animate attributeName="cx" values={cxValuesRev(pts)} keyTimes={kt} calcMode="linear" dur={dur} repeatCount="indefinite" begin={begin} />
                <animate attributeName="cy" values={cyValuesRev(pts)} keyTimes={kt} calcMode="linear" dur={dur} repeatCount="indefinite" begin={begin} />
                <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.08;0.88;1" dur={dur} repeatCount="indefinite" begin={begin} />
              </circle>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
