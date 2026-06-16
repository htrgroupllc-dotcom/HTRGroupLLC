from pathlib import Path

OLD_TS = r"""function getDailyStats(): string[] {
  const BASE_DATE  = new Date(2026, 3, 4); // April 4, 2026
  const BASE       = [4123, 3995, 9567, 10];
  const PER_DAY    = [2, 3, 2, 0];         // daily increment per counter
  const today      = new Date();
  today.setHours(0, 0, 0, 0);
  BASE_DATE.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - BASE_DATE.getTime()) / 86400000));
  return BASE.map((v, i) => (v + days * PER_DAY[i]).toLocaleString("en-US"));
}"""

NEW_TS = r"""function statsDayIncrement(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return 1 + (Math.abs(h) % 3);
}

function getDailyStats(): string[] {
  const LAUNCH_DATE = new Date(2026, 5, 11); // June 11, 2026 — baseline day
  const BASE = [4259, 4199, 9703, 10];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  LAUNCH_DATE.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - LAUNCH_DATE.getTime()) / 86400000));
  let extraHappy = 0;
  let extraServices = 0;
  for (let d = 0; d < days; d++) {
    const day = new Date(LAUNCH_DATE.getTime() + d * 86400000);
    const key = day.toISOString().slice(0, 10);
    extraHappy += statsDayIncrement(key + ":happy");
    extraServices += statsDayIncrement(key + ":services");
  }
  return [
    BASE[0] + extraHappy,
    BASE[1] + extraServices,
    BASE[2],
    BASE[3],
  ].map((v) => v.toLocaleString("en-US"));
}"""

OLD_JS = r"""function getDailyStats() {
  const BASE_DATE = new Date(2026, 3, 4);
  const BASE = [4123, 3995, 9567, 10];
  const PER_DAY = [2, 3, 2, 0];
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  BASE_DATE.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - BASE_DATE.getTime()) / 864e5));
  return BASE.map((v, i) => (v + days * PER_DAY[i]).toLocaleString("en-US"));
}"""

NEW_JS = r"""function statsDayIncrement(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return 1 + (Math.abs(h) % 3);
}
function getDailyStats() {
  const LAUNCH_DATE = new Date(2026, 5, 11);
  const BASE = [4259, 4199, 9703, 10];
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  LAUNCH_DATE.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - LAUNCH_DATE.getTime()) / 864e5));
  let extraHappy = 0;
  let extraServices = 0;
  for (let d = 0; d < days; d++) {
    const day = new Date(LAUNCH_DATE.getTime() + d * 864e5);
    const key = day.toISOString().slice(0, 10);
    extraHappy += statsDayIncrement(key + ":happy");
    extraServices += statsDayIncrement(key + ":services");
  }
  return [
    BASE[0] + extraHappy,
    BASE[1] + extraServices,
    BASE[2],
    BASE[3],
  ].map((v) => v.toLocaleString("en-US"));
}"""

home = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
js = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
ht = home.read_text(encoding="utf-8")
jb = js.read_text(encoding="utf-8")
if OLD_TS not in ht:
    raise SystemExit("home.tsx pattern not found")
if OLD_JS not in jb:
    raise SystemExit("bundle pattern not found")
home.write_text(ht.replace(OLD_TS, NEW_TS), encoding="utf-8")
js.write_text(jb.replace(OLD_JS, NEW_JS), encoding="utf-8")
print("patched ok")
