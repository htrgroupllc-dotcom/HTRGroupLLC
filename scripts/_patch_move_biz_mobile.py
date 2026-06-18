"""Patch prod bundle: move booking Appliance<->Dental (mobile full-width button + API)."""
from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
bundle = ROOT / "assets/index-utf8-v4.js"
html = ROOT / "index.html"

text = bundle.read_text(encoding="utf-8")
EYE = "\U0001f441"

LANG_INSERT_RU = """    bizDental: "Dental",
    moveToDentalBtn: "→ Dental",
    moveToApplianceBtn: "→ Appliance",
    moveToDentalTitle: "Переместить заявку в категорию Dental",
    moveToApplianceTitle: "Переместить заявку в категорию Appliance",
    moveToDentalSuccess: "Заявка перемещена в Dental",
    moveToApplianceSuccess: "Заявка перемещена в Appliance",
    moveBizError: "Не удалось сменить категорию",
    remoteBookingHint:"""

LANG_INSERT_EN = """    bizDental: "Dental",
    moveToDentalBtn: "→ Dental",
    moveToApplianceBtn: "→ Appliance",
    moveToDentalTitle: "Move booking to Dental category",
    moveToApplianceTitle: "Move booking to Appliance category",
    moveToDentalSuccess: "Booking moved to Dental",
    moveToApplianceSuccess: "Booking moved to Appliance",
    moveBizError: "Could not change category",
    remoteBookingHint:"""

for old, new in [
    ('    bizDental: "Dental",\n    remoteBookingHint: "Только просмотр', LANG_INSERT_RU + ' "Только просмотр'),
    ('    bizDental: "Dental",\n    remoteBookingHint: "View only', LANG_INSERT_EN + ' "View only'),
]:
    if old not in text:
        raise SystemExit(f"LANG PATCH MISS: {old[:80]}...")
    text = text.replace(old, new, 1)

STATE_OLD = "  const [reviewLoading, setReviewLoading] = reactExports.useState(/* @__PURE__ */ new Set());\n  const [adminEstimateTarget"
STATE_NEW = "  const [reviewLoading, setReviewLoading] = reactExports.useState(/* @__PURE__ */ new Set());\n  const [moveBizLoading, setMoveBizLoading] = reactExports.useState(/* @__PURE__ */ new Set());\n  const [adminEstimateTarget"
if STATE_OLD not in text:
    raise SystemExit("STATE PATCH MISS")
text = text.replace(STATE_OLD, STATE_NEW, 1)

FN_OLD = """  const approveBooking = async (id2) => {
    await fetch(`${API$2()}/api/admin/approve-booking`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: id2 })
    });
    await loadSlots();
    await loadSchedule();
  };
  const deleteBooking = async () => {"""

FN_NEW = """  const approveBooking = async (id2) => {
    await fetch(`${API$2()}/api/admin/approve-booking`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: id2 })
    });
    await loadSlots();
    await loadSchedule();
  };
  const moveBookingBiz = async (bookingId, target) => {
    if (moveBizLoading.has(bookingId)) return;
    setMoveBizLoading((prev) => new Set(prev).add(bookingId));
    try {
      const res = await fetch(`${API$2()}/api/admin/set-business-type`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, business_type: target })
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error ?? String(res.status));
      toast({
        title: target === "dental" ? `✅ ${t.moveToDentalSuccess}` : `✅ ${t.moveToApplianceSuccess}`
      });
      await loadSchedule();
    } catch {
      toast({ title: t.moveBizError, variant: "destructive" });
    } finally {
      setMoveBizLoading((prev) => {
        const s = new Set(prev);
        s.delete(bookingId);
        return s;
      });
    }
  };
  const MoveBizButton = ({ b, fullWidth }) => {
    const current = resolveBookingBiz(b.business_type);
    const target = current === "dental" ? "appliance" : "dental";
    const loading = moveBizLoading.has(b.id);
    const sizeCls = fullWidth ? "w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold leading-snug " : "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ";
    const btnClass = sizeCls + "border transition disabled:opacity-50 " + (target === "dental" ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100");
    return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      type: "button",
      disabled: loading,
      onClick: () => void moveBookingBiz(b.id, target),
      className: btnClass,
      title: target === "dental" ? t.moveToDentalTitle : t.moveToApplianceTitle,
      children: loading ? "…" : target === "dental" ? t.moveToDentalBtn : t.moveToApplianceBtn
    });
  };
  const deleteBooking = async () => {"""

if FN_OLD not in text:
    raise SystemExit("FN PATCH MISS")
text = text.replace(FN_OLD, FN_NEW, 1)

NAME_ROW_OLD = """/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-stone-800", children: b.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`, children: resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance }),"""

NAME_ROW_NEW = """/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-stone-800 break-words", children: b.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none shrink-0 ${resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`, children: resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance }),"""

if NAME_ROW_OLD not in text:
    raise SystemExit("NAME ROW PATCH MISS")
text = text.replace(NAME_ROW_OLD, NAME_ROW_NEW, 1)

MOBILE_OLD = f"""                      b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none", title: t.remoteBookingHint, children: "{EYE}" }}),
                      b.client_lang && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {{
                          className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700 leading-none uppercase",
                          title: b.client_lang === "es" ? t.clientLangEs : b.client_lang === "en" ? t.clientLangEn : b.client_lang,
                          children: b.client_lang
                        }}
                      )
                    ] }}),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {{ className: "w-3.5 h-3.5 flex-shrink-0", style: {{ color: ACCENT$4 }} }}),"""

MOBILE_NEW = f"""                      b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none shrink-0", title: t.remoteBookingHint, children: "{EYE}" }}),
                      b.client_lang && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {{
                          className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700 leading-none uppercase shrink-0",
                          title: b.client_lang === "es" ? t.clientLangEs : b.client_lang === "en" ? t.clientLangEn : b.client_lang,
                          children: b.client_lang
                        }}
                      )
                    ] }}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {{ className: "mt-1.5 mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoveBizButton, {{ b, fullWidth: true }}) }}),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {{ className: "w-3.5 h-3.5 flex-shrink-0", style: {{ color: ACCENT$4 }} }}),"""

if MOBILE_OLD not in text:
    raise SystemExit("MOBILE PATCH MISS")
text = text.replace(MOBILE_OLD, MOBILE_NEW, 1)

DESKTOP_OLD = f"""                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, {{ className: "w-3 h-3 text-stone-400 shrink-0" }}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: "font-medium text-stone-700", children: b.name }}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${{resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}}`, children: resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance }}),
                      b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none", title: t.remoteBookingHint, children: "{EYE}" }}),"""

DESKTOP_NEW = f"""                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, {{ className: "w-3 h-3 text-stone-400 shrink-0" }}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: "font-medium text-stone-700", children: b.name }}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${{resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}}`, children: resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance }}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MoveBizButton, {{ b }}),
                      b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {{ className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none", title: t.remoteBookingHint, children: "{EYE}" }}),"""

if DESKTOP_OLD not in text:
    raise SystemExit("DESKTOP PATCH MISS")
text = text.replace(DESKTOP_OLD, DESKTOP_NEW, 1)

bundle.write_text(text, encoding="utf-8")

html_text = html.read_text(encoding="utf-8")
if "?v=91" in html_text:
    html_text = html_text.replace("?v=91", "?v=92")
elif "?v=92" not in html_text:
    raise SystemExit("cache version not found in index.html")
html.write_text(html_text, encoding="utf-8")

final = bundle.read_text(encoding="utf-8")
assert "set-business-type" in final
assert "MoveBizButton" in final
assert "fullWidth: true" in final
print("Patched move biz mobile + desktop, cache v=92")
