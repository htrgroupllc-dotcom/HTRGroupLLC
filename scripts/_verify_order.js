const fs=require("fs");
const s=fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","utf8");
let idx=0, bad=0, good=0;
while (true) {
  const a=s.indexOf("href: COMPANY_PHONE_HREF", idx);
  const b=s.indexOf("href: PHONE_HREF", idx);
  if (a===-1 && b===-1) break;
  if (a!==-1 && (b===-1 || a<b)) {
    const nextP=s.indexOf("href: PHONE_HREF", a);
    if (nextP!==-1 && nextP-a<1200) good++; else {}
    idx=a+10;
  } else {
    const nextC=s.indexOf("href: COMPANY_PHONE_HREF", b);
    if (nextC===-1 || nextC-b>1200) {}
    else { bad++; console.log("346 before 606 at", b); }
    idx=b+10;
  }
}
console.log("606-then-346 pairs nearby:", good, "346-before-606:", bad);
