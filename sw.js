const CACHE = "htr-pwa-v8";

self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // API — do not intercept
  if (url.pathname.startsWith("/api/")) return;

  // HTML navigation — network first
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Static assets — network + cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)),
  );
});

// ── Badge state persistence via IndexedDB ─────────────────────────────────────
function openBadgeDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("htr-badge-db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbGet(db, key) {
  return new Promise((resolve) => {
    const req = db.transaction("kv", "readonly").objectStore("kv").get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}
async function dbSet(db, key, value) {
  return new Promise((resolve) => {
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

// ── Message handler (from main page) ─────────────────────────────────────────
self.addEventListener("message", async (event) => {
  const msg = event.data || {};
  if (msg.type === "BADGE_INIT") {
    let db;
    try { db = await openBadgeDb(); } catch { return; }
    await Promise.all([
      dbSet(db, "token", msg.token ?? null),
      dbSet(db, "apiBase", msg.apiBase ?? null),
      dbSet(db, "lastSeenAt", msg.lastSeenAt ?? null),
    ]);
  } else if (msg.type === "BADGE_CLEAR") {
    if ("clearAppBadge" in self) self.clearAppBadge().catch(() => {});
  } else if (msg.type === "BADGE_CHECK") {
    await checkAndSetBadge();
  }
});

// ── Periodic Background Sync (Chrome Android) ─────────────────────────────────
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "emp-badge-check") {
    event.waitUntil(checkAndSetBadge());
  }
});

// ── Web Push: Admin new-booking alerts ───────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    try { data = { body: event.data?.text?.() || "New booking received" }; } catch { data = {}; }
  }

  const title = String(data.title || "New Appliance Booking");
  const body = String(data.body || "New booking received — tap to review.");
  const tag = String(data.tag || (data.bookingId ? `htr-booking-${data.bookingId}` : "htr-booking"));
  const url = String(data.url || "https://appliance-fixpro.com/admin");
  const vibrate = data.vibrate === false ? undefined : [200, 100, 200, 100, 400];

  const options = {
    body,
    tag, // OS replaces same-tag notifications → duplicate protection
    renotify: true,
    data: {
      url,
      bookingId: data.bookingId || null,
      sound: data.sound || "htr1",
      test: Boolean(data.test),
    },
    icon: "/htr-admin-icon.png",
    badge: "/admin-icon-192.png",
    // Background sound is OS-controlled; do not claim custom system ringtones.
    silent: data.sound === "silent",
  };
  if (vibrate) options.vibrate = vibrate;

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      // Notify open Admin clients for foreground custom sound (once per tag)
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        try {
          client.postMessage({
            type: "HTR_BOOKING_PUSH",
            bookingId: data.bookingId || null,
            tag,
            sound: data.sound || "htr1",
            vibrate: data.vibrate !== false,
            title,
            body,
            url,
            test: Boolean(data.test),
          });
        } catch { /* ignore */ }
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = String(data.url || "https://appliance-fixpro.com/admin");

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        try {
          const href = client.url || "";
          if (href.includes("/admin") && "focus" in client) {
            await client.focus();
            client.postMessage({
              type: "HTR_OPEN_BOOKING",
              bookingId: data.bookingId || null,
              url: targetUrl,
            });
            return;
          }
        } catch { /* ignore */ }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
