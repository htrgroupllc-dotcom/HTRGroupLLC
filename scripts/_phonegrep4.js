const fs=require("fs");
const s=fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","utf8");
["$2","$3",""].forEach(suf=>{
  const ph="PHONE_HREF"+suf;
  const ch="COMPANY_PHONE_HREF"+suf;
  console.log(ph, s.includes(ph+" ="), ch, s.includes(ch+" ="));
});
const gi=s.indexOf("gallery");
console.log("gallery idx", gi);
