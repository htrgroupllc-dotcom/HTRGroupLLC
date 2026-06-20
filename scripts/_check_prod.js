async function main() {
  const home = await (await fetch("https://htrgrouptx.com/")).text();
  const ref = home.match(/index-utf8-v4\.js\?v=\d+/);
  console.log("prod homepage bundle:", ref?.[0] ?? "not found");

  const gh = await (await fetch("https://raw.githubusercontent.com/htrgroupllc-dotcom/HTRGroupLLC/main/index.html")).text();
  const ghRef = gh.match(/index-utf8-v4\.js\?v=\d+/);
  console.log("github main bundle:", ghRef?.[0] ?? "not found");

  const bundle = await (await fetch("https://htrgrouptx.com/assets/index-utf8-v4.js?v=99")).text();
  const s = bundle.indexOf("const svcDryerImg");
  console.log("prod bundle snippet:", bundle.slice(s, s + 500));
}
main().catch(console.error);
