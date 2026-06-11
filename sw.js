const CACHE = "htr-pwa-v5";

self.addEventListener("install", e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // API â€” Ð½Ðµ Ð¿ÐµÑ€ÐµÑ…Ð²Ð°Ñ‚Ñ‹Ð²Ð°Ñ‚ÑŒ
  if (url.pathname.startsWith("/api/")) return;

  // HTML-Ð½Ð°Ð²Ð¸Ð³Ð°Ñ†Ð¸Ñ â€” Ð²ÑÐµÐ³Ð´Ð° Ñ ÑÐµÑ‚Ð¸, Ð½Ðµ ÐºÐµÑˆÐ¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Ð¡Ñ‚Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ Ñ€ÐµÑÑƒÑ€ÑÑ‹ (JS, CSS, Ð¸Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ñ) â€” ÑÐµÑ‚ÑŒ + ÐºÐµÑˆ
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// â”€â”€ Badge state persistence via IndexedDB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openBadgeDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("htr-badge-db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbGet(db, key) {
  return new Promise(resolve => {
    const req = db.transaction("kv", "readonly").objectStore("kv").get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}
async function dbSet(db, key, value) {
  return new Promise(resolve => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

async function checkAndSetBadge() {
  let db;
  try { db = await openBadgeDb(); } catch { return; }
  const [token, apiBase, lastSeenAt] = await Promise.all([
    dbGet(db, "token"), dbGet(db, "apiBase"), dbGet(db, "lastSeenAt"),
  ]);
  if (!token || !apiBase) return;
  const since = lastSeenAt ? `?since=${encodeURIComponent(lastSeenAt)}` : "";
  try {
    const res = await fetch(`${apiBase}/api/employee/unread-count${since}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const count = typeof data.count === "number" ? data.count : 0;
    if ("setAppBadge" in self && count > 0) {
      self.setAppBadge(count).catch(() => {});
    } else if ("clearAppBadge" in self && count === 0) {
      self.clearAppBadge().catch(() => {});
    }
  } catch { /* network error */ }
}

// â”€â”€ Message handler (from main page) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
self.addEventListener("message", async event => {
  const msg = event.data || {};
  if (msg.type === "BADGE_INIT") {
    let db;
    try { db = await openBadgeDb(); } catch { return; }
    await Promise.all([
      dbSet(db, "token",      msg.token      ?? null),
      dbSet(db, "apiBase",    msg.apiBase    ?? null),
      dbSet(db, "lastSeenAt", msg.lastSeenAt ?? null),
    ]);
  } else if (msg.type === "BADGE_CLEAR") {
    if ("clearAppBadge" in self) self.clearAppBadge().catch(() => {});
  } else if (msg.type === "BADGE_CHECK") {
    await checkAndSetBadge();
  }
});

// â”€â”€ Periodic Background Sync (Chrome Android) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
self.addEventListener("periodicsync", event => {
  if (event.tag === "emp-badge-check") {
    event.waitUntil(checkAndSetBadge());
  }
});

