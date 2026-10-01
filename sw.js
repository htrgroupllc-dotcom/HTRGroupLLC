const CACHE = "htr-pwa-v14";

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

  if (url.pathname.startsWith("/api/")) return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/index.html")),
    );
    return;
  }

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

/** True after page reports a successful unmuted unlock of the selected Audio element. */
let pageAudioUnlocked = false;

self.addEventListener("message", async (event) => {
  const msg = event.data || {};
  if (msg.type === "HTR_AUDIO_SESSION") {
    // Page reports whether selected Audio was successfully unlocked for unmuted playback.
    pageAudioUnlocked = Boolean(msg.ready);
    try {
      console.info("[HTR BOOKING ALERT]", {
        stage: "sw-audio-session",
        ready: pageAudioUnlocked,
      });
    } catch { /* ignore */ }
    return;
  }
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

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "emp-badge-check") {
    event.waitUntil(checkAndSetBadge());
  }
});

const CUSTOM_TONES = new Set([
  "htr1", "htr2",
  "ru_female_professional", "ru_female_warm", "ru_female_attention",
  "en_female_professional", "en_female_warm", "en_female_attention",
]);

// ── Web Push: Admin NEW_BOOKING / RESTORED_BOOKING + Employee BOOKING_ASSIGNED / RESTORED_ASSIGNMENT
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    try { data = { body: event.data?.text?.() || "New booking received" }; } catch { data = {}; }
  }

  const eventType = String(data.eventType || (data.test ? "TEST" : "NEW_BOOKING"));
  const role = String(data.role || "admin");
  const title = String(
    data.title ||
      (eventType === "BOOKING_ASSIGNED"
        ? "New Job Assigned"
        : eventType === "RESTORED_BOOKING"
          ? "Booking Restored"
          : eventType === "RESTORED_ASSIGNMENT"
            ? "Job Restored"
            : "New Appliance Booking"),
  );
  const body = String(
    data.body ||
      (eventType === "BOOKING_ASSIGNED"
        ? "You have a new service job."
        : eventType === "RESTORED_BOOKING" || eventType === "RESTORED_ASSIGNMENT"
          ? "A booking was restored — tap to review."
          : "New booking received — tap to review."),
  );
  const tag = String(
    data.tag ||
      (data.bookingId
        ? eventType === "BOOKING_ASSIGNED"
          ? `htr-assigned-${data.bookingId}`
          : eventType === "RESTORED_BOOKING" || eventType === "RESTORED_ASSIGNMENT"
            ? `htr-restored-${data.restoreOpId || data.bookingId}`
            : `htr-booking-${data.bookingId}`
        : "htr-booking"),
  );
  const url = String(
    data.url ||
      (role === "employee"
        ? "https://appliance-fixpro.com/employee"
        : "https://appliance-fixpro.com/admin"),
  );
  const vibrate = data.vibrate === false ? undefined : [200, 100, 200, 100, 400];
  const soundPref = String(data.sound || "htr1");
  const restoreOpId = data.restoreOpId ? String(data.restoreOpId) : null;

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Only treat as focused when Client.focused === true (not undefined → true)
      const hasFocusedClient = clientsList.some((c) => {
        try { return c.focused === true; } catch { return false; }
      });

      // Background: OS notification sound.
      // Focused + custom: silence OS ONLY when page has proven unmuted Audio unlock.
      // Otherwise keep OS audible — muted-unlock lies caused production total silence.
      const silent =
        soundPref === "silent" ||
        (hasFocusedClient && CUSTOM_TONES.has(soundPref) && pageAudioUnlocked);

      try {
        console.info("[HTR BOOKING ALERT]", {
          stage: "sw-received",
          eventType,
          role,
          bookingId: data.bookingId ? String(data.bookingId).slice(0, 8) : null,
          restoreOpId: restoreOpId ? restoreOpId.slice(0, 8) : null,
          hasFocusedClient,
          pageAudioUnlocked,
          silent,
          sound: soundPref,
          clientCount: clientsList.length,
        });
      } catch { /* ignore */ }

      const options = {
        body,
        tag,
        renotify: true,
        silent,
        data: {
          url,
          bookingId: data.bookingId || null,
          restoreOpId,
          sound: soundPref,
          test: Boolean(data.test),
          eventType,
          role,
        },
        icon: role === "employee" ? "/manifest-icon-192.png" : "/htr-admin-icon.png",
        badge: role === "employee" ? "/manifest-icon-192.png" : "/admin-icon-192.png",
      };
      if (vibrate) options.vibrate = vibrate;

      await self.registration.showNotification(title, options);

      for (const client of clientsList) {
        try {
          client.postMessage({
            type: "HTR_BOOKING_PUSH",
            bookingId: data.bookingId || null,
            restoreOpId,
            tag,
            sound: soundPref,
            vibrate: data.vibrate !== false,
            title,
            body,
            url,
            test: Boolean(data.test),
            eventType,
            role,
            focusedHint: hasFocusedClient,
          });
        } catch { /* ignore */ }
      }
      try {
        console.info("[HTR BOOKING ALERT]", {
          stage: "sw-postmessage",
          eventType,
          role,
          bookingId: data.bookingId ? String(data.bookingId).slice(0, 8) : null,
          restoreOpId: restoreOpId ? restoreOpId.slice(0, 8) : null,
          clientsNotified: clientsList.length,
        });
      } catch { /* ignore */ }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const role = String(data.role || "admin");
  const targetUrl = String(
    data.url ||
      (role === "employee"
        ? "https://appliance-fixpro.com/employee"
        : "https://appliance-fixpro.com/admin"),
  );
  const pathHint = role === "employee" ? "/employee" : "/admin";

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        try {
          const href = client.url || "";
          if (href.includes(pathHint) && "focus" in client) {
            await client.focus();
            client.postMessage({
              type: "HTR_OPEN_BOOKING",
              bookingId: data.bookingId || null,
              url: targetUrl,
              role,
              eventType: data.eventType || "NEW_BOOKING",
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
