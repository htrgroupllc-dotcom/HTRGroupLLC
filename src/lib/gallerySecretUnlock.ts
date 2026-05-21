/** Gallery admin: 2× globe (pause up to 10s) → 900ms pause → 3× globe. © = admin only. */

type Phase = "idle" | "after_two" | "ready_three";

const OPEN_KEY = "htr_gallery_admin_open";

let phase: Phase = "idle";
let count = 0;
let t1: ReturnType<typeof setTimeout> | null = null;
let t2: ReturnType<typeof setTimeout> | null = null;
let t3: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  [t1, t2, t3].forEach(t => {
    if (t) clearTimeout(t);
  });
  t1 = t2 = t3 = null;
}

function reset() {
  clearTimers();
  phase = "idle";
  count = 0;
}

/** Only open gallery admin PIN after globe secret — expires in 30s (not on normal Our Work click). */
const OPEN_TTL_MS = 30_000;

export function queueGalleryAdminOpen(): void {
  sessionStorage.setItem(OPEN_KEY, String(Date.now()));
}

export function consumeGalleryAdminOpen(): boolean {
  const raw = sessionStorage.getItem(OPEN_KEY);
  sessionStorage.removeItem(OPEN_KEY);
  if (!raw) return false;
  const at = Number(raw);
  if (!Number.isFinite(at) || Date.now() - at > OPEN_TTL_MS) return false;
  return true;
}

export function clearGalleryAdminOpenQueue(): void {
  sessionStorage.removeItem(OPEN_KEY);
}

/** All clicks on the globe icon (home, gallery, blog if wired). */
export function onGlobeSecretClick(onUnlock: () => void): void {
  if (phase === "idle") {
    count += 1;
    if (count < 2) {
      if (t1) clearTimeout(t1);
      t1 = setTimeout(reset, 10_000);
    } else {
      if (t1) clearTimeout(t1);
      count = 0;
      phase = "after_two";
      t2 = setTimeout(() => {
        phase = "ready_three";
        count = 0;
        t3 = setTimeout(reset, 10_000);
      }, 900);
    }
    return;
  }

  if (phase === "after_two") {
    reset();
    return;
  }

  if (phase === "ready_three") {
    if (t3) clearTimeout(t3);
    count += 1;
    if (count >= 3) {
      reset();
      onUnlock();
    } else {
      t3 = setTimeout(reset, 2000);
    }
  }
}
