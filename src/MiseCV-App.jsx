import { useState, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronUp, Download, FileText, Loader2, RotateCcw, Lock, Check, FileEdit, Zap } from "lucide-react";

/* ============================================================
   FONTS
   ============================================================ */
const NUNITO    = '"Nunito", "Helvetica Neue", Arial, sans-serif';
const LATO      = '"Lato", "Helvetica Neue", Arial, sans-serif';
const RALEWAY   = '"Raleway", "Helvetica Neue", Arial, sans-serif';
const JOSEFIN   = '"Josefin Sans", "Helvetica Neue", Arial, sans-serif';
const PLAYFAIR  = '"Playfair Display", Georgia, "Times New Roman", serif';
const CORMORANT = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
const INTER     = '"Inter", "Helvetica Neue", Arial, sans-serif';
const DM_SANS   = '"DM Sans", "Helvetica Neue", Arial, sans-serif';

/* ============================================================
   HELPERS
   ============================================================ */
const h2r = (hex, a) => {
  const h=(hex||"#000").replace("#","");
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
};
const lighten = (hex, pct) => {
  const h=(hex||"#000").replace("#","");
  const r=Math.min(255,parseInt(h.slice(0,2),16)+Math.round(255*pct));
  const g=Math.min(255,parseInt(h.slice(2,4),16)+Math.round(255*pct));
  const b=Math.min(255,parseInt(h.slice(4,6),16)+Math.round(255*pct));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
};
const hexToRtf = hex => { const h=(hex||"#000").replace("#",""); return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}; };
const rtfEsc = s => { if(s==null)return""; return String(s).replace(/\\/g,"\\\\").replace(/\{/g,"\\{").replace(/\}/g,"\\}").replace(/[\u0080-\uFFFF]/g,c=>`\\u${c.charCodeAt(0)}?`).replace(/\n/g,"\\line "); };
const dlBlob = (blob,fn) => { const u=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=u; a.download=fn; a.style.display="none"; document.body.appendChild(a); a.click(); setTimeout(()=>{a.parentNode?.removeChild(a);URL.revokeObjectURL(u);},1500); };

/* ============================================================
   DATA
   ============================================================ */
const EMPTY = {
  name:"",
  contact:{ email:"", phone:"", location:"", linkedin:"", website:"" },
  summary:"",
  specialties:[],
  experience:[],
  signature:[],
  education:[],
  certifications:[],
  skills:[],
  awards:[],
};

const SAMPLE = {
  name:"Daniel Rossi",
  contact:{ email:"daniel.rossi@email.com", phone:"+61 412 774 533", location:"Melbourne, VIC", linkedin:"linkedin.com/in/danielrossi-chef", website:"danielrossi.com.au" },
  summary:"Executive Chef with 15 years of experience across Italy and Australia, specialising in modern Italian-Australian cuisine driven by seasonal, locally-sourced produce. Known for building high-performing kitchen brigades and translating creative vision into consistently excellent dining experiences.",
  specialties:["Modern Italian","Modern Australian","Wood-Fire Cooking","Housemade Pasta","Charcuterie","Fermentation","Tasting Menus","Seasonal Produce"],
  experience:[
    { title:"Executive Chef", venue:"Ember & Stone Restaurant", location:"Melbourne, VIC", start:"Mar 2020", end:"Present", covers:"80 covers", type:"Fine Dining",
      bullets:[
        "Lead a 12-person kitchen brigade at a 1-hat fine dining restaurant, overseeing all menu development, food cost management (maintained 28% food cost), and kitchen operations.",
        "Introduced a quarterly seasonal tasting menu that became the restaurant's highest-revenue offering, averaging 95% occupancy on tasting menu nights.",
        "Reduced food waste by 35% through a nose-to-tail program and in-house fermentation and preserving initiative.",
        "Mentored 4 junior chefs who have gone on to senior positions at Melbourne's top restaurants.",
      ]},
    { title:"Head Chef", venue:"Piccolo Osteria", location:"Fitzroy, VIC", start:"Jul 2016", end:"Feb 2020", covers:"65 covers", type:"Italian Restaurant",
      bullets:[
        "Developed a regional Italian menu concept focused on housemade pasta and handcrafted charcuterie, earning a coveted mention in The Age Good Food Guide 2019.",
        "Managed full kitchen operations including staff scheduling, supplier negotiations, and HACCP compliance for a team of 8.",
        "Grew the private dining revenue stream from zero to $180,000 annually within 18 months.",
      ]},
    { title:"Sous Chef", venue:"Tipo 00", location:"Melbourne, VIC", start:"Jan 2014", end:"Jun 2016", covers:"50 covers", type:"Pasta Bar",
      bullets:[
        "Developed daily pasta varieties and supported head chef in menu creation for the critically acclaimed pasta bar.",
        "Maintained food quality and kitchen standards during high-volume service of up to 180 covers per night.",
      ]},
  ],
  signature:[
    { dish:"Wagyu tartare, fermented mushroom, black truffle, egg yolk", note:"Signature entrée — on the menu for 3 years by popular demand" },
    { dish:"Hand-rolled pappardelle, slow-braised Gippsland lamb shoulder, salsa verde", note:"Featured in Gourmet Traveller Australia (2023)" },
    { dish:"Miso-cured kingfish, daikon, yuzu, finger lime", note:"Current tasting menu highlight" },
  ],
  education:[
    { degree:"Diploma of Hospitality (Commercial Cookery)", school:"William Angliss Institute", location:"Melbourne, VIC", date:"2009" },
    { degree:"Stage — Ristorante Cracco", school:"Milan, Italy", location:"", date:"2011–2012", notes:"Full-time stage under Chef Carlo Cracco" },
  ],
  certifications:[
    { name:"Food Safety Supervisor Certificate", issuer:"SafeFood NSW", date:"2024" },
    { name:"WSET Level 2 Award in Wines", issuer:"Wine & Spirit Education Trust", date:"2021" },
    { name:"Responsible Service of Alcohol (RSA)", issuer:"VCGLR", date:"Current" },
  ],
  skills:["Menu Development","Kitchen Brigade Management","Food Cost Control","HACCP Compliance","Supplier Negotiation","Tasting Menu Design","Staff Training & Mentoring","Inventory Management"],
  awards:[
    "The Age Good Food Guide — One Chef's Hat, Ember & Stone (2022, 2023, 2024)",
    "Gourmet Traveller Australia — Best New Restaurant Finalist (2021)",
    "Good Food Guide — Best New Talent, Melbourne (2020)",
  ],
};

/* ============================================================
   COVER LETTER DATA
   ============================================================ */
const EMPTY_CL = {
  senderName:"", senderTitle:"", senderEmail:"", senderPhone:"", senderLocation:"", senderWebsite:"",
  recipientName:"", recipientTitle:"", company:"", companyAddress:"", date:"",
  opening:"", body1:"", body2:"", body3:"", closing:"",
};

const SAMPLE_CL = {
  senderName:"Daniel Rossi",
  senderTitle:"Executive Chef — Modern Italian-Australian",
  senderEmail:"daniel.rossi@email.com",
  senderPhone:"+61 412 774 533",
  senderLocation:"Melbourne, VIC",
  senderWebsite:"danielrossi.com.au",
  recipientName:"Sophie Laurent",
  recipientTitle:"Restaurant Director",
  company:"Icebergs Dining Room & Bar",
  companyAddress:"1 Notts Ave, Bondi Beach NSW 2026",
  date:"June 18, 2026",
  opening:"There is a version of Italian-Australian cooking that most restaurants never find — the one that sits comfortably between the two traditions without apologising for either. Icebergs has been doing exactly that for twenty years, and the chance to lead that kitchen is one I find genuinely compelling.",
  body1:"At Ember & Stone I have held a one-hat kitchen for three consecutive years, built a team of twelve from the ground up, and reduced food cost to 28% without ever compromising what lands on the plate. The tasting menu I introduced in 2021 now accounts for 40% of the restaurant's revenue. Before that, at Piccolo Osteria, I grew a private dining programme from zero to $180,000 annually and earned a Good Food Guide mention in our first year under my direction. These aren't the results of luck — they come from a very clear idea of what a dining room should feel like and the discipline to execute it consistently.",
  body2:"What draws me to Icebergs specifically is the integrity of the product over time. You have never chased trends or compromised the view for a gimmick. That kind of restraint is rare, and it is the same philosophy I bring to a menu. I also have a deep personal connection to the style of cooking you are known for — my training in Milan and my years working with Victorian produce have left me equally comfortable with a perfect plate of pasta and a dish built entirely around what arrived that morning.",
  body3:"I would welcome the opportunity to cook for you, walk you through my current menu, or simply have a conversation about what you are looking for in this role. I am available to relocate to Sydney immediately.",
  closing:"Thank you for your time — I hope to hear from you.",
};

/* ============================================================
   TEMPLATES
   ============================================================ */
const TEMPLATES = [
  { id:"mise-en-place", label:"Mise en Place", blurb:"Dark warm sidebar, cuisine chips, clean right column.",     accent:"#2C1810", accent2:"#C4622D", layout:"mise-en-place", nameFont:RALEWAY,   bodyFont:LATO,     swatch:["#2C1810","#C4622D"] },
  { id:"brigade",       label:"Brigade",       blurb:"Bold dark header like a restaurant signboard.",             accent:"#1A1A1A", accent2:"#C4622D", layout:"brigade",       nameFont:JOSEFIN,  bodyFont:LATO,     swatch:["#1A1A1A","#C4622D"] },
  { id:"maitre",        label:"Maître",        blurb:"Elegant centred serif header for fine dining & hotel mgmt.",accent:"#2C1810", accent2:"#C4622D", layout:"maitre",        nameFont:PLAYFAIR, bodyFont:CORMORANT,swatch:["#2C1810","#D4A96A"] },
  { id:"artisan",       label:"Artisan",       blurb:"Copper left accent strip, skills forward, warm feel.",      accent:"#C4622D", accent2:null,       layout:"artisan",       nameFont:RALEWAY,  bodyFont:DM_SANS,  swatch:["#C4622D","#FAF6EF"] },
  { id:"grand-cru",     label:"Grand Cru",     blurb:"Full dark header, copper rule, senior F&B directors.",     accent:"#0F1A0F", accent2:"#C4622D", layout:"grand-cru",     nameFont:PLAYFAIR, bodyFont:LATO,     swatch:["#0F1A0F","#C4622D"] },
  { id:"station",       label:"Station",       blurb:"ATS-safe single column, works for all levels.",            accent:"#2C1810", accent2:null,       layout:"station",       nameFont:RALEWAY,  bodyFont:LATO,     swatch:["#2C1810","#F0E8DF"] },
];

const ACCENT_PRESETS = [
  "#2C1810","#1A1A1A","#0F1A0F","#6B1D2A","#C4622D","#D4890A","#2D4A3E","#1B3B4F","#4A3520","#333333"
];

/* ============================================================
   SHARED RESUME COMPONENTS
   ============================================================ */
function CuisineChip({ label, accent, bg, bodyFont }) {
  return <span style={{ fontFamily:bodyFont, fontSize:"8pt", background:bg||h2r(accent,0.1), color:accent, padding:"0.025in 0.1in", border:`1px solid ${h2r(accent,0.25)}`, fontWeight:600, letterSpacing:"0.03em" }}>{label}</span>;
}

function SecHead({ children, accent, copper, bodyFont, style={} }) {
  return (
    <div style={{ marginTop:"0.18in", marginBottom:"0.08in", display:"flex", alignItems:"center", gap:"0.1in", breakAfter:"avoid", pageBreakAfter:"avoid", ...style }}>
      {copper && <div style={{ width:"0.22in", height:"2px", background:copper, flexShrink:0 }} />}
      <div style={{ fontFamily:bodyFont, fontSize:"8.5pt", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:accent, flex:1 }}>{children}</div>
      <div style={{ flex:1, height:"1px", background:h2r(accent,0.2) }} />
    </div>
  );
}

function ExpBlock({ exp, accent, copper, bodyFont, i, total }) {
  return (
    <div style={{ marginBottom:i===total-1?"0":"0.14in", breakInside:"avoid", pageBreakInside:"avoid" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:"0.15in", flexWrap:"wrap" }}>
        <div style={{ fontFamily:bodyFont, fontWeight:700, fontSize:"10.5pt", color:"#111" }}>
          {exp.title}
          {exp.venue&&<span style={{ fontWeight:400, color:"#555" }}> — {exp.venue}</span>}
          {exp.location&&<span style={{ fontWeight:400, color:"#888", fontSize:"9.5pt" }}>, {exp.location}</span>}
        </div>
        <div style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#777", whiteSpace:"nowrap", flexShrink:0 }}>{[exp.start,exp.end].filter(Boolean).join(" – ")}</div>
      </div>
      {(exp.type||exp.covers)&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:copper||accent, fontWeight:600, marginTop:"0.02in" }}>{[exp.type, exp.covers&&`${exp.covers}`].filter(Boolean).join(" · ")}</div>}
      {(exp.bullets||[]).length>0&&<ul style={{ margin:"0.04in 0 0", paddingLeft:"0.2in" }}>{exp.bullets.map((b,j)=><li key={j} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#222", marginBottom:"0.025in", lineHeight:1.6, breakInside:"avoid", pageBreakInside:"avoid" }}>{b}</li>)}</ul>}
    </div>
  );
}

/* ============================================================
   LAYOUT: MISE EN PLACE (dark warm sidebar)
   ============================================================ */
function LayoutMiseEnPlace({ data, accent, accent2, nameFont, bodyFont }) {
  const copper = accent2||"#C4622D";
  const ci = [data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.linkedin,data.contact?.website].filter(Boolean);
  return (
    <div style={{ width:"8.5in", background:"#FAFAF7", fontFamily:bodyFont, boxSizing:"border-box", display:"flex", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.22)" }}>
      <div style={{ width:"2.6in", background:accent, padding:"0.5in 0.32in", boxSizing:"border-box", flexShrink:0 }}>
        <div style={{ fontFamily:nameFont, fontSize:"18pt", fontWeight:800, color:"#fff", lineHeight:1.2, letterSpacing:"0.04em", wordBreak:"break-word", textTransform:"uppercase" }}>{data.name||"Your Name"}</div>
        {data.contact?.location&&<div style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:h2r(copper,0.9), marginTop:"0.07in", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", fontSize:"8pt" }}>{data.contact.location}</div>}
        {data.specialties?.length>0&&<div style={{ marginTop:"0.18in", borderTop:`1px solid ${h2r(copper,0.35)}`, paddingTop:"0.15in" }}>
          <div style={{ fontFamily:bodyFont, fontSize:"7pt", textTransform:"uppercase", letterSpacing:"0.2em", color:h2r(copper,0.85), fontWeight:700, marginBottom:"0.1in" }}>Specialties</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.05in" }}>{data.specialties.map((s,i)=><span key={i} style={{ fontFamily:bodyFont, fontSize:"7.5pt", background:h2r(copper,0.2), color:"rgba(255,255,255,0.95)", padding:"0.025in 0.09in", border:`1px solid ${h2r(copper,0.4)}`, fontWeight:500 }}>{s}</span>)}</div>
        </div>}
        <div style={{ marginTop:"0.18in", borderTop:`1px solid ${h2r(copper,0.35)}`, paddingTop:"0.15in" }}>
          <div style={{ fontFamily:bodyFont, fontSize:"7pt", textTransform:"uppercase", letterSpacing:"0.2em", color:h2r(copper,0.85), fontWeight:700, marginBottom:"0.1in" }}>Contact</div>
          {ci.map((v,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"8pt", color:"rgba(255,255,255,0.82)", marginBottom:"0.05in", wordBreak:"break-word", lineHeight:1.4 }}>{v}</div>)}
        </div>
        {data.skills?.length>0&&<div style={{ marginTop:"0.18in", borderTop:`1px solid ${h2r(copper,0.35)}`, paddingTop:"0.15in" }}>
          <div style={{ fontFamily:bodyFont, fontSize:"7pt", textTransform:"uppercase", letterSpacing:"0.2em", color:h2r(copper,0.85), fontWeight:700, marginBottom:"0.08in" }}>Skills</div>
          {data.skills.map((s,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"8pt", color:"rgba(255,255,255,0.82)", marginBottom:"0.04in", display:"flex", alignItems:"center", gap:"0.07in" }}><span style={{ width:"4px", height:"4px", background:copper, borderRadius:"50%", flexShrink:0, display:"inline-block" }}/>{s}</div>)}
        </div>}
        {data.certifications?.length>0&&<div style={{ marginTop:"0.18in", borderTop:`1px solid ${h2r(copper,0.35)}`, paddingTop:"0.15in" }}>
          <div style={{ fontFamily:bodyFont, fontSize:"7pt", textTransform:"uppercase", letterSpacing:"0.2em", color:h2r(copper,0.85), fontWeight:700, marginBottom:"0.08in" }}>Certifications</div>
          {data.certifications.map((c,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"7.5pt", color:"rgba(255,255,255,0.82)", marginBottom:"0.07in" }}><div style={{ fontWeight:600 }}>{c.name}</div>{c.issuer&&<div style={{ color:"rgba(255,255,255,0.55)" }}>{c.issuer}</div>}{c.date&&<div style={{ color:h2r(copper,0.85) }}>{c.date}</div>}</div>)}
        </div>}
        {data.education?.length>0&&<div style={{ marginTop:"0.18in", borderTop:`1px solid ${h2r(copper,0.35)}`, paddingTop:"0.15in" }}>
          <div style={{ fontFamily:bodyFont, fontSize:"7pt", textTransform:"uppercase", letterSpacing:"0.2em", color:h2r(copper,0.85), fontWeight:700, marginBottom:"0.08in" }}>Training</div>
          {data.education.map((ed,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"7.5pt", color:"rgba(255,255,255,0.82)", marginBottom:"0.08in" }}><div style={{ fontWeight:600 }}>{ed.degree}</div>{ed.school&&<div style={{ color:"rgba(255,255,255,0.6)" }}>{ed.school}</div>}{ed.date&&<div style={{ color:"rgba(255,255,255,0.45)" }}>{ed.date}</div>}</div>)}
        </div>}
      </div>
      <div style={{ flex:1, padding:"0.5in 0.45in 0.6in 0.4in", boxSizing:"border-box" }}>
        {data.summary&&<div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#444", lineHeight:1.7, marginBottom:"0.15in", paddingBottom:"0.15in", borderBottom:`1px solid ${h2r(accent,0.1)}`, fontStyle:"italic" }}>{data.summary}</div>}
        {data.experience?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont} style={{ marginTop:0 }}>Experience</SecHead>{data.experience.map((exp,i)=><ExpBlock key={i} exp={exp} accent={accent} copper={copper} bodyFont={bodyFont} i={i} total={data.experience.length}/>)}</>}
        {data.signature?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Signature Dishes</SecHead>{data.signature.map((s,i)=><div key={i} style={{ marginBottom:"0.1in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#111", fontStyle:"italic", fontWeight:500 }}>{s.dish}</div>{s.note&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:copper, marginTop:"0.02in" }}>{s.note}</div>}</div>)}</>}
        {data.awards?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Awards &amp; Recognition</SecHead>{data.awards.map((a,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333", marginBottom:"0.05in", paddingLeft:"0.12in", borderLeft:`2px solid ${h2r(copper,0.5)}` }}>{a}</div>)}</>}
      </div>
    </div>
  );
}

/* ============================================================
   LAYOUT: BRIGADE (bold dark header, restaurant signboard)
   ============================================================ */
function LayoutBrigade({ data, accent, accent2, nameFont, bodyFont }) {
  const copper = accent2||"#C4622D";
  const ci = [data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.website].filter(Boolean);
  return (
    <div style={{ width:"8.5in", background:"#FAF9F6", fontFamily:bodyFont, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.22)" }}>
      <div style={{ background:accent, padding:"0.42in 0.7in 0.35in", boxSizing:"border-box", position:"relative" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"4px", background:copper }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:h2r(copper,0.5) }} />
        <h1 style={{ fontFamily:nameFont, fontSize:"34pt", fontWeight:700, color:"#fff", margin:0, lineHeight:1.05, letterSpacing:"0.12em", textTransform:"uppercase" }}>{data.name||"Your Name"}</h1>
        {data.specialties?.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:"0.05in", marginTop:"0.1in" }}>{data.specialties.map((s,i)=><span key={i} style={{ fontFamily:bodyFont, fontSize:"7.5pt", background:h2r(copper,0.25), color:"rgba(255,255,255,0.95)", padding:"0.025in 0.1in", border:`1px solid ${h2r(copper,0.5)}`, fontWeight:600, letterSpacing:"0.04em" }}>{s}</span>)}</div>}
        <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"8.5pt", marginTop:"0.1in", fontFamily:bodyFont, letterSpacing:"0.04em" }}>{ci.join("  ·  ")}</div>
      </div>
      <div style={{ padding:"0.35in 0.7in 0.6in", boxSizing:"border-box" }}>
        {data.summary&&<div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#444", lineHeight:1.7, marginBottom:"0.18in", paddingLeft:"0.15in", borderLeft:`3px solid ${copper}`, fontStyle:"italic" }}>{data.summary}</div>}
        {data.experience?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont} style={{ marginTop:0 }}>Experience</SecHead>{data.experience.map((exp,i)=><ExpBlock key={i} exp={exp} accent={accent} copper={copper} bodyFont={bodyFont} i={i} total={data.experience.length}/>)}</>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.4in", marginTop:"0.15in" }}>
          <div>
            {data.signature?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont} style={{ marginTop:0 }}>Signature Dishes</SecHead>{data.signature.map((s,i)=><div key={i} style={{ marginBottom:"0.09in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#222", fontStyle:"italic", fontWeight:500 }}>{s.dish}</div>{s.note&&<div style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:copper }}>{s.note}</div>}</div>)}</>}
            {data.education?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Training &amp; Education</SecHead>{data.education.map((ed,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333", marginBottom:"0.08in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontWeight:700 }}>{ed.degree}</div><div style={{ color:"#666" }}>{ed.school}{ed.date&&<span style={{ color:copper }}> · {ed.date}</span>}</div>{ed.notes&&<div style={{ fontStyle:"italic", color:"#888", fontSize:"9pt" }}>{ed.notes}</div>}</div>)}</>}
          </div>
          <div>
            {data.skills?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont} style={{ marginTop:0 }}>Skills</SecHead><div style={{ display:"flex", flexWrap:"wrap", gap:"0.05in" }}>{data.skills.map((s,i)=><span key={i} style={{ fontFamily:bodyFont, fontSize:"8pt", background:h2r(accent,0.07), color:accent, padding:"0.025in 0.09in", border:`1px solid ${h2r(accent,0.15)}`, fontWeight:600 }}>{s}</span>)}</div></>}
            {data.certifications?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Certifications</SecHead>{data.certifications.map((c,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#333", marginBottom:"0.07in", breakInside:"avoid", pageBreakInside:"avoid" }}><span style={{ fontWeight:700 }}>{c.name}</span>{c.date&&<span style={{ color:copper }}> ({c.date})</span>}</div>)}</>}
            {data.awards?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Awards</SecHead>{data.awards.map((a,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#333", marginBottom:"0.05in" }}>{a}</div>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LAYOUT: MAÎTRE (elegant centred serif, fine dining/hotel)
   ============================================================ */
function LayoutMaitre({ data, accent, accent2, nameFont, bodyFont }) {
  const copper = accent2||"#D4A96A";
  const ci = [data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.linkedin,data.contact?.website].filter(Boolean);
  return (
    <div style={{ width:"8.5in", background:"#FEFDFB", fontFamily:bodyFont, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.14)" }}>
      <div style={{ padding:"0.58in 0.85in 0.28in", boxSizing:"border-box", textAlign:"center" }}>
        <h1 style={{ fontFamily:nameFont, fontSize:"32pt", fontWeight:400, color:"#1c1c1c", margin:0, lineHeight:1.1, letterSpacing:"0.04em" }}>{data.name||"Your Name"}</h1>
        {data.specialties?.length>0&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:copper, marginTop:"0.08in", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600 }}>{data.specialties.slice(0,5).join("  ·  ")}</div>}
        {ci.length>0&&<div style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:"#888", marginTop:"0.1in", letterSpacing:"0.02em" }}>{ci.join("  ·  ")}</div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.15in", marginTop:"0.2in" }}>
          <div style={{ flex:1, height:"1px", background:h2r(accent,0.15) }} />
          <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
            <div style={{ width:"4px", height:"4px", background:copper, transform:"rotate(45deg)" }} />
            <div style={{ width:"8px", height:"8px", background:copper, transform:"rotate(45deg)" }} />
            <div style={{ width:"4px", height:"4px", background:copper, transform:"rotate(45deg)" }} />
          </div>
          <div style={{ flex:1, height:"1px", background:h2r(accent,0.15) }} />
        </div>
      </div>
      <div style={{ padding:"0.2in 0.85in 0.6in", boxSizing:"border-box" }}>
        {data.summary&&<div style={{ fontFamily:bodyFont, fontSize:"10.5pt", color:"#555", lineHeight:1.72, marginBottom:"0.18in", textAlign:"center", fontStyle:"italic", maxWidth:"5.5in", margin:"0 auto 0.18in" }}>{data.summary}</div>}
        {data.experience?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Professional Experience</SecHead>{data.experience.map((exp,i)=><ExpBlock key={i} exp={exp} accent={accent} copper={copper} bodyFont={bodyFont} i={i} total={data.experience.length}/>)}</>}
        {data.signature?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Signature Creations</SecHead>{data.signature.map((s,i)=><div key={i} style={{ marginBottom:"0.09in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:nameFont, fontSize:"10.5pt", color:"#222", fontStyle:"italic" }}>{s.dish}</div>{s.note&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:copper, marginTop:"0.02in" }}>{s.note}</div>}</div>)}</>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.4in" }}>
          <div>
            {data.education?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Training</SecHead>{data.education.map((ed,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333", marginBottom:"0.09in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontWeight:700 }}>{ed.degree}</div><div style={{ color:"#666" }}>{ed.school}{ed.date&&<span style={{ color:copper }}> · {ed.date}</span>}</div>{ed.notes&&<div style={{ fontStyle:"italic", color:"#888", fontSize:"9pt" }}>{ed.notes}</div>}</div>)}</>}
            {data.certifications?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Certifications</SecHead>{data.certifications.map((c,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#333", marginBottom:"0.06in" }}><span style={{ fontWeight:600 }}>{c.name}</span>{c.date&&<span style={{ color:copper }}> ({c.date})</span>}</div>)}</>}
          </div>
          <div>
            {data.skills?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Skills &amp; Expertise</SecHead>{data.skills.map((s,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#444", marginBottom:"0.04in", display:"flex", alignItems:"center", gap:"0.07in" }}><span style={{ width:"4px", height:"4px", background:copper, transform:"rotate(45deg)", flexShrink:0, display:"inline-block" }}/>{s}</div>)}</>}
            {data.awards?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Awards</SecHead>{data.awards.map((a,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#333", marginBottom:"0.05in" }}>{a}</div>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LAYOUT: ARTISAN (copper left strip, warm, skills forward)
   ============================================================ */
function LayoutArtisan({ data, accent, nameFont, bodyFont }) {
  const ci = [data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.linkedin,data.contact?.website].filter(Boolean);
  return (
    <div style={{ width:"8.5in", background:"#FAF8F4", fontFamily:bodyFont, boxSizing:"border-box", display:"flex", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.15)" }}>
      <div style={{ width:"0.16in", background:accent, flexShrink:0 }} />
      <div style={{ flex:1, padding:"0.55in 0.65in 0.7in 0.5in", boxSizing:"border-box" }}>
        <div style={{ paddingBottom:"0.2in", marginBottom:"0.2in", borderBottom:`1px solid ${h2r(accent,0.15)}` }}>
          <h1 style={{ fontFamily:nameFont, fontSize:"28pt", fontWeight:800, color:"#1c1c1c", margin:0, lineHeight:1.1, letterSpacing:"0.02em" }}>{data.name||"Your Name"}</h1>
          {data.specialties?.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:"0.05in", marginTop:"0.1in" }}>{data.specialties.map((s,i)=><CuisineChip key={i} label={s} accent={accent} bodyFont={bodyFont}/>)}</div>}
          {ci.length>0&&<div style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:"#888", marginTop:"0.09in" }}>{ci.join("  ·  ")}</div>}
        </div>
        {data.summary&&<div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#444", lineHeight:1.7, marginBottom:"0.2in", fontStyle:"italic" }}>{data.summary}</div>}
        {data.experience?.length>0&&<><SecHead accent={accent} bodyFont={bodyFont} style={{ marginTop:0 }}>Experience</SecHead>{data.experience.map((exp,i)=><ExpBlock key={i} exp={exp} accent={accent} copper={accent} bodyFont={bodyFont} i={i} total={data.experience.length}/>)}</>}
        {data.signature?.length>0&&<><SecHead accent={accent} bodyFont={bodyFont}>Signature Dishes</SecHead>{data.signature.map((s,i)=><div key={i} style={{ marginBottom:"0.09in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#333", fontStyle:"italic", fontWeight:500 }}>{s.dish}</div>{s.note&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:accent, marginTop:"0.02in" }}>{s.note}</div>}</div>)}</>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.4in", marginTop:"0.05in" }}>
          <div>
            {data.education?.length>0&&<><SecHead accent={accent} bodyFont={bodyFont}>Training</SecHead>{data.education.map((ed,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333", marginBottom:"0.08in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontWeight:700 }}>{ed.degree}</div><div style={{ color:"#666" }}>{ed.school}{ed.date&&<span style={{ color:accent, fontWeight:600 }}> · {ed.date}</span>}</div>{ed.notes&&<div style={{ fontStyle:"italic", color:"#888", fontSize:"9pt" }}>{ed.notes}</div>}</div>)}</>}
            {data.certifications?.length>0&&<><SecHead accent={accent} bodyFont={bodyFont}>Certifications</SecHead>{data.certifications.map((c,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#333", marginBottom:"0.06in" }}><span style={{ fontWeight:600 }}>{c.name}</span>{c.date&&<span style={{ color:accent }}> ({c.date})</span>}</div>)}</>}
          </div>
          <div>
            {data.skills?.length>0&&<><SecHead accent={accent} bodyFont={bodyFont}>Skills</SecHead><div style={{ display:"flex", flexWrap:"wrap", gap:"0.05in" }}>{data.skills.map((s,i)=><span key={i} style={{ fontFamily:bodyFont, fontSize:"8pt", background:h2r(accent,0.09), color:accent, padding:"0.025in 0.1in", border:`1px solid ${h2r(accent,0.22)}`, fontWeight:600 }}>{s}</span>)}</div></>}
            {data.awards?.length>0&&<><SecHead accent={accent} bodyFont={bodyFont}>Awards</SecHead>{data.awards.map((a,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#333", marginBottom:"0.05in" }}>{a}</div>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LAYOUT: GRAND CRU (full dark header, senior F&B)
   ============================================================ */
function LayoutGrandCru({ data, accent, accent2, nameFont, bodyFont }) {
  const copper = accent2||"#C4622D";
  const ci = [data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.website].filter(Boolean);
  return (
    <div style={{ width:"8.5in", background:"#F8F7F3", fontFamily:bodyFont, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.25)" }}>
      <div style={{ background:accent, padding:"0.48in 0.75in 0.4in", boxSizing:"border-box", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:copper }} />
        <div style={{ position:"absolute", top:0, right:0, width:"5in", height:"100%", background:"rgba(255,255,255,0.02)", clipPath:"polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }} />
        <div style={{ position:"relative" }}>
          <h1 style={{ fontFamily:nameFont, fontSize:"30pt", fontWeight:400, color:"#fff", margin:0, lineHeight:1.1, letterSpacing:"0.06em" }}>{data.name||"Your Name"}</h1>
          {data.specialties?.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:"0.05in", marginTop:"0.1in" }}>{data.specialties.map((s,i)=><span key={i} style={{ fontFamily:bodyFont, fontSize:"7.5pt", background:h2r(copper,0.3), color:"rgba(255,255,255,0.95)", padding:"0.025in 0.1in", border:`1px solid ${h2r(copper,0.5)}`, fontWeight:600, letterSpacing:"0.04em" }}>{s}</span>)}</div>}
          {ci.length>0&&<div style={{ color:"rgba(255,255,255,0.55)", fontSize:"8.5pt", marginTop:"0.1in", fontFamily:bodyFont }}>{ci.join("  ·  ")}</div>}
        </div>
      </div>
      <div style={{ display:"flex", padding:"0.38in 0.75in 0.6in", gap:"0.45in", boxSizing:"border-box" }}>
        <div style={{ width:"2.1in", flexShrink:0 }}>
          {data.skills?.length>0&&<><div style={{ fontFamily:bodyFont, fontSize:"7.5pt", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:copper, marginBottom:"0.08in", marginTop:0 }}>Skills</div>{data.skills.map((s,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:"#444", marginBottom:"0.04in", paddingLeft:"0.09in", borderLeft:`2px solid ${h2r(copper,0.4)}` }}>{s}</div>)}</>}
          {data.certifications?.length>0&&<><div style={{ fontFamily:bodyFont, fontSize:"7.5pt", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:copper, marginBottom:"0.08in", marginTop:"0.18in", paddingTop:"0.15in", borderTop:`1px solid ${h2r(accent,0.1)}` }}>Certifications</div>{data.certifications.map((c,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:"#333", marginBottom:"0.07in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontWeight:600 }}>{c.name}</div>{c.issuer&&<div style={{ color:"#777", fontSize:"8pt" }}>{c.issuer}</div>}{c.date&&<div style={{ color:copper, fontWeight:600 }}>{c.date}</div>}</div>)}</>}
          {data.education?.length>0&&<><div style={{ fontFamily:bodyFont, fontSize:"7.5pt", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:copper, marginBottom:"0.08in", marginTop:"0.18in", paddingTop:"0.15in", borderTop:`1px solid ${h2r(accent,0.1)}` }}>Training</div>{data.education.map((ed,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:"#333", marginBottom:"0.09in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontWeight:600 }}>{ed.degree}</div>{ed.school&&<div style={{ color:"#666" }}>{ed.school}</div>}{ed.date&&<div style={{ color:copper, fontWeight:600 }}>{ed.date}</div>}{ed.notes&&<div style={{ fontStyle:"italic", color:"#888", fontSize:"8pt" }}>{ed.notes}</div>}</div>)}</>}
          {data.awards?.length>0&&<><div style={{ fontFamily:bodyFont, fontSize:"7.5pt", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:copper, marginBottom:"0.08in", marginTop:"0.18in", paddingTop:"0.15in", borderTop:`1px solid ${h2r(accent,0.1)}` }}>Awards</div>{data.awards.map((a,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"8pt", color:"#444", marginBottom:"0.05in", lineHeight:1.45 }}>{a}</div>)}</>}
        </div>
        <div style={{ flex:1 }}>
          {data.summary&&<div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#555", lineHeight:1.7, marginBottom:"0.18in", paddingBottom:"0.15in", borderBottom:`1px solid ${h2r(accent,0.1)}`, fontStyle:"italic" }}>{data.summary}</div>}
          {data.experience?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont} style={{ marginTop:0 }}>Experience</SecHead>{data.experience.map((exp,i)=><ExpBlock key={i} exp={exp} accent={accent} copper={copper} bodyFont={bodyFont} i={i} total={data.experience.length}/>)}</>}
          {data.signature?.length>0&&<><SecHead accent={accent} copper={copper} bodyFont={bodyFont}>Signature Dishes</SecHead>{data.signature.map((s,i)=><div key={i} style={{ marginBottom:"0.09in", paddingLeft:"0.12in", borderLeft:`2px solid ${h2r(copper,0.45)}`, breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#222", fontStyle:"italic", fontWeight:500 }}>{s.dish}</div>{s.note&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:copper }}>{s.note}</div>}</div>)}</>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LAYOUT: STATION (ATS-safe single column)
   ============================================================ */
function LayoutStation({ data, accent, nameFont, bodyFont }) {
  const ci = [data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.linkedin,data.contact?.website].filter(Boolean);
  const SH = ({children}) => <div style={{ fontFamily:bodyFont, fontSize:"8.5pt", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:accent, borderBottom:`1.5px solid ${h2r(accent,0.25)}`, paddingBottom:"0.04in", marginTop:"0.18in", marginBottom:"0.09in", breakAfter:"avoid", pageBreakAfter:"avoid" }}>{children}</div>;
  return (
    <div style={{ width:"8.5in", background:"#fff", fontFamily:bodyFont, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.12)", padding:"0.6in 0.85in 0.7in" }}>
      <div style={{ borderBottom:`2px solid ${accent}`, paddingBottom:"0.16in", marginBottom:"0.08in" }}>
        <h1 style={{ fontFamily:nameFont, fontSize:"26pt", fontWeight:800, color:accent, margin:0, lineHeight:1.1, letterSpacing:"0.04em" }}>{data.name||"Your Name"}</h1>
        {data.specialties?.length>0&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#666", marginTop:"0.06in", fontStyle:"italic" }}>{data.specialties.join("  ·  ")}</div>}
        {ci.length>0&&<div style={{ fontFamily:bodyFont, fontSize:"8.5pt", color:"#888", marginTop:"0.08in" }}>{ci.join("  ·  ")}</div>}
      </div>
      {data.summary&&<><SH>Summary</SH><div style={{ fontFamily:bodyFont, fontSize:"10pt", color:"#444", lineHeight:1.7 }}>{data.summary}</div></>}
      {data.experience?.length>0&&<><SH>Experience</SH>{data.experience.map((exp,i)=><ExpBlock key={i} exp={exp} accent={accent} copper={accent} bodyFont={bodyFont} i={i} total={data.experience.length}/>)}</>}
      {data.signature?.length>0&&<><SH>Signature Dishes</SH>{data.signature.map((s,i)=><div key={i} style={{ marginBottom:"0.08in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#222", fontStyle:"italic", fontWeight:500 }}>{s.dish}</div>{s.note&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#666" }}>{s.note}</div>}</div>)}</>}
      {data.education?.length>0&&<><SH>Training &amp; Education</SH>{data.education.map((ed,i)=><div key={i} style={{ marginBottom:"0.09in", breakInside:"avoid", pageBreakInside:"avoid" }}><div style={{ fontFamily:bodyFont, fontWeight:700, fontSize:"10.5pt", color:"#111" }}>{ed.degree}{ed.school&&<span style={{ fontWeight:400, color:"#666" }}> — {ed.school}</span>}</div>{ed.date&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:accent, fontWeight:600 }}>{ed.date}</div>}{ed.notes&&<div style={{ fontFamily:bodyFont, fontSize:"9pt", color:"#666", fontStyle:"italic" }}>{ed.notes}</div>}</div>)}</>}
      {data.certifications?.length>0&&<><SH>Certifications</SH><ul style={{ margin:0, paddingLeft:"0.2in" }}>{data.certifications.map((c,i)=><li key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333", marginBottom:"0.04in", breakInside:"avoid", pageBreakInside:"avoid" }}><span style={{ fontWeight:600 }}>{c.name}</span>{c.issuer&&` — ${c.issuer}`}{c.date&&<span style={{ color:accent }}> ({c.date})</span>}</li>)}</ul></>}
      {data.skills?.length>0&&<><SH>Skills</SH><div style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333" }}>{data.skills.join("  ·  ")}</div></>}
      {data.awards?.length>0&&<><SH>Awards &amp; Recognition</SH>{data.awards.map((a,i)=><div key={i} style={{ fontFamily:bodyFont, fontSize:"9.5pt", color:"#333", marginBottom:"0.04in" }}>{a}</div>)}</>}
    </div>
  );
}

/* ── Router ── */
function ResumePreview({ templateId, data, accent }) {
  const tpl = TEMPLATES.find(t=>t.id===templateId)||TEMPLATES[0];
  const props = { data, accent:accent||tpl.accent, accent2:tpl.accent2, nameFont:tpl.nameFont, bodyFont:tpl.bodyFont };
  switch(tpl.layout) {
    case "mise-en-place": return <LayoutMiseEnPlace {...props}/>;
    case "brigade":       return <LayoutBrigade {...props}/>;
    case "maitre":        return <LayoutMaitre {...props}/>;
    case "artisan":       return <LayoutArtisan {...props}/>;
    case "grand-cru":     return <LayoutGrandCru {...props}/>;
    case "station":       return <LayoutStation {...props}/>;
    default:              return <LayoutMiseEnPlace {...props}/>;
  }
}

/* ============================================================
   EXPORT
   ============================================================ */
function exportPDF(el, name) {
  if(!el)return;
  const printCSS=`@page{size:letter;margin:0}html,body{margin:0;padding:0;background:white;-webkit-print-color-adjust:exact;print-color-adjust:exact}*{box-sizing:border-box}-webkit-print-color-adjust:exact;h1,h2,h3{page-break-after:avoid;break-after:avoid}li{page-break-inside:avoid;break-inside:avoid;orphans:3;widows:3}ul{page-break-inside:avoid;break-inside:avoid}div{-webkit-print-color-adjust:exact;print-color-adjust:exact}`;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${(name||"Resume").replace(/[<>&"']/g,"")}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Lato:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;500;600;700;800&family=Josefin+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"><style>${printCSS}</style></head><body>${el.innerHTML}<script>(function(){if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setTimeout(function(){window.focus();window.print();},300);})}else{setTimeout(function(){window.focus();window.print();},900);}})()</script></body></html>`;
  const w=window.open("","_blank","width=900,height=1100");
  if(!w){alert("Please allow pop-ups to print.");return;}
  w.document.open();w.document.write(html);w.document.close();
}

function exportWord(data, accent) {
  const ac=hexToRtf(accent);
  const fn=((data.name||"resume").replace(/[^a-z0-9]+/gi,"_").toLowerCase())+"_resume.rtf";
  const out=[];
  out.push(`{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\froman\\fcharset0 Garamond;}}{\\colortbl;\\red17\\green17\\blue17;\\red80\\green80\\blue80;\\red${ac.r}\\green${ac.g}\\blue${ac.b};}\\paperw12240\\paperh15840\\margl1080\\margr1080\\margt1080\\margb1080\\f0\\fs22\\cf1`);
  if(data.name) out.push(`{\\pard\\ql\\sb0\\sa80\\fs44\\b\\cf3 ${rtfEsc(data.name)}\\b0\\par}`);
  if(data.specialties?.length) out.push(`{\\pard\\ql\\sb0\\sa60\\fs20\\i\\cf2 ${rtfEsc(data.specialties.join("  ·  "))}\\i0\\par}`);
  const ci=[data.contact?.email,data.contact?.phone,data.contact?.location,data.contact?.linkedin,data.contact?.website].filter(Boolean);
  if(ci.length) out.push(`{\\pard\\ql\\sb0\\sa200\\fs19\\cf2 ${rtfEsc(ci.join("  ·  "))}\\par}`);
  out.push(`{\\pard\\ql\\sb0\\sa200\\brdrb\\brdrs\\brdrw20\\brdrcf3\\par}`);
  if(data.summary) out.push(`{\\pard\\ql\\sb0\\sa200\\fs21\\i\\cf2\\keep ${rtfEsc(data.summary)}\\i0\\par}`);
  const sh=t=>{out.push(`{\\pard\\ql\\sb200\\sa60\\fs19\\b\\cf3\\keepn ${rtfEsc(t.toUpperCase())}\\b0\\par}`);out.push(`{\\pard\\ql\\sb0\\sa80\\brdrb\\brdrs\\brdrw10\\brdrcf3\\keepn\\par}`);};
  if(data.experience?.length){sh("Experience");data.experience.forEach(exp=>{out.push(`{\\pard\\ql\\sb80\\sa20\\fs22\\keepn\\tx9000\\tqr\\tx9000 {\\b ${rtfEsc(exp.title)}\\b0}${exp.venue?` \\u8212? ${rtfEsc(exp.venue)}`:""}${exp.location?`, ${rtfEsc(exp.location)}`:""} \\tab ${rtfEsc([exp.start,exp.end].filter(Boolean).join(" \\u8212? "))}\\par}`);if(exp.type||exp.covers)out.push(`{\\pard\\ql\\sa20\\fs20\\cf3\\keep ${rtfEsc([exp.type,exp.covers].filter(Boolean).join(" · "))}\\par}`);(exp.bullets||[]).forEach(b=>out.push(`{\\pard\\fi-280\\li360\\sa20\\fs22\\keep \\u8226? \\tab ${rtfEsc(b)}\\par}`));out.push(`{\\pard\\sb60\\par}`);})}
  if(data.signature?.length){sh("Signature Dishes");data.signature.forEach(s=>{out.push(`{\\pard\\ql\\sb60\\sa20\\fs22\\i\\keep ${rtfEsc(s.dish)}\\i0\\par}`);if(s.note)out.push(`{\\pard\\ql\\sa40\\fs20\\cf3\\keep ${rtfEsc(s.note)}\\par}`);})}
  if(data.education?.length){sh("Training & Education");data.education.forEach(ed=>{out.push(`{\\pard\\ql\\sb80\\sa20\\fs22\\b\\keep ${rtfEsc(ed.degree)}\\b0${ed.school?` \\u8212? ${rtfEsc(ed.school)}`:""} ${rtfEsc(ed.date||"")}\\par}`);if(ed.notes)out.push(`{\\pard\\ql\\sa40\\fs20\\i\\cf2\\keep ${rtfEsc(ed.notes)}\\i0\\par}`);out.push(`{\\pard\\sb40\\par}`);})}
  if(data.certifications?.length){sh("Certifications");data.certifications.forEach(c=>out.push(`{\\pard\\fi-280\\li360\\sa20\\fs22\\keep \\u8226? \\tab {\\b ${rtfEsc(c.name)}\\b0}${c.issuer?` \\u8212? ${rtfEsc(c.issuer)}`:""}${c.date?` (${rtfEsc(c.date)})`:""} \\par}`))}
  if(data.skills?.length)out.push(`{\\pard\\ql\\sb200\\sa60\\fs19\\b\\cf3\\keepn SKILLS\\b0\\par}{\\pard\\ql\\sa80\\brdrb\\brdrs\\brdrw10\\brdrcf3\\par}{\\pard\\ql\\sa120\\fs22\\cf1\\keep ${rtfEsc(data.skills.join("  ·  "))}\\par}`);
  if(data.awards?.length){sh("Awards & Recognition");data.awards.forEach(a=>out.push(`{\\pard\\fi-280\\li360\\sa20\\fs22\\keep \\u8226? \\tab ${rtfEsc(a)}\\par}`))}
  out.push("}");
  dlBlob(new Blob([out.join("\n")],{type:"application/rtf"}),fn);
}

/* ============================================================
   COVER LETTER PREVIEW — matches each MiseCV template
   ============================================================ */
function CoverLetterPreview({ templateId, cl, accent }) {
  const tpl    = TEMPLATES.find(t=>t.id===templateId)||TEMPLATES[0];
  const ac     = accent||tpl.accent;
  const copper = tpl.accent2||"#C4622D";
  const nf     = tpl.nameFont;
  const bf     = tpl.bodyFont;
  const layout = tpl.layout;

  const empty = !cl.senderName && !cl.company && !cl.opening;
  if(empty) return (
    <div style={{ width:"8.5in", minHeight:"11in", background:"#FAFAF7", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.18)", boxSizing:"border-box" }}>
      <div style={{ textAlign:"center", color:"#bbb", fontFamily:NUNITO, fontSize:"11pt" }}>
        <div style={{ fontSize:"28pt", marginBottom:"0.15in" }}>✉</div>Fill in the form to preview your cover letter
      </div>
    </div>
  );

  const contactStr = [cl.senderEmail, cl.senderPhone, cl.senderLocation, cl.senderWebsite].filter(Boolean).join("  ·  ");
  const salutation = `Dear ${cl.recipientName||"Hiring Manager"},`;
  const paragraphs = [cl.opening, cl.body1, cl.body2, cl.body3].filter(Boolean);
  const closing    = cl.closing||"Thank you for your time and consideration.";

  // Sign-off always includes full name
  const SignOff = ({ darkBg=false, nameColor=ac }) => (
    <div>
      <div style={{ fontFamily:bf, fontSize:"10.5pt", color:darkBg?"rgba(255,255,255,0.85)":"#1c1c1c", marginTop:"0.06in" }}>{closing}</div>
      <div style={{ fontFamily:bf, fontSize:"10.5pt", color:darkBg?"rgba(255,255,255,0.85)":"#1c1c1c", marginTop:"0.3in" }}>Sincerely,</div>
      <div style={{ fontFamily:nf, fontSize:"13pt", fontWeight:700, color:darkBg?"#fff":nameColor, marginTop:"0.28in", letterSpacing:"0.02em" }}>{cl.senderName||""}</div>
      {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"9pt", color:darkBg?"rgba(255,255,255,0.55)":"#777", marginTop:"0.04in", fontStyle:"italic" }}>{cl.senderTitle}</div>}
    </div>
  );

  const Body = ({ pad="0.4in 0.7in 0.7in", darkBg=false, nameColor=ac }) => {
    const tc = darkBg?"rgba(255,255,255,0.9)":"#1c1c1c";
    const sc = darkBg?"rgba(255,255,255,0.55)":"#555";
    const hc = darkBg?"rgba(255,255,255,0.35)":"#999";
    return (
      <div style={{ padding:pad, boxSizing:"border-box" }}>
        {cl.date&&<div style={{ fontFamily:bf, fontSize:"9.5pt", color:sc, marginBottom:"0.2in" }}>{cl.date}</div>}
        {(cl.recipientName||cl.recipientTitle||cl.company)&&(
          <div style={{ fontFamily:bf, fontSize:"9.5pt", color:tc, lineHeight:1.7, marginBottom:"0.26in" }}>
            {cl.recipientName&&<div style={{ fontWeight:700 }}>{cl.recipientName}</div>}
            {cl.recipientTitle&&<div style={{ color:sc }}>{cl.recipientTitle}</div>}
            {cl.company&&<div style={{ color:sc }}>{cl.company}</div>}
            {cl.companyAddress&&<div style={{ color:hc }}>{cl.companyAddress}</div>}
          </div>
        )}
        <div style={{ fontFamily:bf, fontSize:"10.5pt", color:tc, marginBottom:"0.2in" }}>{salutation}</div>
        {paragraphs.map((p,i)=><p key={i} style={{ fontFamily:bf, fontSize:"10.5pt", color:tc, lineHeight:1.78, margin:"0 0 0.17in 0" }}>{p}</p>)}
        <SignOff darkBg={darkBg} nameColor={nameColor}/>
      </div>
    );
  };

  /* ── mise-en-place ── */
  if(layout==="mise-en-place") return (
    <div style={{ width:"8.5in", background:"#FAFAF7", fontFamily:bf, boxSizing:"border-box", display:"flex", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.22)" }}>
      <div style={{ width:"2.6in", background:ac, padding:"0.5in 0.32in", boxSizing:"border-box", flexShrink:0 }}>
        <div style={{ fontFamily:nf, fontSize:"17pt", fontWeight:800, color:"#fff", lineHeight:1.2, letterSpacing:"0.04em", wordBreak:"break-word", textTransform:"uppercase" }}>{cl.senderName||"Your Name"}</div>
        {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"8pt", color:h2r(copper,0.9), marginTop:"0.07in", fontWeight:600, letterSpacing:"0.04em" }}>{cl.senderTitle}</div>}
        <div style={{ marginTop:"0.2in", borderTop:`1px solid ${h2r(copper,0.35)}`, paddingTop:"0.15in" }}>
          <div style={{ fontFamily:bf, fontSize:"7pt", textTransform:"uppercase", letterSpacing:"0.2em", color:h2r(copper,0.85), fontWeight:700, marginBottom:"0.1in" }}>Contact</div>
          {[cl.senderEmail,cl.senderPhone,cl.senderLocation,cl.senderWebsite].filter(Boolean).map((v,i)=><div key={i} style={{ fontFamily:bf, fontSize:"8pt", color:"rgba(255,255,255,0.82)", marginBottom:"0.05in", wordBreak:"break-word" }}>{v}</div>)}
        </div>
      </div>
      <div style={{ flex:1 }}><Body pad="0.5in 0.45in 0.7in 0.4in"/></div>
    </div>
  );

  /* ── brigade ── */
  if(layout==="brigade") return (
    <div style={{ width:"8.5in", background:"#FAF9F6", fontFamily:bf, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.22)" }}>
      <div style={{ background:ac, padding:"0.42in 0.7in 0.35in", boxSizing:"border-box", position:"relative" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"4px", background:copper }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:h2r(copper,0.5) }}/>
        <h1 style={{ fontFamily:nf, fontSize:"30pt", fontWeight:700, color:"#fff", margin:0, lineHeight:1.05, letterSpacing:"0.12em", textTransform:"uppercase" }}>{cl.senderName||"Your Name"}</h1>
        {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"9.5pt", color:"rgba(255,255,255,0.72)", marginTop:"0.06in" }}>{cl.senderTitle}</div>}
        {contactStr&&<div style={{ fontFamily:bf, fontSize:"8.5pt", color:"rgba(255,255,255,0.55)", marginTop:"0.09in" }}>{contactStr}</div>}
      </div>
      <Body pad="0.4in 0.7in 0.7in" nameColor={copper}/>
    </div>
  );

  /* ── maitre ── */
  if(layout==="maitre") {
    const gold = tpl.accent2||"#D4A96A";
    return (
      <div style={{ width:"8.5in", background:"#FEFDFB", fontFamily:bf, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.14)" }}>
        <div style={{ padding:"0.55in 0.85in 0.28in", boxSizing:"border-box", textAlign:"center" }}>
          <h1 style={{ fontFamily:nf, fontSize:"28pt", fontWeight:400, color:"#1c1c1c", margin:0, lineHeight:1.1, letterSpacing:"0.04em" }}>{cl.senderName||"Your Name"}</h1>
          {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"9.5pt", color:gold, marginTop:"0.07in", letterSpacing:"0.1em", fontWeight:600, textTransform:"uppercase" }}>{cl.senderTitle}</div>}
          {contactStr&&<div style={{ fontFamily:bf, fontSize:"8.5pt", color:"#888", marginTop:"0.09in" }}>{contactStr}</div>}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.12in", marginTop:"0.18in" }}>
            <div style={{ flex:1, height:"1px", background:h2r(ac,0.15) }}/>
            <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
              <div style={{ width:"4px", height:"4px", background:gold, transform:"rotate(45deg)" }}/>
              <div style={{ width:"8px", height:"8px", background:gold, transform:"rotate(45deg)" }}/>
              <div style={{ width:"4px", height:"4px", background:gold, transform:"rotate(45deg)" }}/>
            </div>
            <div style={{ flex:1, height:"1px", background:h2r(ac,0.15) }}/>
          </div>
        </div>
        <Body pad="0.22in 0.85in 0.7in" nameColor={gold}/>
      </div>
    );
  }

  /* ── artisan ── */
  if(layout==="artisan") return (
    <div style={{ width:"8.5in", background:"#FAF8F4", fontFamily:bf, boxSizing:"border-box", display:"flex", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.15)" }}>
      <div style={{ width:"0.16in", background:ac, flexShrink:0 }}/>
      <div style={{ flex:1, padding:"0.55in 0.65in 0.7in 0.5in", boxSizing:"border-box" }}>
        <div style={{ paddingBottom:"0.18in", marginBottom:"0.28in", borderBottom:`1px solid ${h2r(ac,0.18)}` }}>
          <h1 style={{ fontFamily:nf, fontSize:"26pt", fontWeight:800, color:"#1c1c1c", margin:0, lineHeight:1.1 }}>{cl.senderName||"Your Name"}</h1>
          {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"10pt", color:ac, marginTop:"0.05in", fontWeight:600 }}>{cl.senderTitle}</div>}
          {contactStr&&<div style={{ fontFamily:bf, fontSize:"8.5pt", color:"#888", marginTop:"0.07in" }}>{contactStr}</div>}
        </div>
        <Body pad="0"/>
      </div>
    </div>
  );

  /* ── grand-cru ── */
  if(layout==="grand-cru") return (
    <div style={{ width:"8.5in", background:"#F8F7F3", fontFamily:bf, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.25)" }}>
      <div style={{ background:ac, padding:"0.45in 0.75in 0.38in", boxSizing:"border-box", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:copper }}/>
        <div style={{ position:"absolute", top:0, right:0, width:"5in", height:"100%", background:"rgba(255,255,255,0.02)", clipPath:"polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }}/>
        <div style={{ position:"relative" }}>
          <h1 style={{ fontFamily:nf, fontSize:"28pt", fontWeight:400, color:"#fff", margin:0, lineHeight:1.1, letterSpacing:"0.06em" }}>{cl.senderName||"Your Name"}</h1>
          {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"9.5pt", color:h2r(copper,0.9), marginTop:"0.06in", fontWeight:600 }}>{cl.senderTitle}</div>}
          {contactStr&&<div style={{ fontFamily:bf, fontSize:"8.5pt", color:"rgba(255,255,255,0.55)", marginTop:"0.09in" }}>{contactStr}</div>}
        </div>
      </div>
      <Body pad="0.42in 0.75in 0.7in" nameColor={copper}/>
    </div>
  );

  /* ── station (fallback) ── */
  return (
    <div style={{ width:"8.5in", background:"#fff", fontFamily:bf, boxSizing:"border-box", boxShadow:"0 12px 40px -10px rgba(0,0,0,0.12)", padding:"0.6in 0.85in 0.7in" }}>
      <div style={{ borderBottom:`2px solid ${ac}`, paddingBottom:"0.16in", marginBottom:"0.3in" }}>
        <h1 style={{ fontFamily:nf, fontSize:"24pt", fontWeight:800, color:ac, margin:0, lineHeight:1.1 }}>{cl.senderName||"Your Name"}</h1>
        {cl.senderTitle&&<div style={{ fontFamily:bf, fontSize:"10pt", color:"#666", marginTop:"0.04in", fontStyle:"italic" }}>{cl.senderTitle}</div>}
        {contactStr&&<div style={{ fontFamily:bf, fontSize:"8.5pt", color:"#888", marginTop:"0.07in" }}>{contactStr}</div>}
      </div>
      <Body pad="0"/>
    </div>
  );
}

/* ============================================================
   COVER LETTER EXPORTS
   ============================================================ */
function exportCLPDF(el, name) {
  if(!el)return;
  const printCSS=`@page{size:letter;margin:0}html,body{margin:0;padding:0;background:white;-webkit-print-color-adjust:exact;print-color-adjust:exact}*{box-sizing:border-box}p{orphans:3;widows:3;page-break-inside:avoid;break-inside:avoid}div{-webkit-print-color-adjust:exact;print-color-adjust:exact}`;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${(name||"Cover Letter").replace(/[<>&"']/g,"")}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Lato:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;500;600;700;800&family=Josefin+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"><style>${printCSS}</style></head><body>${el.innerHTML}<script>(function(){if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setTimeout(function(){window.focus();window.print();},300);})}else{setTimeout(function(){window.focus();window.print();},900);}})()</script></body></html>`;
  const w=window.open("","_blank","width=900,height=1100");
  if(!w){alert("Please allow pop-ups to print.");return;}
  w.document.open();w.document.write(html);w.document.close();
}

function exportCLWord(cl, accent) {
  const ac=hexToRtf(accent);
  const fn=((cl.senderName||"cover-letter").replace(/[^a-z0-9]+/gi,"_").toLowerCase())+"_cover_letter.rtf";
  const out=[];
  out.push(`{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\froman\\fcharset0 Garamond;}}{\\colortbl;\\red17\\green17\\blue17;\\red80\\green80\\blue80;\\red${ac.r}\\green${ac.g}\\blue${ac.b};}\\paperw12240\\paperh15840\\margl1152\\margr1152\\margt1152\\margb1152\\f0\\fs22\\cf1`);
  if(cl.senderName) out.push(`{\\pard\\ql\\sb0\\sa60\\fs40\\b\\cf3 ${rtfEsc(cl.senderName)}\\b0\\par}`);
  if(cl.senderTitle) out.push(`{\\pard\\ql\\sb0\\sa40\\fs22\\i\\cf2 ${rtfEsc(cl.senderTitle)}\\i0\\par}`);
  const ci=[cl.senderEmail,cl.senderPhone,cl.senderLocation,cl.senderWebsite].filter(Boolean);
  if(ci.length) out.push(`{\\pard\\ql\\sb0\\sa240\\fs19\\cf2 ${rtfEsc(ci.join("  ·  "))}\\par}`);
  out.push(`{\\pard\\ql\\sb0\\sa240\\brdrb\\brdrs\\brdrw15\\brdrcf3\\par}`);
  if(cl.date) out.push(`{\\pard\\ql\\sb0\\sa120\\fs20\\cf2 ${rtfEsc(cl.date)}\\par}`);
  if(cl.recipientName||cl.recipientTitle||cl.company){
    out.push(`{\\pard\\ql\\sb120\\sa0\\fs21\\cf1`);
    if(cl.recipientName) out.push(`{\\b ${rtfEsc(cl.recipientName)}\\b0}\\line `);
    if(cl.recipientTitle) out.push(`${rtfEsc(cl.recipientTitle)}\\line `);
    if(cl.company) out.push(`${rtfEsc(cl.company)}\\line `);
    if(cl.companyAddress) out.push(`{\\cf2 ${rtfEsc(cl.companyAddress)}}`);
    out.push(`\\par}`);
  }
  out.push(`{\\pard\\ql\\sb240\\sa120\\fs22\\cf1 ${rtfEsc(`Dear ${cl.recipientName||"Hiring Manager"},`)}\\par}`);
  [cl.opening,cl.body1,cl.body2,cl.body3].filter(Boolean).forEach(p=>{
    out.push(`{\\pard\\ql\\sb0\\sa180\\fs22\\cf1\\keep ${rtfEsc(p)}\\par}`);
  });
  if(cl.closing) out.push(`{\\pard\\ql\\sb60\\sa120\\fs22\\cf1 ${rtfEsc(cl.closing)}\\par}`);
  out.push(`{\\pard\\ql\\sb200\\sa60\\fs22\\cf1 Sincerely,\\par}`);
  out.push(`{\\pard\\ql\\sb240\\sa0\\fs26\\b\\cf3 ${rtfEsc(cl.senderName||"")}\\b0\\par}`);
  if(cl.senderTitle) out.push(`{\\pard\\ql\\sb40\\sa0\\fs20\\i\\cf2 ${rtfEsc(cl.senderTitle)}\\i0\\par}`);
  out.push("}");
  dlBlob(new Blob([out.join("\n")],{type:"application/rtf"}),fn);
}

/* ============================================================
   COVER LETTER FORM
   ============================================================ */
function CoverLetterForm({ cl, setCl, onAutoFill }) {
  const set=(k,v)=>setCl(p=>({...p,[k]:v}));
  return (
    <div className="space-y-0">
      <Accordion title="CL — Your Details">
        <button onClick={onAutoFill} className="w-full flex items-center justify-center gap-2 py-2 mb-1 text-xs font-bold transition-all rounded-xl" style={{ background:"#FFF3E8", border:"1px solid #E8C4A0", color:"#8B4513" }}>
          <Zap className="w-3.5 h-3.5"/>Auto-fill from resume
        </button>
        <div><label className={lc}>Full name</label><input className={fc} value={cl.senderName} onChange={e=>set("senderName",e.target.value)} placeholder="Daniel Rossi"/></div>
        <div><label className={lc}>Your title / position</label><input className={fc} value={cl.senderTitle} onChange={e=>set("senderTitle",e.target.value)} placeholder="Executive Chef — Modern Italian-Australian"/></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={lc}>Email</label><input className={fc} value={cl.senderEmail} onChange={e=>set("senderEmail",e.target.value)} placeholder="chef@email.com"/></div>
          <div><label className={lc}>Phone</label><input className={fc} value={cl.senderPhone} onChange={e=>set("senderPhone",e.target.value)} placeholder="+61 400 000 000"/></div>
          <div><label className={lc}>Location</label><input className={fc} value={cl.senderLocation} onChange={e=>set("senderLocation",e.target.value)} placeholder="Melbourne, VIC"/></div>
          <div><label className={lc}>Website</label><input className={fc} value={cl.senderWebsite} onChange={e=>set("senderWebsite",e.target.value)} placeholder="yoursite.com.au"/></div>
        </div>
      </Accordion>
      <Accordion title="CL — Recipient & Venue">
        <div><label className={lc}>Date</label><input className={fc} value={cl.date} onChange={e=>set("date",e.target.value)} placeholder="June 18, 2026"/></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={lc}>Recipient name</label><input className={fc} value={cl.recipientName} onChange={e=>set("recipientName",e.target.value)} placeholder="Sophie Laurent"/></div>
          <div><label className={lc}>Their title</label><input className={fc} value={cl.recipientTitle} onChange={e=>set("recipientTitle",e.target.value)} placeholder="Restaurant Director"/></div>
        </div>
        <div><label className={lc}>Restaurant / Venue</label><input className={fc} value={cl.company} onChange={e=>set("company",e.target.value)} placeholder="Icebergs Dining Room & Bar"/></div>
        <div><label className={lc}>Address <span className="normal-case font-normal text-amber-300">(optional)</span></label><input className={fc} value={cl.companyAddress} onChange={e=>set("companyAddress",e.target.value)} placeholder="1 Notts Ave, Bondi Beach NSW 2026"/></div>
      </Accordion>
      <Accordion title="CL — Letter Body">
        <p className="text-[11px] text-amber-700/60 -mt-1 leading-relaxed">Write each paragraph separately — the preview assembles them in order.</p>
        <div><label className={lc}>Opening paragraph</label><textarea className={fc} rows={4} value={cl.opening} onChange={e=>set("opening",e.target.value)} placeholder="Why this venue, why you — open with impact."/></div>
        <div><label className={lc}>Body paragraph 1</label><textarea className={fc} rows={4} value={cl.body1} onChange={e=>set("body1",e.target.value)} placeholder="Your strongest achievement or experience."/></div>
        <div><label className={lc}>Body paragraph 2 <span className="normal-case font-normal text-amber-300">(optional)</span></label><textarea className={fc} rows={4} value={cl.body2} onChange={e=>set("body2",e.target.value)} placeholder="Your cooking philosophy or style connection."/></div>
        <div><label className={lc}>Body paragraph 3 <span className="normal-case font-normal text-amber-300">(optional)</span></label><textarea className={fc} rows={3} value={cl.body3} onChange={e=>set("body3",e.target.value)} placeholder="Call to action / availability."/></div>
        <div><label className={lc}>Closing sentence</label><input className={fc} value={cl.closing} onChange={e=>set("closing",e.target.value)} placeholder="Thank you for your time and consideration."/></div>
      </Accordion>
    </div>
  );
}

/* ============================================================
   FORM COMPONENTS
   ============================================================ */
const fc = "w-full px-2.5 py-1.5 text-sm border border-amber-200 rounded-lg bg-amber-50/30 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all";
const lc = "block text-[11px] font-bold uppercase tracking-wider text-amber-800/60 mb-1";

function Accordion({ title, badge, children, defaultOpen=true }) {
  const [open,setOpen]=useState(defaultOpen);
  return (
    <div className="border-b border-amber-100 last:border-b-0">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between py-3 text-left group">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-800 group-hover:text-amber-900 transition-colors">{title}</span>
          {badge!=null&&<span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        {open?<ChevronUp className="w-4 h-4 text-amber-300"/>:<ChevronDown className="w-4 h-4 text-amber-300"/>}
      </button>
      {open&&<div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function TagInput({ label, items, onChange, placeholder }) {
  const [val,setVal]=useState("");
  const add=()=>{const t=val.trim();if(t&&!items.includes(t)){onChange([...items,t]);setVal("");}};
  return (
    <div>
      <label className={lc}>{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item,i)=>(
          <span key={i} className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
            {item}<button onClick={()=>onChange(items.filter((_,j)=>j!==i))} className="text-amber-400 hover:text-red-500 transition-colors"><X className="w-3 h-3"/></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input className={fc} value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();add();}}} placeholder={placeholder||"Type and press Enter"}/>
        <button onClick={add} className="px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-colors">Add</button>
      </div>
    </div>
  );
}

function BulletInput({ label, items, onChange, placeholder }) {
  const upd=(i,v)=>onChange(items.map((x,j)=>j===i?v:x));
  const rm=(i)=>onChange(items.filter((_,j)=>j!==i));
  return (
    <div>
      {label&&<label className={lc}>{label}</label>}
      <div className="space-y-1.5">
        {items.map((item,i)=>(
          <div key={i} className="flex gap-1.5">
            <input className={fc} value={item} onChange={e=>upd(i,e.target.value)} placeholder={placeholder||"Add a point"}/>
            <button onClick={()=>rm(i)} className="px-2 text-amber-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4"/></button>
          </div>
        ))}
        <button onClick={()=>onChange([...items,""])} className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-50 transition-colors font-semibold"><Plus className="w-3 h-3"/>Add point</button>
      </div>
    </div>
  );
}

/* ============================================================
   RESUME FORM
   ============================================================ */
function ResumeForm({ data, setData }) {
  const set=(path,val)=>setData(prev=>{
    const next=JSON.parse(JSON.stringify(prev));
    const parts=path.split("."); let cur=next;
    for(let i=0;i<parts.length-1;i++) cur=cur[parts[i]];
    cur[parts[parts.length-1]]=val;
    return next;
  });
  const updExp=(i,k,v)=>setData(p=>({...p,experience:p.experience.map((e,j)=>j===i?{...e,[k]:v}:e)}));
  const updSig=(i,k,v)=>setData(p=>({...p,signature:p.signature.map((e,j)=>j===i?{...e,[k]:v}:e)}));
  const updEdu=(i,k,v)=>setData(p=>({...p,education:p.education.map((e,j)=>j===i?{...e,[k]:v}:e)}));
  const updCert=(i,k,v)=>setData(p=>({...p,certifications:p.certifications.map((e,j)=>j===i?{...e,[k]:v}:e)}));

  return (
    <div className="space-y-0">
      <Accordion title="Personal Info">
        <div><label className={lc}>Full name</label><input className={fc} value={data.name} onChange={e=>set("name",e.target.value)} placeholder="Daniel Rossi"/></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={lc}>Email</label><input className={fc} value={data.contact.email} onChange={e=>set("contact.email",e.target.value)} placeholder="chef@email.com"/></div>
          <div><label className={lc}>Phone</label><input className={fc} value={data.contact.phone} onChange={e=>set("contact.phone",e.target.value)} placeholder="+61 400 000 000"/></div>
          <div><label className={lc}>Location</label><input className={fc} value={data.contact.location} onChange={e=>set("contact.location",e.target.value)} placeholder="Melbourne, VIC"/></div>
          <div><label className={lc}>Website</label><input className={fc} value={data.contact.website} onChange={e=>set("contact.website",e.target.value)} placeholder="yoursite.com.au"/></div>
          <div className="col-span-2"><label className={lc}>LinkedIn</label><input className={fc} value={data.contact.linkedin} onChange={e=>set("contact.linkedin",e.target.value)} placeholder="linkedin.com/in/you"/></div>
        </div>
        <div><label className={lc}>Professional summary</label><textarea className={fc} rows={3} value={data.summary} onChange={e=>set("summary",e.target.value)} placeholder="Brief overview of your culinary philosophy and experience..."/></div>
      </Accordion>

      <Accordion title="Specialties & Cuisines" badge={data.specialties.length}>
        <TagInput label="Specialties (press Enter to add)" items={data.specialties} onChange={v=>set("specialties",v)} placeholder="e.g. Modern Australian, Wood-Fire, Pastry..."/>
      </Accordion>

      <Accordion title="Experience" badge={data.experience.length}>
        {data.experience.map((exp,i)=>(
          <div key={i} className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Role {i+1}</span><button onClick={()=>setData(p=>({...p,experience:p.experience.filter((_,j)=>j!==i)}))} className="text-amber-300 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button></div>
            <div><label className={lc}>Job title</label><input className={fc} value={exp.title} onChange={e=>updExp(i,"title",e.target.value)} placeholder="Executive Chef"/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={lc}>Venue / Restaurant</label><input className={fc} value={exp.venue} onChange={e=>updExp(i,"venue",e.target.value)} placeholder="Ember & Stone Restaurant"/></div>
              <div><label className={lc}>Location</label><input className={fc} value={exp.location} onChange={e=>updExp(i,"location",e.target.value)} placeholder="Melbourne, VIC"/></div>
              <div><label className={lc}>Venue type</label><input className={fc} value={exp.type} onChange={e=>updExp(i,"type",e.target.value)} placeholder="Fine Dining / Pub / Hotel"/></div>
              <div><label className={lc}>Covers</label><input className={fc} value={exp.covers} onChange={e=>updExp(i,"covers",e.target.value)} placeholder="80 covers"/></div>
              <div><label className={lc}>Start</label><input className={fc} value={exp.start} onChange={e=>updExp(i,"start",e.target.value)} placeholder="Mar 2020"/></div>
              <div><label className={lc}>End</label><input className={fc} value={exp.end} onChange={e=>updExp(i,"end",e.target.value)} placeholder="Present"/></div>
            </div>
            <BulletInput items={exp.bullets||[]} onChange={v=>updExp(i,"bullets",v)} placeholder="Key achievement or responsibility"/>
          </div>
        ))}
        <button onClick={()=>setData(p=>({...p,experience:[...p.experience,{title:"",venue:"",location:"",type:"",covers:"",start:"",end:"",bullets:[]}]}))} className="w-full py-2 border border-dashed border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all"><Plus className="w-4 h-4"/>Add role</button>
      </Accordion>

      <Accordion title="Signature Dishes" badge={data.signature.length} defaultOpen={false}>
        <p className="text-[11px] text-amber-700/60 -mt-1 leading-relaxed">Dishes that define your cooking — menus, media mentions, and guest favourites.</p>
        {data.signature.map((s,i)=>(
          <div key={i} className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Dish {i+1}</span><button onClick={()=>setData(p=>({...p,signature:p.signature.filter((_,j)=>j!==i)}))} className="text-amber-300 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button></div>
            <div><label className={lc}>Dish name / description</label><input className={fc} value={s.dish} onChange={e=>updSig(i,"dish",e.target.value)} placeholder="Hand-rolled pappardelle, slow-braised lamb shoulder..."/></div>
            <div><label className={lc}>Note <span className="normal-case font-normal text-amber-300">(optional)</span></label><input className={fc} value={s.note} onChange={e=>updSig(i,"note",e.target.value)} placeholder="Featured in Gourmet Traveller (2023)"/></div>
          </div>
        ))}
        <button onClick={()=>setData(p=>({...p,signature:[...p.signature,{dish:"",note:""}]}))} className="w-full py-2 border border-dashed border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all"><Plus className="w-4 h-4"/>Add dish</button>
      </Accordion>

      <Accordion title="Training & Education" badge={data.education.length} defaultOpen={false}>
        {data.education.map((ed,i)=>(
          <div key={i} className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Entry {i+1}</span><button onClick={()=>setData(p=>({...p,education:p.education.filter((_,j)=>j!==i)}))} className="text-amber-300 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button></div>
            <div><label className={lc}>Qualification / Stage</label><input className={fc} value={ed.degree} onChange={e=>updEdu(i,"degree",e.target.value)} placeholder="Diploma of Hospitality / Stage at..."/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={lc}>Institution</label><input className={fc} value={ed.school} onChange={e=>updEdu(i,"school",e.target.value)} placeholder="William Angliss Institute"/></div>
              <div><label className={lc}>Year</label><input className={fc} value={ed.date} onChange={e=>updEdu(i,"date",e.target.value)} placeholder="2009"/></div>
            </div>
            <div><label className={lc}>Notes <span className="normal-case font-normal text-amber-300">(optional)</span></label><input className={fc} value={ed.notes} onChange={e=>updEdu(i,"notes",e.target.value)} placeholder="Full-time stage under Chef..."/></div>
          </div>
        ))}
        <button onClick={()=>setData(p=>({...p,education:[...p.education,{degree:"",school:"",location:"",date:"",notes:""}]}))} className="w-full py-2 border border-dashed border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all"><Plus className="w-4 h-4"/>Add entry</button>
      </Accordion>

      <Accordion title="Certifications" badge={data.certifications.length} defaultOpen={false}>
        {data.certifications.map((c,i)=>(
          <div key={i} className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Cert {i+1}</span><button onClick={()=>setData(p=>({...p,certifications:p.certifications.filter((_,j)=>j!==i)}))} className="text-amber-300 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button></div>
            <div><label className={lc}>Certification name</label><input className={fc} value={c.name} onChange={e=>updCert(i,"name",e.target.value)} placeholder="Food Safety Supervisor Certificate"/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={lc}>Issuer</label><input className={fc} value={c.issuer} onChange={e=>updCert(i,"issuer",e.target.value)} placeholder="SafeFood NSW"/></div>
              <div><label className={lc}>Date</label><input className={fc} value={c.date} onChange={e=>updCert(i,"date",e.target.value)} placeholder="2024 / Current"/></div>
            </div>
          </div>
        ))}
        <button onClick={()=>setData(p=>({...p,certifications:[...p.certifications,{name:"",issuer:"",date:""}]}))} className="w-full py-2 border border-dashed border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all"><Plus className="w-4 h-4"/>Add certification</button>
      </Accordion>

      <Accordion title="Skills" defaultOpen={false}>
        <TagInput label="Skills (press Enter to add)" items={data.skills} onChange={v=>set("skills",v)} placeholder="Menu Development, HACCP, Food Cost..."/>
      </Accordion>

      <Accordion title="Awards & Recognition" defaultOpen={false}>
        <BulletInput items={data.awards} onChange={v=>set("awards",v)} placeholder="Good Food Guide — One Chef's Hat (2024)"/>
      </Accordion>
    </div>
  );
}

/* ============================================================
   TEMPLATE CARD
   ============================================================ */
function TemplateCard({ tpl, selected, onClick }) {
  return (
    <button onClick={onClick} className={`text-left p-3 rounded-xl border-2 transition-all ${selected?"border-amber-700 bg-amber-900 shadow-lg shadow-amber-900/20":"border-amber-100 bg-white hover:border-amber-300 hover:shadow-sm"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex gap-1">
          {tpl.swatch.map((c,i)=><div key={i} className="w-4 h-4 rounded-sm border border-white/20 shadow-sm" style={{ background:c }}/>)}
        </div>
        <span className={`text-sm font-bold ${selected?"text-amber-100":"text-stone-800"}`}>{tpl.label}</span>
        {selected&&<Check className="w-3.5 h-3.5 text-amber-300 ml-auto"/>}
      </div>
      <p className={`text-[11px] leading-snug ${selected?"text-amber-300/80":"text-stone-400"}`}>{tpl.blurb}</p>
    </button>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function MiseCV() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [data, setData] = useState(SAMPLE);
  const [cl, setCl] = useState(SAMPLE_CL);
  const [tplId, setTplId] = useState("mise-en-place");
  const [accentOverride, setAccentOverride] = useState(null);
  const [rightPanel, setRightPanel] = useState("resume");
  const [scale, setScale] = useState(0.75);
  const [clScale, setClScale] = useState(0.75);
  const [exporting, setExporting] = useState(null);
  const wrapRef    = useRef(null);
  const clWrapRef  = useRef(null);
  const previewRef = useRef(null);
  const clPrevRef  = useRef(null);
  const printRef   = useRef(null);
  const clPrintRef = useRef(null);

  const tpl = TEMPLATES.find(t=>t.id===tplId)||TEMPLATES[0];
  const effectiveAccent = accentOverride||tpl.accent;

  useEffect(()=>{
    const fit=()=>{
      if(wrapRef.current){ const w=wrapRef.current.clientWidth; setScale(Math.max(0.3,Math.min(1,(w-32)/(8.5*96)))); }
      if(clWrapRef.current){ const w=clWrapRef.current.clientWidth; setClScale(Math.max(0.3,Math.min(1,(w-32)/(8.5*96)))); }
    };
    fit(); window.addEventListener("resize",fit); return()=>window.removeEventListener("resize",fit);
  },[unlocked, rightPanel]);

  const handleUnlock=()=>{ if(pw==="MiseCV2026"){setUnlocked(true);setPwErr(false);}else{setPwErr(true);setPw("");} };

  // Auto-fill CL sender from resume data
  const handleAutoFill=()=>setCl(p=>({...p,
    senderName:    data.name||p.senderName,
    senderEmail:   data.contact?.email||p.senderEmail,
    senderPhone:   data.contact?.phone||p.senderPhone,
    senderLocation:data.contact?.location||p.senderLocation,
    senderWebsite: data.contact?.website||p.senderWebsite,
    senderTitle:   data.experience?.[0]?.title||p.senderTitle||"",
  }));

  const handlePDF   =()=>{ setExporting("pdf");    try{exportPDF(printRef.current,data.name);}catch(e){alert("Export failed.");}finally{setTimeout(()=>setExporting(null),500);} };
  const handleWord  =()=>{ setExporting("word");   try{exportWord(data,effectiveAccent);}catch(e){alert("Export failed.");}finally{setTimeout(()=>setExporting(null),400);} };
  const handleCLPDF =()=>{ setExporting("clpdf");  try{exportCLPDF(clPrintRef.current,cl.senderName);}catch(e){alert("Export failed.");}finally{setTimeout(()=>setExporting(null),500);} };
  const handleCLWord=()=>{ setExporting("clword"); try{exportCLWord(cl,effectiveAccent);}catch(e){alert("Export failed.");}finally{setTimeout(()=>setExporting(null),400);} };

  // Shared template + accent picker used in both tabs
  const TemplatePicker = () => (
    <div className="px-4 pt-4 pb-3" style={{ background:"#FFFDF9", borderBottom:"1px solid #E8DDD0" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-widest" style={{ color:"#A08060" }}>TEMPLATE</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold" style={{ color:"#A08060" }}>Accent</span>
          <label className="relative w-6 h-6 rounded-lg overflow-hidden border border-amber-200 cursor-pointer" style={{ background:effectiveAccent }}>
            <input type="color" value={effectiveAccent} onChange={e=>setAccentOverride(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
          </label>
          <div className="flex gap-1">
            {ACCENT_PRESETS.map(c=>{
              const active=effectiveAccent.toLowerCase()===c.toLowerCase();
              return <button key={c} onClick={()=>setAccentOverride(c)} title={c} className="w-4 h-4 rounded-sm border transition-transform hover:scale-110" style={{ background:c, borderColor:active?"#2C1810":"rgba(160,128,96,0.3)", outline:active?"1px solid #2C1810":"none", outlineOffset:"1px" }}/>;
            })}
          </div>
          {accentOverride&&<button onClick={()=>setAccentOverride(null)} className="text-[10px] font-semibold underline" style={{ color:"#C4622D" }}>Reset</button>}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {TEMPLATES.map(t=><TemplateCard key={t.id} tpl={t} selected={tplId===t.id} onClick={()=>{setTplId(t.id);setAccentOverride(null);}}/>)}
      </div>
    </div>
  );

  /* ── PASSWORD GATE ── */
  if(!unlocked) return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background:"#1A0E08" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap'); *, *::before, *::after{box-sizing:border-box;margin:0;padding:0;} body{font-family:'Nunito',sans-serif;}`}</style>
      <div className="w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ background:"linear-gradient(135deg,#C4622D,#8B3A1A)", boxShadow:"0 8px 32px rgba(196,98,45,0.4)" }}>
            <span style={{ fontSize:"28px" }}>🔪</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ letterSpacing:"0.06em" }}>MiseCV</h1>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>Hospitality &amp; Chef Resume + Cover Letter</p>
        </div>
        <div className="overflow-hidden rounded-2xl" style={{ border:"1px solid rgba(196,98,45,0.25)", background:"rgba(255,255,255,0.04)" }}>
          <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(196,98,45,0.15)" }}>
            <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}} onKeyDown={e=>e.key==="Enter"&&handleUnlock()} autoFocus placeholder="Enter password"
              className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none transition-all"
              style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${pwErr?"#e74c3c":"rgba(196,98,45,0.3)"}`, color:"#fff" }}/>
            {pwErr&&<p className="text-xs mt-2" style={{ color:"#e74c3c" }}>Incorrect password — please try again.</p>}
          </div>
          <div className="px-5 py-3 flex justify-end" style={{ background:"rgba(255,255,255,0.02)" }}>
            <button onClick={handleUnlock} className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background:"linear-gradient(135deg,#C4622D,#8B3A1A)", boxShadow:"0 4px 12px rgba(196,98,45,0.3)" }}>Unlock →</button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── MAIN EDITOR ── */
  return (
    <div className="min-h-screen w-full" style={{ background:"#F5EFE6" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Lato:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;500;600;700;800&family=Josefin+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'); *, *::before, *::after{box-sizing:border-box;} body{font-family:'Nunito',sans-serif;} .vs::-webkit-scrollbar{width:6px;} .vs::-webkit-scrollbar-track{background:transparent;} .vs::-webkit-scrollbar-thumb{background:rgba(196,98,45,0.2);border-radius:3px;} .po{position:absolute;left:-99999px;top:0;width:8.5in;pointer-events:none;}`}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3" style={{ background:"#2C1810", borderBottom:"2px solid #C4622D" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#C4622D,#8B3A1A)" }}>
            <span style={{ fontSize:"14px" }}>🔪</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white" style={{ letterSpacing:"0.06em" }}>MiseCV</div>
            <div className="text-[10px] font-semibold tracking-widest" style={{ color:"rgba(196,98,45,0.85)" }}>HOSPITALITY &amp; CHEF</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>{setData(SAMPLE);setCl(SAMPLE_CL);setTplId("mise-en-place");setAccentOverride(null);}} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors" style={{ color:"rgba(255,255,255,0.5)" }}>
            <RotateCcw className="w-3.5 h-3.5"/>Sample
          </button>
          <button onClick={()=>{setData(EMPTY);setCl(EMPTY_CL);}} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors" style={{ color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <X className="w-3 h-3"/>Clear
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] min-h-[calc(100vh-49px)]">

        {/* LEFT — resume + cover letter form */}
        <aside className="vs" style={{ background:"#FFFDF9", borderRight:"1px solid #E8DDD0", height:"calc(100vh - 49px)", overflowY:"auto" }}>
          <div className="p-5">
            <h2 className="font-bold mb-1" style={{ fontSize:"16px", color:"#2C1810", letterSpacing:"0.02em" }}>Resume</h2>
            <p className="text-xs mb-5 leading-relaxed" style={{ color:"#A08060" }}>Fill in your details — the preview updates live.</p>
            <ResumeForm data={data} setData={setData}/>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background:"linear-gradient(to right, transparent, #E8C4A0)" }}/>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background:"#FFF3E8", border:"1px solid #E8C4A0" }}>
                <FileEdit className="w-3 h-3" style={{ color:"#C4622D" }}/>
                <span className="text-[11px] font-bold tracking-widest" style={{ color:"#C4622D" }}>COVER LETTER</span>
              </div>
              <div className="flex-1 h-px" style={{ background:"linear-gradient(to left, transparent, #E8C4A0)" }}/>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color:"#A08060" }}>Your cover letter automatically matches the active template and accent colour.</p>
            <CoverLetterForm cl={cl} setCl={setCl} onAutoFill={handleAutoFill}/>
          </div>
        </aside>

        {/* RIGHT — tabs + preview */}
        <main className="flex flex-col overflow-hidden" style={{ height:"calc(100vh - 49px)" }}>

          {/* Tab bar */}
          <div className="flex items-end gap-0" style={{ background:"#FFFDF9", borderBottom:"1px solid #E8DDD0" }}>
            <button onClick={()=>setRightPanel("resume")} className="px-5 py-2.5 text-xs font-bold tracking-widest border-b-2 transition-all"
              style={{ borderBottomColor:rightPanel==="resume"?"#C4622D":"transparent", color:rightPanel==="resume"?"#2C1810":"#A08060" }}>
              RESUME
            </button>
            <button onClick={()=>setRightPanel("coverletter")} className="px-5 py-2.5 text-xs font-bold tracking-widest border-b-2 transition-all flex items-center gap-1.5"
              style={{ borderBottomColor:rightPanel==="coverletter"?"#C4622D":"transparent", color:rightPanel==="coverletter"?"#2C1810":"#A08060" }}>
              <FileEdit className="w-3 h-3"/>COVER LETTER
            </button>
          </div>

          {/* ── RESUME TAB ── */}
          {rightPanel==="resume"&&<>
            <TemplatePicker/>
            <div ref={wrapRef} className="flex-1 overflow-auto vs p-4 md:p-8" style={{ background:"#E8DDD0" }}>
              <div style={{ width:`${8.5*scale}in`, margin:"0 auto", paddingBottom:"2rem" }}>
                <div style={{ transform:`scale(${scale})`, transformOrigin:"top left", width:"8.5in" }}>
                  <div ref={previewRef}><ResumePreview templateId={tplId} data={data} accent={effectiveAccent}/></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ background:"#2C1810", borderTop:"2px solid #C4622D" }}>
              <div>
                <div className="text-[10px] font-bold tracking-widest" style={{ color:"rgba(196,98,45,0.6)" }}>TEMPLATE</div>
                <div className="text-sm font-bold" style={{ color:"#E8C9A0", letterSpacing:"0.04em" }}>{tpl.label}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleWord} disabled={exporting!==null} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-all" style={{ border:"1px solid rgba(196,98,45,0.4)", color:"rgba(255,255,255,0.8)", background:"transparent", letterSpacing:"0.06em" }}>
                  {exporting==="word"?<Loader2 className="w-4 h-4 animate-spin"/>:<FileText className="w-4 h-4"/>}WORD
                </button>
                <button onClick={handlePDF} disabled={exporting!==null} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-all" style={{ background:"linear-gradient(135deg,#C4622D,#8B3A1A)", color:"#fff", border:"none", letterSpacing:"0.06em", boxShadow:"0 4px 12px rgba(196,98,45,0.4)" }}>
                  {exporting==="pdf"?<Loader2 className="w-4 h-4 animate-spin"/>:<Download className="w-4 h-4"/>}PDF
                </button>
              </div>
            </div>
          </>}

          {/* ── COVER LETTER TAB ── */}
          {rightPanel==="coverletter"&&<>
            <TemplatePicker/>
            <div ref={clWrapRef} className="flex-1 overflow-auto vs p-4 md:p-8" style={{ background:"#E8DDD0" }}>
              <div style={{ width:`${8.5*clScale}in`, margin:"0 auto", paddingBottom:"2rem" }}>
                <div style={{ transform:`scale(${clScale})`, transformOrigin:"top left", width:"8.5in" }}>
                  <div ref={clPrevRef}><CoverLetterPreview templateId={tplId} cl={cl} accent={effectiveAccent}/></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ background:"#2C1810", borderTop:"2px solid #C4622D" }}>
              <div>
                <div className="text-[10px] font-bold tracking-widest" style={{ color:"rgba(196,98,45,0.6)" }}>MATCHING</div>
                <div className="text-sm font-bold" style={{ color:"#E8C9A0", letterSpacing:"0.04em" }}>{tpl.label} · Cover Letter</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCLWord} disabled={exporting!==null} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-all" style={{ border:"1px solid rgba(196,98,45,0.4)", color:"rgba(255,255,255,0.8)", background:"transparent", letterSpacing:"0.06em" }}>
                  {exporting==="clword"?<Loader2 className="w-4 h-4 animate-spin"/>:<FileText className="w-4 h-4"/>}WORD
                </button>
                <button onClick={handleCLPDF} disabled={exporting!==null} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-all" style={{ background:"linear-gradient(135deg,#C4622D,#8B3A1A)", color:"#fff", border:"none", letterSpacing:"0.06em", boxShadow:"0 4px 12px rgba(196,98,45,0.4)" }}>
                  {exporting==="clpdf"?<Loader2 className="w-4 h-4 animate-spin"/>:<Download className="w-4 h-4"/>}PDF
                </button>
              </div>
            </div>
          </>}

        </main>
      </div>

      {/* Off-screen print areas */}
      <div ref={printRef} className="po" aria-hidden="true">
        <ResumePreview templateId={tplId} data={data} accent={effectiveAccent}/>
      </div>
      <div ref={clPrintRef} className="po" aria-hidden="true">
        <CoverLetterPreview templateId={tplId} cl={cl} accent={effectiveAccent}/>
      </div>
    </div>
  );
}
