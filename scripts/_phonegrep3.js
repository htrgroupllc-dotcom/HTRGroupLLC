const fs=require("fs");
const s=fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","utf8");
// sitePhones block in home section
const i=s.indexOf('const PHONE_DISPLAY$3');
console.log(s.slice(i, i+250));
const pairs=[];
let idx=0;
const pat1="href: PHONE_HREF";
const pat2="href: COMPANY_PHONE_HREF";
while (true) {
  const a=s.indexOf(pat1, idx);
  const b=s.indexOf(pat2, idx);
  if (a===-1 && b===-1) break;
  if (a!==-1 && (b===-1 || a<b)) {
    const nextB=s.indexOf(pat2, a);
    if (nextB!==-1 && nextB-a<800) pairs.push({order:"346 then 606", pos:a, snippet:s.slice(a, nextB+120)});
    idx=a+pat1.length;
  } else {
    const nextA=s.indexOf(pat1, b);
    if (nextA!==-1 && nextA-b<800) pairs.push({order:"606 then 346", pos:b, snippet:s.slice(b, nextA+120)});
    idx=b+pat2.length;
  }
  if (pairs.length>=8) break;
}
pairs.forEach((p,i)=>{console.log("\n#"+i,p.order); console.log(p.snippet.slice(0,400));});
console.log("total nearby pairs found", pairs.length);
