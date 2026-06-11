const https = require("https");
function get(u) {
  return new Promise((res, rej) =>
    https.get(u, (r) => {
      let d = "";
      r.on("data", (c) => (d += c));
      r.on("end", () => res(d));
    }).on("error", rej)
  );
}
(async () => {
  const js = await get("https://htrgrouptx.com/assets/index-utf8-v4.js");
  const key = 'id: "brands"';
  const idx = js.indexOf(key);
  console.log("brands idx", idx);
  const slice = js.slice(idx, idx + 2000);
  console.log("DraggableMarquee count", (slice.match(/DraggableMarquee/g) || []).length);
  console.log("reverse true", slice.includes("reverse: true"));
  console.log(slice);
})();
