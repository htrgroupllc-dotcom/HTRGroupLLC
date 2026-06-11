const fs=require('fs');
const t=fs.readFileSync('C:/Projects/HTRGroupLLC/assets/index-Wa5559554342-v2.js','utf8');
try {
  const fixed=t.encodeLatin1?.() || Buffer.from(t,'latin1').toString('utf8');
  console.log('whole file ok', fixed.includes('Настройки'), fixed.length);
} catch(e) {
  console.log('whole file fail', e.message);
}
let fail=0;
for (let i=0;i<t.length;i++){
  const c=t.charCodeAt(i);
  if (c>255) { fail++; if(fail<5) console.log('>255', i, c.toString(16)); }
}
console.log('chars>255', fail);
