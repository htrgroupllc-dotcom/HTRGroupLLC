const fs=require('fs');
const t=fs.readFileSync('C:/Projects/HTRGroupLLC/assets/index-Wa5559554342-v2.js','utf8');
const idx=t.indexOf('if (upFiles.length === 0)');
const slice=t.slice(idx, idx+120);
console.log(JSON.stringify(slice));
function tryFix(s){
  try {
    return Buffer.from(s,'latin1').toString('utf8');
  } catch(e){ return null; }
}
const m=slice.match(/setUpError\("([^"]+)"/);
if(m){
  const fixed=tryFix(m[1]);
  console.log('fixed:', JSON.stringify(fixed));
  for(const ch of fixed||[]){
    const c=ch.charCodeAt(0);
    if(c<32 || c===0x85) console.log('ctrl', c);
  }
}
