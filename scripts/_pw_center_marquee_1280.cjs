const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";

function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      let p = path.join(dir, url === "/" ? "/index.html" : url);
      if (p.endsWith("/")) p += "index.html";
      fs.readFile(p, (err, data) => {
        if (err) { res.writeHead(404); return res.end("not found"); }
        const ext = path.extname(p);
        const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png" };
        res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
        res.end(data);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}

(async () => {
  const srv = await serve(root, 4178);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://127.0.0.1:4178/", { waitUntil: "networkidle", timeout: 120000 });
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const result = await page.evaluate(async () => {
    const section = document.querySelector(".htr-brand-marquee-center");
    const leftTrack = document.querySelector(".htr-brand-marquee-center__track--left");
    const rightTrack = document.querySelector(".htr-brand-marquee-center__track--right");
    const bottomMarquees = document.querySelectorAll(".htr-brand-marquee");
    const centerX = window.innerWidth / 2;

    const wingRects = () => {
      const leftWing = document.querySelector(".htr-brand-marquee-center__wing--left");
      const rightWing = document.querySelector(".htr-brand-marquee-center__wing--right");
      return {
        left: leftWing?.getBoundingClientRect(),
        right: rightWing?.getBoundingClientRect(),
      };
    };

    const visibleCards = (wingSel) => {
      const wing = document.querySelector(wingSel);
      if (!wing) return [];
      const wr = wing.getBoundingClientRect();
      return [...wing.querySelectorAll(".htr-brand-marquee-center__card")].filter((c) => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.right > wr.left && r.left < wr.right;
      }).map((c) => {
        const r = c.getBoundingClientRect();
        return { x: (r.left + r.right) / 2, left: r.left, right: r.right };
      });
    };

    const t0Left = visibleCards(".htr-brand-marquee-center__wing--left");
    const t0Right = visibleCards(".htr-brand-marquee-center__wing--right");
    const transform0 = {
      left: leftTrack ? getComputedStyle(leftTrack).transform : null,
      right: rightTrack ? getComputedStyle(rightTrack).transform : null,
    };

    await new Promise((r) => setTimeout(r, 2000));

    const t1Left = visibleCards(".htr-brand-marquee-center__wing--left");
    const t1Right = visibleCards(".htr-brand-marquee-center__wing--right");
    const transform1 = {
      left: leftTrack ? getComputedStyle(leftTrack).transform : null,
      right: rightTrack ? getComputedStyle(rightTrack).transform : null,
    };

    const wings = wingRects();
    const leftEdgeCards = t1Left.filter((c) => c.left < (wings.left?.left ?? 0) + 80);
    const rightEdgeCards = t1Right.filter((c) => c.right > (wings.right?.right ?? window.innerWidth) - 80);

    const avgDelta = (a0, a1) => {
      if (!a0.length || !a1.length) return null;
      const m0 = a0.reduce((s, c) => s + c.x, 0) / a0.length;
      const m1 = a1.reduce((s, c) => s + c.x, 0) / a1.length;
      return m1 - m0;
    };

    const leftDelta = avgDelta(t0Left, t1Left);
    const rightDelta = avgDelta(t0Right, t1Right);

    const centerCards = [...document.querySelectorAll(".htr-brand-marquee-center__card")].filter((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 0 && Math.abs((r.left + r.right) / 2 - centerX) < 60;
    });

    const img = document.querySelector(".htr-brand-marquee-center__card img");
    const stageW = document.querySelector(".htr-brand-marquee-center__stage")?.getBoundingClientRect().width || 0;

    return {
      sectionVisible: !!section && section.getBoundingClientRect().height > 40,
      stageFullWidth: Math.abs(stageW - window.innerWidth) < 16,
      leftJustify: leftTrack?.className.includes("justify-end"),
      rightJustify: rightTrack?.className.includes("justify-start"),
      animLeft: transform0.left !== transform1.left,
      animRight: transform0.right !== transform1.right,
      animationNames: {
        left: leftTrack ? getComputedStyle(leftTrack).animationName : null,
        right: rightTrack ? getComputedStyle(rightTrack).animationName : null,
      },
      leftMovesTowardCenter: leftDelta !== null && leftDelta > 2,
      rightMovesTowardCenter: rightDelta !== null && rightDelta < -2,
      hasLeftEdgeLogos: leftEdgeCards.length > 0 || t0Left.some((c) => c.left < 100),
      hasRightEdgeLogos: rightEdgeCards.length > 0 || t0Right.some((c) => c.right > window.innerWidth - 100),
      centerFadeZone: centerCards.length <= 2,
      centerFilter: img ? getComputedStyle(img).filter : null,
      bottomMarqueeCount: bottomMarquees.length,
      pass:
        !!section &&
        transform0.left !== transform1.left &&
        transform0.right !== transform1.right &&
        (leftDelta === null || leftDelta > 0) &&
        (rightDelta === null || rightDelta < 0),
    };
  });

  console.log(JSON.stringify(result, null, 2));
  const ok = result.pass && result.animLeft && result.animRight && result.leftJustify && result.rightJustify;
  console.log(ok ? "PASS" : "FAIL");
  await browser.close();
  srv.close();
  process.exit(ok ? 0 : 1);
})();
