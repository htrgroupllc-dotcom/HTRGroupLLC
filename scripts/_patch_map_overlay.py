from pathlib import Path

ROOT = Path(r"C:\Projects\HTRGroupLLC")

hp = ROOT / "src/pages/home.tsx"
t = hp.read_text(encoding="utf-8")
if "ServiceAreaMapOverlay" not in t:
    t = t.replace(
        'import ChatWidget from "@/components/ChatWidget";',
        'import ChatWidget from "@/components/ChatWidget";\nimport ServiceAreaMapOverlay from "@/components/ServiceAreaMapOverlay";',
        1,
    )
old = (
    '                <iframe\n'
    '                  title="Service Area Map"\n'
    '                  src="https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&z=9&output=embed"\n'
    '                  width="100%"\n'
    '                  height="300"\n'
    '                  style={{ border: 0, pointerEvents: "none" }}\n'
    '                  loading="lazy"\n'
    '                  referrerPolicy="no-referrer-when-downgrade"\n'
    '                />\n'
    '                <div className="absolute inset-0 bg-transparent group-hover:bg-black/10'
)
new = (
    '                <iframe\n'
    '                  title="Service Area Map"\n'
    '                  src="https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&z=9&output=embed"\n'
    '                  width="100%"\n'
    '                  height="300"\n'
    '                  style={{ border: 0, pointerEvents: "none" }}\n'
    '                  loading="lazy"\n'
    '                  referrerPolicy="no-referrer-when-downgrade"\n'
    '                />\n'
    '                <ServiceAreaMapOverlay />\n'
    '                <div className="absolute inset-0 z-[2] bg-transparent group-hover:bg-black/10'
)
if old not in t:
    raise SystemExit("home map block not found")
t = t.replace(old, new, 1)
hp.write_text(t, encoding="utf-8", newline="\n")
print("home.tsx ok")

bp = ROOT / "assets/index-utf8-v4.js"
b = bp.read_text(encoding="utf-8")
if "SERVICE_AREA_MAP_OVERLAY" in b:
    print("bundle already has overlay helper")
else:
    helper = open(ROOT / "scripts/_map_overlay_bundle_snippet.js", encoding="utf-8").read()
    idx = b.find("function HomePage")
    if idx < 0:
        idx = b.find("function Home")
    if idx < 0:
        raise SystemExit("Home function not found")
    b = b[:idx] + helper + "\n" + b[idx:]

iframe_close = (
    '                    referrerPolicy: "no-referrer-when-downgrade"\n'
    '                  }\n'
    '                ),\n'
    '                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-transparent group-hover:bg-black/10'
)
iframe_new = (
    '                    referrerPolicy: "no-referrer-when-downgrade"\n'
    '                  }\n'
    '                ),\n'
    '                /* @__PURE__ */ jsxRuntimeExports.jsx(ServiceAreaMapOverlay, {}),\n'
    '                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[2] bg-transparent group-hover:bg-black/10'
)
if iframe_new.split("ServiceAreaMapOverlay")[0] in b and "ServiceAreaMapOverlay, {}" in b:
    print("bundle jsx already patched")
elif iframe_close not in b:
    raise SystemExit("bundle map iframe block not found")
else:
    b = b.replace(iframe_close, iframe_new, 1)
    bp.write_text(b, encoding="utf-8", newline="\n")
    print("bundle ok")