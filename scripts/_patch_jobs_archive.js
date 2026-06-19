const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let t = fs.readFileSync(path, "utf8");
const NL = t.includes("\r\n") ? "\r\n" : "\n";

function mustReplace(from, to, label) {
  const fromNl = from.replace(/\n/g, NL);
  const toNl = to.replace(/\n/g, NL);
  if (!t.includes(fromNl)) {
    console.error("MISSING:", label || from.slice(0, 120));
    process.exit(1);
  }
  t = t.replace(fromNl, toNl);
  console.log("OK:", label);
}

mustReplace(
  `  const [showCompleted, setShowCompleted] = reactExports.useState(true);`,
  `  const [showCompleted, setShowCompleted] = reactExports.useState(false);`,
  "showCompleted default false",
);

mustReplace(
  `  const visibleBookings = showCompleted ? [...activeBookings, ...historyBookings] : activeBookings;
  const filteredBookings = (() => {
    const sq = searchQuery.trim().toLowerCase();
    let result = visibleBookings;`,
  `  const isJobsArchiveTab = adminTab === "jobsArchive";
  const listBookings = isJobsArchiveTab ? historyBookings : activeBookings;
  const filteredBookings = (() => {
    const sq = searchQuery.trim().toLowerCase();
    let result = listBookings;`,
  "listBookings split",
);

mustReplace(
  `    tabBookings: "Заявки",
    tabEmployees: "Сотрудники",
    tabArchive: "Архив",
    tabBlacklist: "Чёрный список",`,
  `    tabBookings: "Заявки",
    tabJobsArchive: "Архив",
    tabEmployees: "Сотрудники",
    tabArchive: "Уволенные",
    tabBlacklist: "Чёрный список",
    jobsArchiveTitle: "Архив заказов",
    noArchivedJobs: "Закрытых заказов пока нет",`,
  "ru translations",
);

mustReplace(
  `    tabBookings: "Orders",
    tabEmployees: "Employees",
    tabArchive: "Archive",
    tabBlacklist: "Blacklist",`,
  `    tabBookings: "Orders",
    tabJobsArchive: "Archive",
    tabEmployees: "Employees",
    tabArchive: "Fired Staff",
    tabBlacklist: "Blacklist",
    jobsArchiveTitle: "Closed Jobs Archive",
    noArchivedJobs: "No closed jobs yet",`,
  "en translations",
);

mustReplace(
  `      { key: "bookings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }), label: t.tabBookings },
      { key: "employees", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }), label: t.tabEmployees },
      { key: "archive", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5" }), label: t.tabArchive },`,
  `      { key: "bookings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }), label: t.tabBookings },
      { key: "jobsArchive", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5" }), label: t.tabJobsArchive, count: historyBookings.length || void 0 },
      { key: "employees", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }), label: t.tabEmployees },
      { key: "archive", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveRestore, { className: "w-3.5 h-3.5" }), label: t.tabArchive },`,
  "tab bar entries",
);

if (t.includes('"bookings"|"employees"|"archive"')) {
  t = t.replace(
    '"bookings"|"employees"|"archive"|"blacklist"|"payroll"|"reports"|"settings"|"trash"|"pricebook"|"photos"',
    '"bookings"|"jobsArchive"|"employees"|"archive"|"blacklist"|"payroll"|"reports"|"settings"|"trash"|"pricebook"|"photos"',
  );
  console.log("OK: adminTab union type");
}

mustReplace(
  `adminAuthH, onOpenBooking: (id2) => {
      setAdminTab("bookings");
      setSearchQuery(id2);
      setHighlightBookingId(id2);
      setShowCompleted(true);
      setEmpFilter("");
      setMobileTab("bookings");
    } }),`,
  `adminAuthH, onOpenBooking: (id2) => {
      const b2 = allBookings.find((x) => x.id === id2);
      const closed = !!b2 && (b2.status === "completed" || b2.status === "cancelled");
      setAdminTab(closed ? "jobsArchive" : "bookings");
      setSearchQuery(id2);
      setHighlightBookingId(id2);
      setShowCompleted(false);
      setEmpFilter("");
      setMobileTab("bookings");
    } }),`,
  "reports onOpenBooking",
);

mustReplace(
  `    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: \`flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] \${adminTab !== "bookings" ? "hidden" : ""}\`, children: [`,
  `    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: \`flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] \${adminTab !== "bookings" && adminTab !== "jobsArchive" ? "hidden" : ""}\`, children: [`,
  "layout visibility",
);

// Wrap left slots panel — insert condition before left panel div
mustReplace(
  `    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: \`flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] \${adminTab !== "bookings" && adminTab !== "jobsArchive" ? "hidden" : ""}\`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: \`overflow-y-auto border-r border-stone-200 p-4 space-y-4 \${mobileTab !== "slots" ? "hidden md:block" : "block"} md:w-[300px] md:flex-none\`,`,
  `    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: \`flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] \${adminTab !== "bookings" && adminTab !== "jobsArchive" ? "hidden" : ""}\`, children: [
      adminTab === "bookings" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: \`overflow-y-auto border-r border-stone-200 p-4 space-y-4 \${mobileTab !== "slots" ? "hidden md:block" : "block"} md:w-[300px] md:flex-none\`,`,
  "left panel only on bookings",
);

// Close adminTab === "bookings" && wrapper before right panel
mustReplace(
  `        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: \`overflow-y-auto p-4 \${mobileTab !== "bookings" ? "hidden md:block" : "block"} flex-1\`, children:`,
  `        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: \`overflow-y-auto p-4 \${adminTab === "jobsArchive" ? "block" : mobileTab !== "bookings" ? "hidden md:block" : "block"} flex-1\`, children:`,
  "close slots conditional + right panel visibility",
);

// Replace header title + remove toggle buttons block
mustReplace(
  `          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-stone-600 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4" }),
            showCompleted ? t.allOrders : t.activeOrders,
            " (",
            visibleBookings.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg border border-stone-200 overflow-hidden text-[11px] font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowCompleted(false),
                className: \`px-3 py-1.5 transition \${!showCompleted ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}\`,
                children: [
                  t.activeTab,
                  activeBookings.length > 0 ? \` (\${activeBookings.length})\` : ""
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowCompleted(true),
                className: \`px-3 py-1.5 border-l border-stone-200 transition \${showCompleted ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}\`,
                children: [
                  t.allOrders,
                  historyBookings.length > 0 ? \` +\${historyBookings.length}\` : ""
                ]
              }
            )
          ] })`,
  `          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-stone-600 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4" }),
            isJobsArchiveTab ? t.jobsArchiveTitle : t.activeOrders,
            " (",
            listBookings.length,
            ")"
          ] }),
          isJobsArchiveTab && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-stone-400", children: t.restoreBtn2 })`,
  "header title without toggle",
);

mustReplace(`visibleBookings.length`, `listBookings.length`, "visibleBookings refs");

mustReplace(
  `searchQuery.trim() ? t.nothingFound : t.noOrders`,
  `searchQuery.trim() ? t.nothingFound : isJobsArchiveTab ? t.noArchivedJobs : t.noOrders`,
  "empty state",
);

mustReplace(
  `const showSeparator = showCompleted && isHistory && (idx === 0 || prevIsActive);`,
  `const showSeparator = !isJobsArchiveTab && showCompleted && isHistory && (idx === 0 || prevIsActive);`,
  "mobile separator",
);

mustReplace(
  `const showSepRow = showCompleted && isHistory && (i === 0 || prevIsActive);`,
  `const showSepRow = !isJobsArchiveTab && showCompleted && isHistory && (i === 0 || prevIsActive);`,
  "desktop separator",
);

// Mobile sub-tab count: active only on bookings tab
if (t.includes("allBookings.length,\r\n            \")\"\r\n          ]\r\n        }\r\n      )\r\n    ] }),")) {
  mustReplace(
    `            allBookings.length,
            ")"`,
    `            activeBookings.length,
            ")"`,
    "mobile tab count",
  );
} else {
  console.log("SKIP: mobile tab count pattern");
}

fs.writeFileSync(path, t, "utf8");
console.log("Patched", path, "size", t.length);
