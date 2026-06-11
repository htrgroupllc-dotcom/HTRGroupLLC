const fs=require("fs");
const p="C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
const s=fs.readFileSync(p,"utf8");
for (const k of ["660-6067","820-6021","htr-phone-pair","COMPANY_PHONE","16066606067","13468206021"]) {
  let n=0, idx=0;
  while ((idx=s.indexOf(k,idx))!==-1) { n++; idx+=k.length; }
  console.log(k, n);
}
const i=s.indexOf("820-6021");
console.log("---ctx---");
console.log(s.slice(i-300,i+500));
