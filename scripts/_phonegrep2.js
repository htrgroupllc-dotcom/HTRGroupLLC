const fs=require("fs");
const s=fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","utf8");
const keys=["COMPANY_PHONE_HREF","COMPANY_PHONE_DISPLAY","PHONE_HREF$3","function PhonePair"];
for (const k of keys) {
  let idx=0, n=0;
  while ((idx=s.indexOf(k,idx))!==-1) { if(n<3) console.log(k,"@",idx); n++; idx+=k.length; }
  console.log(k,"count",n);
}
// find snippet with both tel links adjacent
const re=/COMPANY_PHONE_HREF[^]{0,80}PHONE_HREF|PHONE_HREF[^]{0,200}COMPANY_PHONE_HREF/g;
let m; let c=0;
while ((m=re.exec(s)) && c<5) { console.log("---match",c,"---"); console.log(m[0].slice(0,350)); c++; }
