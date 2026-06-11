const fs=require('fs');
const src='C:/Projects/HTRGroupLLC/assets/index-Wa5559554342-v2.js';
const dst='C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js';
const t=fs.readFileSync(src,'utf8');
const fixed=Buffer.from(t,'latin1').toString('utf8');
fs.writeFileSync(dst, fixed, 'utf8');
const samples=['Настройки','Пароль','Выберите хотя бы один файл','Фильтр по сотруднику'];
for (const s of samples) console.log(s, fixed.includes(s));
console.log('size', fixed.length);
