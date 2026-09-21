/**
 * Patch published admin bundle: Calendar → New booking
 * adds Customer Email + Assigned Technician (source already updated).
 */
const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/admin-index-utf8-v4.js";
let t = fs.readFileSync(path, "utf8");

function must(from, to, label) {
  const n = t.split(from).length - 1;
  if (n < 1) {
    console.error("MISSING", label, "count", n);
    process.exit(1);
  }
  t = t.split(from).join(to);
  console.log("OK", label, "x" + n);
}

must(
  "function NI({open:t,mode:s,day:r,event:i,defaultBiz:u,showBizPicker:y,apiBase:T,authHeaders:d,actorMode:p,timeSlots:o,labels:A,onClose:h,onSaved:m})",
  "function NI({open:t,mode:s,day:r,event:i,defaultBiz:u,showBizPicker:y,apiBase:T,authHeaders:d,actorMode:p,timeSlots:o,employees:emps=[],labels:A,onClose:h,onSaved:m})",
  "NI signature",
);

must(
  '[X,J]=_.useState(""),[z,q]=_.useState(""),[ce,oe]=_.useState(""),[be,Se]=_.useState(""),[de,Be]=_.useState(""),[me,ke]=_.useState(!1),[ye,ie]=_.useState("time"),ve=_.useMemo(()=>EI(r),[r]),se=P==="dental"',
  '[X,J]=_.useState(""),[kE,setKE]=_.useState(""),[kA,setKA]=_.useState(""),[z,q]=_.useState(""),[ce,oe]=_.useState(""),[be,Se]=_.useState(""),[de,Be]=_.useState(""),[me,ke]=_.useState(!1),[ye,ie]=_.useState("time"),ve=_.useMemo(()=>EI(r),[r]),se=P==="dental"',
  "NI state",
);

must(
  'J(i.phone??""),q(i.address??"")',
  'J(i.phone??""),setKE(i.email??""),setKA(i.assigned_employee_id??""),q(i.address??"")',
  "NI edit hydrate",
);

must(
  'Q(""),J(""),q(""),oe(""),Se("")',
  'Q(""),J(""),setKE(""),setKA(""),q(""),oe(""),Se("")',
  "NI create reset",
);

must(
  'if(!D.trim()||!X.trim()||!C.trim()){Be(A.errNamePhone);return}ke(!0),Be("");try{const we=s==="edit"&&i?{id:i.id,name:D.trim(),phone:X.trim(),email:"",address:z.trim(),appliance:ce.trim(),date:ve,time:C.trim(),message:be.trim(),business_type:P}:{name:D.trim(),phone:X.trim(),email:"",address:z.trim(),appliance:ce.trim(),date:ve,time:C.trim(),message:be.trim(),business_type:P},Ye=await fetch',
  'if(!D.trim()||!X.trim()||!C.trim()){Be(A.errNamePhone);return}if(kE.trim()&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(kE.trim())){Be(A.errEmail||"Invalid email");return}ke(!0),Be("");try{const we=s==="edit"&&i?{id:i.id,name:D.trim(),phone:X.trim(),email:kE.trim(),address:z.trim(),appliance:ce.trim(),date:ve,time:C.trim(),message:be.trim(),business_type:P}:{name:D.trim(),phone:X.trim(),email:kE.trim(),address:z.trim(),appliance:ce.trim(),date:ve,time:C.trim(),message:be.trim(),business_type:P};p==="admin"&&(we.assigned_employee_id=kA||null);const Ye=await fetch',
  "NI submit",
);

must(
  'e.jsx(lm,{label:A.phoneReq,value:X,onChange:J,placeholder:"(346) 000-0000",type:"tel",required:!0}),e.jsx(lm,{label:A.address,value:z,onChange:q,placeholder:"123 Main St, Houston, TX"})',
  'e.jsx(lm,{label:A.phoneReq,value:X,onChange:J,placeholder:"(346) 000-0000",type:"tel",required:!0}),e.jsx(lm,{label:A.email||"Email",value:kE,onChange:setKE,placeholder:"customer@example.com",type:"email"}),e.jsx(lm,{label:A.address,value:z,onChange:q,placeholder:"123 Main St, Houston, TX"})',
  "NI email field",
);

must(
  'de&&e.jsx("p",{className:"text-xs text-red-500",children:de}),e.jsxs("div",{className:"flex gap-2 pt-1"',
  'p==="admin"&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-semibold text-stone-500 mb-1",children:A.assignTechnician||"Assigned Technician"}),e.jsxs("select",{value:kA,onChange:we=>setKA(we.target.value),className:"w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] bg-white",children:[e.jsx("option",{value:"",children:A.unassigned||"Unassigned"}),(Array.isArray(emps)?emps:[]).map(we=>e.jsx("option",{value:we.id,children:we.name},we.id))]})]}),de&&e.jsx("p",{className:"text-xs text-red-500",children:de}),e.jsxs("div",{className:"flex gap-2 pt-1"',
  "NI technician dropdown",
);

must(
  "timeSlots:Fu,labels:i.bookingForm,onClose:()=>Ve(!1)",
  "timeSlots:Fu,employees:R,labels:i.bookingForm,onClose:()=>Ve(!1)",
  "pass employees into form",
);

must(
  "phoneReq:r.calBookingPhoneReq,address:r.calBookingAddress",
  "phoneReq:r.calBookingPhoneReq,email:r.calBookingEmail,assignTechnician:r.calBookingAssignTech,unassigned:r.calBookingUnassigned,errEmail:r.calBookingErrEmail,address:r.calBookingAddress",
  "admin bookingForm labels",
);

must(
  'phoneReq:r("calBookingPhoneReq"),address:r("calBookingAddress")',
  'phoneReq:r("calBookingPhoneReq"),email:r("calBookingEmail"),assignTechnician:r("calBookingAssignTech"),unassigned:r("calBookingUnassigned"),errEmail:r("calBookingErrEmail"),address:r("calBookingAddress")',
  "employee bookingForm labels",
);

const packs = [
  ['calBookingPhoneReq:"Телефон *",calBookingAddress:"Адрес"', 'calBookingPhoneReq:"Телефон *",calBookingEmail:"Электронная почта",calBookingAssignTech:"Назначить техника",calBookingUnassigned:"Назначить позже",calBookingErrEmail:"Некорректный email",calBookingAddress:"Адрес"'],
  ['calBookingPhoneReq:"Phone *",calBookingAddress:"Address"', 'calBookingPhoneReq:"Phone *",calBookingEmail:"Email",calBookingAssignTech:"Assigned Technician",calBookingUnassigned:"Assign later",calBookingErrEmail:"Invalid email",calBookingAddress:"Address"'],
  ['calBookingPhoneReq:"Телефон *",calBookingAddress:"Адреса"', 'calBookingPhoneReq:"Телефон *",calBookingEmail:"Електронна пошта",calBookingAssignTech:"Призначити техніка",calBookingUnassigned:"Призначити пізніше",calBookingErrEmail:"Некоректний email",calBookingAddress:"Адреса"'],
  ['calBookingPhoneReq:"Telefon *",calBookingAddress:"Adres"', 'calBookingPhoneReq:"Telefon *",calBookingEmail:"E-posta",calBookingAssignTech:"Teknisyen ata",calBookingUnassigned:"Daha sonra ata",calBookingErrEmail:"Geçersiz e-posta",calBookingAddress:"Adres"'],
  ['calBookingPhoneReq:"Telefon *",calBookingAddress:"Ünvan"', 'calBookingPhoneReq:"Telefon *",calBookingEmail:"E-poçt",calBookingAssignTech:"Texnik təyin et",calBookingUnassigned:"Sonra təyin et",calBookingErrEmail:"Yanlış e-poçt",calBookingAddress:"Ünvan"'],
];
for (const [from, to] of packs) must(from, to, from.slice(0, 40));

if (!t.includes('placeholder:"customer@example.com",type:"email"')) {
  console.error("email field missing after patch");
  process.exit(1);
}
if (!t.includes("we.assigned_employee_id=kA||null")) {
  console.error("assign submit missing");
  process.exit(1);
}
if (t.includes('phone:X.trim(),email:""')) {
  console.error("empty email submit still present");
  process.exit(1);
}

fs.writeFileSync(path, t);
console.log("patched", path, "bytes", t.length);
