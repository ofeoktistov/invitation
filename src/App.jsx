import { useState, useRef, useEffect } from "react";

const options = [
  { id:"horse", emoji:"🐴", title:"Horse Riding", tag:"Active & Fun", description:"Neither of us probably knows what we're doing and that's the point. We ride horses in the Prague outskirts and watch the wilderness.", gradient:"linear-gradient(135deg,#f97316,#fb923c)", tagBg:"#fff7ed", tagColor:"#ea580c", border:"#fed7aa" },
  { id:"daytrip", emoji:"🗺️", title:"Day Trip", tag:"Adventure", description:"We pick a destination, take a train, and spend a day somewhere that isn't Prague.", gradient:"linear-gradient(135deg,#2563eb,#3b82f6)", tagBg:"#eff6ff", tagColor:"#1d4ed8", border:"#bfdbfe" },
  { id:"food", emoji:"🍜", title:"Something New to Eat", tag:"Culinary Adventure", description:"I'll pick the place and make sure there is something vegan. You bring gay jokes.", gradient:"linear-gradient(135deg,#7c3aed,#8b5cf6)", tagBg:"#f5f3ff", tagColor:"#6d28d9", border:"#ddd6fe" },
  { id:"walk", emoji:"🚶", title:"Take a Nice Walk", tag:"Easy & Relaxed", description:"Gay and shit jokes, swearing, beating me and being yourself are all encouraged.", gradient:"linear-gradient(135deg,#059669,#10b981)", tagBg:"#ecfdf5", tagColor:"#047857", border:"#a7f3d0" },
  { id:"surprise", emoji:"🎲", title:"Surprise Me", tag:"Mystery", description:"I pick everything. You just show up.", gradient:"linear-gradient(135deg,#db2777,#f43f5e)", tagBg:"#fdf2f8", tagColor:"#be185d", border:"#fbcfe8" },
];

const DAYTRIP_DESTINATIONS = [
  {
    id:"karlovyvary", name:"Karlovy Vary", emoji:"🏛️",
    desc:"Thermal springs and colonnades. Looks like a Wes Anderson film. We drink from the springs and pretend it tastes good.",
    trainTime:"~3h", busTime:"~2h", distance:"130km", direction:"West",
    svgX:62, svgY:72,
  },
  {
    id:"ceskykrumlov", name:"Český Krumlov", emoji:"🏰",
    desc:"Medieval castle, river bends, and the prettiest small town in Bohemia. Absurdly charming.",
    trainTime:"~3.5h", busTime:"~3h", distance:"170km", direction:"South",
    svgX:148, svgY:158,
  },
];

const ALL_TIMES = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
// Horse riding: specific available slots (year, 0-indexed month, day)
const HORSE_SLOTS = {
  "2026-6-11": ["15:30", "16:00"],
  "2026-6-12": ["12:00"],
  "2026-6-13": ["11:00", "12:00", "14:00"],
  "2026-6-15": ["09:30"],
  "2026-6-18": ["11:00", "12:00", "14:00", "15:00", "16:00"],
};
function horseKey(y,m,d){ return `${y}-${m}-${d}`; }
function isHorseAvailable(y,m,d){ return !!HORSE_SLOTS[horseKey(y,m,d)]; }
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const BG = "linear-gradient(160deg,#f0f4ff 0%,#faf5ff 50%,#fff7f0 100%)";
const FONT = "'Inter','Segoe UI',sans-serif";
const PUR = "linear-gradient(135deg,#4f46e5,#7c3aed)";
const PRAGUE_X = 148, PRAGUE_Y = 82;

function getSurpriseSlots(y,m,d){
  const set=new Set();
  (HORSE_SLOTS[horseKey(y,m,d)]||[]).forEach(t=>set.add(t));
  const dow=new Date(y,m,d).getDay();
  const eveningStart=dow===4?"20:00":"18:00";
  if(dow!==5){
    // food
    if(!isBlockedDate(y,m,d,"food")){
      if(dow===0) ALL_TIMES.forEach(t=>set.add(t));
      else if(dow===6) ALL_TIMES.filter(t=>t<="16:00").forEach(t=>set.add(t));
      else ALL_TIMES.filter(t=>t>=eveningStart).forEach(t=>set.add(t));
    }
    // walk
    if(dow===0) ALL_TIMES.forEach(t=>set.add(t));
    else if(dow===6) ALL_TIMES.filter(t=>t<="16:00").forEach(t=>set.add(t));
    else if(dow!==5) ALL_TIMES.filter(t=>t>=eveningStart).forEach(t=>set.add(t));
    // daytrip (Sundays)
    if(dow===0) ALL_TIMES.forEach(t=>set.add(t));
  }
  return [...set].sort((a,b)=>{const[ah,am]=a.split(":").map(Number);const[bh,bm]=b.split(":").map(Number);return(ah*60+am)-(bh*60+bm);});
}
function getDow(y,m,d){ return new Date(y,m,d).getDay(); }
function isFriday(y,m,d){ return getDow(y,m,d)===5; }
const BLOCKED=[{year:2026,month:6,day:11}];
function isBlockedDate(y,m,d,choice){ if(choice!=="food")return false; return BLOCKED.some(b=>b.year===y&&b.month===m&&b.day===d); }
function isDayDisabled(y,m,d,choice){
  if(!d)return true;
  const dow=getDow(y,m,d);
  if(choice==="horse") return !isHorseAvailable(y,m,d);
  if(choice==="daytrip") return dow!==0;
  if(choice==="food"){ if(dow===5)return true; if(isBlockedDate(y,m,d,choice))return true; return false; }
  if(choice==="walk") return dow===5;
  if(choice==="surprise") return getSurpriseSlots(y,m,d).length===0;
  return false;
}
function getSlots(y,m,d,choice){
  if(d===null)return[];
  const dow=getDow(y,m,d);
  if(choice==="horse") return HORSE_SLOTS[horseKey(y,m,d)] || [];
  if(choice==="daytrip") return ALL_TIMES;
  if(choice==="food"){ if(dow===0)return ALL_TIMES; if(dow===6)return ALL_TIMES.filter(t=>t<="16:00"); return ALL_TIMES.filter(t=>t>="18:00"); }
  if(choice==="walk"){ if(dow===0)return ALL_TIMES; if(dow===6)return ALL_TIMES.filter(t=>t<="16:00"); return ALL_TIMES.filter(t=>t>="18:00"); }
  if(choice==="surprise") return getSurpriseSlots(y,m,d);
  return ALL_TIMES;
}
function getHints(choice){
  if(choice==="horse") return [{label:"Jul 11 Sat",note:"15:30, 16:00"},{label:"Jul 12 Sun",note:"14:00"},{label:"Jul 13 Mon",note:"11:00–14:00"},{label:"Jul 15 Wed",note:"09:30"},{label:"Jul 18 Sat",note:"11:00–16:00"}];
  if(choice==="daytrip") return [{label:"Mon–Sat",note:"Not available",muted:true},{label:"Sunday",note:"Any time ✓"}];
  if(choice==="food") return [{label:"Mon–Thu",note:"From 18:00"},{label:"Friday",note:"Not available",muted:true},{label:"Saturday",note:"Till 16:00 (Jul 11 blocked)"},{label:"Sunday",note:"10:00–21:00"}];
  if(choice==="walk") return [{label:"Mon–Thu",note:"From 18:00"},{label:"Friday",note:"Not available",muted:true},{label:"Saturday",note:"Till 16:00"},{label:"Sunday",note:"Any time"}];
  if(choice==="surprise") return [{label:"Mon–Thu",note:"From 18:00"},{label:"Friday",note:"Not available",muted:true},{label:"Saturday",note:"Various times"},{label:"Sunday",note:"Any time"}];
  return[];
}
function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }

function DayTripPicker({ dest, setDest }) {
  return (
    <div style={{width:"100%",maxWidth:"500px"}}>
      {/* SVG Map */}
      <div style={{background:"white",borderRadius:"24px",padding:"1.5rem",marginBottom:"1rem",boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
        <p style={{fontWeight:"800",fontSize:"0.9rem",color:"#111827",marginBottom:"1rem"}}>Pick your destination</p>
        <svg viewBox="0 0 400 200" style={{width:"100%",height:"auto",borderRadius:"12px",background:"#e0f2fe"}}>
          {/* Czech Republic rough outline */}
          <path d="M 62 48 L 80 32 L 115 24 L 158 19 L 198 22 L 238 17 L 272 27 L 312 37 L 348 52 L 363 74 L 356 97 L 338 117 L 310 131 L 282 147 L 252 157 L 220 163 L 188 167 L 158 162 L 128 152 L 98 141 L 72 127 L 52 107 L 42 87 L 48 64 Z"
            fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5"/>

          {/* Dashed lines from Prague */}
          {DAYTRIP_DESTINATIONS.map(d=>(
            <line key={d.id} x1={PRAGUE_X} y1={PRAGUE_Y} x2={d.svgX} y2={d.svgY}
              stroke={dest===d.id?"#4f46e5":"#94a3b8"} strokeWidth={dest===d.id?"2.5":"1.5"} strokeDasharray="6,4"/>
          ))}

          {/* Distance labels on lines */}
          {DAYTRIP_DESTINATIONS.map(d=>{
            const mx=(PRAGUE_X+d.svgX)/2, my=(PRAGUE_Y+d.svgY)/2;
            return (
              <g key={d.id+"label"}>
                <rect x={mx-18} y={my-9} width="36" height="16" rx="8" fill={dest===d.id?"#4f46e5":"#e2e8f0"}/>
                <text x={mx} y={my+4} textAnchor="middle" fontSize="8" fontWeight="700" fill={dest===d.id?"white":"#64748b"}>{d.distance}</text>
              </g>
            );
          })}

          {/* Destination dots */}
          {DAYTRIP_DESTINATIONS.map(d=>(
            <g key={d.id} onClick={()=>setDest(d.id)} style={{cursor:"pointer"}}>
              <circle cx={d.svgX} cy={d.svgY} r="18" fill={dest===d.id?"#4f46e5":"white"} stroke={dest===d.id?"#4f46e5":"#94a3b8"} strokeWidth="2"/>
              <text x={d.svgX} y={d.svgY+5} textAnchor="middle" fontSize="14">{d.emoji}</text>
              <text x={d.svgX} y={d.svgY+32} textAnchor="middle" fontSize="8" fontWeight="700" fill="#1e293b">{d.name}</text>
            </g>
          ))}

          {/* Prague dot */}
          <circle cx={PRAGUE_X} cy={PRAGUE_Y} r="10" fill="#1e293b"/>
          <text x={PRAGUE_X} y={PRAGUE_Y+4} textAnchor="middle" fontSize="9" fill="white" fontWeight="800">P</text>
          <text x={PRAGUE_X} y={PRAGUE_Y-16} textAnchor="middle" fontSize="9" fontWeight="800" fill="#1e293b">Prague</text>
        </svg>
      </div>

      {/* Destination cards */}
      {DAYTRIP_DESTINATIONS.map(d=>{
        const isSel=dest===d.id;
        return (
          <div key={d.id} onClick={()=>setDest(d.id)}
            style={{background:"white",border:isSel?"2px solid #4f46e5":"2px solid #f3f4f6",borderRadius:"20px",padding:"1.2rem 1.4rem",cursor:"pointer",marginBottom:"0.75rem",boxShadow:isSel?"0 8px 30px rgba(79,70,229,0.15)":"0 1px 4px rgba(0,0,0,0.05)",transition:"all 0.18s",transform:isSel?"translateY(-2px)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.8rem",marginBottom:"0.5rem"}}>
              <span style={{fontSize:"1.4rem"}}>{d.emoji}</span>
              <span style={{fontWeight:"700",fontSize:"1rem",color:"#111827"}}>{d.name}</span>
              <span style={{marginLeft:"auto",fontSize:"0.75rem",color:"#9ca3af",fontWeight:"600"}}>{d.direction} · {d.distance}</span>
            </div>
            <p style={{color:"#6b7280",fontSize:"0.85rem",lineHeight:"1.6",margin:"0 0 0.75rem 0"}}>{d.desc}</p>
            <div style={{display:"flex",gap:"0.75rem"}}>
              <span style={{fontSize:"0.78rem",background:"#f0fdf4",color:"#166534",padding:"0.25rem 0.75rem",borderRadius:"1rem",fontWeight:"600"}}>🚌 Bus {d.busTime}</span>
              <span style={{fontSize:"0.78rem",background:"#eff6ff",color:"#1e40af",padding:"0.25rem 0.75rem",borderRadius:"1rem",fontWeight:"600"}}>🚂 Train {d.trainTime}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function NoButton({ onYes }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        const angle = Math.atan2(dy, dx);
        const speed = 160;
        const newX = Math.max(-260, Math.min(260, offsetRef.current.x - Math.cos(angle) * speed));
        const newY = Math.max(-160, Math.min(160, offsetRef.current.y - Math.sin(angle) * speed));
        offsetRef.current = { x: newX, y: newY };
        setOffset({ x: newX, y: newY });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", marginTop: "0.5rem", position: "relative", minHeight: "140px" }}>
      <button onClick={onYes}
        style={{ background: PUR, color: "white", border: "none", padding: "0.95rem 2.8rem", borderRadius: "2rem", fontSize: "1rem", fontWeight: "700", cursor: "pointer", fontFamily: FONT, boxShadow: "0 4px 20px rgba(79,70,229,0.35)", position: "relative", zIndex: 10 }}>
        Yes ✨
      </button>
      <div ref={btnRef} style={{ display: "inline-block", transform: `translate(${offset.x}px, ${offset.y}px)`, transition: "transform 0.1s cubic-bezier(.34,1.2,.64,1)", position: "relative", zIndex: 10, pointerEvents: "none" }}>
        <button style={{ background: "white", color: "#9ca3af", border: "2px solid #e5e7eb", padding: "0.95rem 2.8rem", borderRadius: "2rem", fontSize: "1rem", fontWeight: "700", cursor: "not-allowed", fontFamily: FONT, animation: "swingBtn 1.4s ease-in-out infinite", transformOrigin: "top center", display: "block", pointerEvents: "none" }}>
          No
        </button>
      </div>
    </div>
  );
}

function JokeCard({ onMarco }) {
  const [state,setState]=useState("idle");
  const handleClick=()=>{ if(state!=="idle")return; setState("falling"); setTimeout(()=>setState("shattered"),700); };
  if(state==="shattered") return (
    <div style={{background:"linear-gradient(135deg,#fef9c3,#fef08a)",border:"2px solid #fde047",borderRadius:"20px",padding:"1.4rem 1.5rem",animation:"fadeIn 0.4s ease"}}>
      <p style={{color:"#854d0e",fontSize:"0.95rem",lineHeight:"1.7",marginBottom:"1rem",fontWeight:"500"}}>
        💔 Oops! Actually, this option shouldn't exist because the whole point of this invitation is to not let you die at home :)
      </p>
      <button onClick={onMarco} style={{background:"transparent",border:"1px solid #d97706",color:"#92400e",padding:"0.4rem 1rem",borderRadius:"1rem",fontSize:"0.78rem",fontWeight:"600",cursor:"pointer",fontFamily:FONT,opacity:0.7}}>
        Still No.
      </button>
    </div>
  );
  return (
    <div onClick={handleClick} style={{background:"white",border:"2px solid #f3f4f6",borderRadius:"20px",padding:"1.4rem 1.5rem",cursor:"pointer",display:"flex",gap:"1rem",alignItems:"flex-start",transformOrigin:"center bottom",animation:state==="falling"?"fallAndShatter 0.7s ease-in forwards":"none",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <div style={{background:"#f9fafb",borderRadius:"14px",width:"52px",height:"52px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>🏠</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.35rem",flexWrap:"wrap"}}>
          <span style={{fontSize:"1rem",fontWeight:"700",color:"#111827"}}>Go Home and Die</span>
          <span style={{background:"#fef2f2",color:"#dc2626",fontSize:"0.7rem",fontWeight:"700",padding:"0.2rem 0.6rem",borderRadius:"1rem"}}>Classic option</span>
        </div>
        <p style={{color:"#6b7280",fontSize:"0.88rem",lineHeight:"1.6",margin:0}}>Stay in, suffer and cringe from your neighbour Sergey.</p>
      </div>
      <div style={{width:"20px",height:"20px",borderRadius:"50%",border:"2px solid #d1d5db",background:"white",flexShrink:0,marginTop:"4px"}}/>
    </div>
  );
}

export default function App() {
  const [step,setStep]=useState(0);
  const [selected,setSelected]=useState(null);
  const [dayTripDest,setDayTripDest]=useState(null);
  const [hovered,setHovered]=useState(null);
  const [comment,setComment]=useState("");
  const [sending,setSending]=useState(false);
  const [sendError,setSendError]=useState(false);
  const today=new Date();
  const [calYear,setCalYear]=useState(today.getFullYear());
  const [calMonth,setCalMonth]=useState(today.getMonth());
  const [selDate,setSelDate]=useState(null);
  const [selTime,setSelTime]=useState(null);

  const choice=options.find(o=>o.id===selected);
  const destInfo=DAYTRIP_DESTINATIONS.find(d=>d.id===dayTripDest);
  const daysInMonth=getDaysInMonth(calYear,calMonth);
  const firstDay=getFirstDay(calYear,calMonth);
  const isPast=(d)=>{ const dt=new Date(calYear,calMonth,d); const t=new Date(); t.setHours(0,0,0,0); return dt<t; };
  const isDisabled=(d)=>isPast(d)||isDayDisabled(calYear,calMonth,d,selected);
  const timeSlots=getSlots(calYear,calMonth,selDate,selected);
  const isToday=(d)=>d===today.getDate()&&calMonth===today.getMonth()&&calYear===today.getFullYear();
  const formatDate=(d)=>{ if(!d)return""; return new Date(calYear,calMonth,d).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}); };
  const prevMonth=()=>{ if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); setSelDate(null);setSelTime(null); };
  const nextMonth=()=>{ if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); setSelDate(null);setSelTime(null); };
  const reset=()=>{ setStep(1);setSelected(null);setDayTripDest(null);setSelDate(null);setSelTime(null);setComment(""); };
  const handleConfirm = async () => {
    setSending(true);
    setSendError(false);
    const activityTitle = selected === "daytrip" && destInfo ? destInfo.name : choice?.title;
    try {
      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      window.emailjs.init("nW4clJz0OXUocTddy");
      await window.emailjs.send("service_zfi5tsw", "template_kjszici", {
        choice: activityTitle,
        date: formatDate(selDate),
        time: selTime,
        comment: comment || "—",
      });
      setStep(3);
    } catch (e) {
      console.error("EmailJS error:", e);
      setSendError(true);
    } finally {
      setSending(false);
    }
  };
  const handleMarco = async () => {
    setStep("marco");
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_zfi5tsw",
          template_id: "template_kjszici",
          user_id: "nW4clJz0OXUocTddy",
          template_params: {
            choice: "Go out with Marco",
            date: "—",
            time: "—",
            comment: "—",
          },
        }),
      });
    } catch (e) {
      console.error("Marco email error:", e);
    }
  };

  const canProceedStep1 = selected && (selected !== "daytrip" || dayTripDest);

  const displayTitle = selected==="daytrip" && destInfo ? destInfo.name : choice?.title;
  const displayEmoji = selected==="daytrip" && destInfo ? destInfo.emoji : choice?.emoji;

  const KEYFRAMES = `
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes swingBtn{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
    @keyframes fallAndShatter{0%{transform:translateY(0) rotate(0deg);opacity:1}40%{transform:translateY(8px) rotate(-3deg);opacity:1}70%{transform:translateY(30px) rotate(8deg) scaleX(1.05);opacity:0.7}85%{transform:translateY(60px) rotate(-5deg) scale(0.8);opacity:0.3}100%{transform:translateY(80px) rotate(10deg) scale(0.1);opacity:0}}
  `;

  // ── STEP 0: Intro ─────────────────────────────────────────────────────────
  if(step===0) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT,padding:"2rem",textAlign:"center"}}>
      <style>{KEYFRAMES}</style>
      <div style={{maxWidth:"520px"}}>
        <div style={{fontSize:"3rem",marginBottom:"1.5rem"}}>✉️</div>
        <h1 style={{fontSize:"clamp(1.8rem,5vw,2.8rem)",fontWeight:"900",color:"#111827",lineHeight:"1.2",marginBottom:"1rem",letterSpacing:"-0.02em"}}>
          This is an invitation<br/>to an adventure.
        </h1>
        <p style={{color:"#6b7280",fontSize:"clamp(1rem,2.5vw,1.15rem)",lineHeight:"1.7",marginBottom:"2.5rem"}}>
          Do you want to discover what's inside?
        </p>
        <NoButton onYes={()=>setStep(1)} />
      </div>
    </div>
  );

  // ── STEP MARCO ────────────────────────────────────────────────────────────
  if(step==="marco") return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT,padding:"2rem",textAlign:"center"}}>
      <style>{KEYFRAMES}</style>
      <div style={{fontSize:"3.5rem",marginBottom:"1rem"}}>🤌</div>
      <h2 style={{fontSize:"clamp(1.5rem,4vw,2rem)",fontWeight:"900",color:"#111827",marginBottom:"1rem"}}>
        Ok, I will go with Marco then :)
      </h2>
      <p style={{color:"#9ca3af",fontSize:"0.9rem"}}>Bold choice.</p>
    </div>
  );

  // ── STEP 3 ─────────────────────────────────────────────────────────────────
  if(step===3&&choice) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT,padding:"2rem",textAlign:"center"}}>
      <style>{KEYFRAMES}</style>
      <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🎉</div>
      <div style={{background:choice.gradient,borderRadius:"20px",display:"inline-flex",alignItems:"center",gap:"0.6rem",padding:"0.7rem 1.4rem",marginBottom:"1.5rem"}}>
        <span style={{fontSize:"1.4rem"}}>{displayEmoji}</span>
        <span style={{color:"white",fontWeight:"800",fontSize:"1rem"}}>{displayTitle}</span>
      </div>
      <h2 style={{fontSize:"clamp(1.5rem,4vw,2rem)",fontWeight:"900",color:"#111827",marginBottom:"0.75rem"}}>We're on! 🙌</h2>
      <p style={{color:"#6b7280",fontSize:"1rem",lineHeight:"1.8",marginBottom:"2rem",maxWidth:"360px"}}>
        <strong style={{color:"#374151"}}>{formatDate(selDate)}</strong><br/>
        at <strong style={{color:"#374151"}}>{selTime}</strong><br/><br/>
        I'll sort the details. See you then.
      </p>
      <button onClick={reset} style={{background:"white",border:"2px solid #e5e7eb",color:"#374151",padding:"0.7rem 1.8rem",borderRadius:"2rem",cursor:"pointer",fontSize:"0.9rem",fontWeight:"600",fontFamily:FONT}}>← Start over</button>
    </div>
  );

  // ── STEP 2 ─────────────────────────────────────────────────────────────────
  if(step===2&&choice) return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,padding:"clamp(2rem,6vw,4rem) clamp(1rem,4vw,2rem)",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{KEYFRAMES}</style>
      <div style={{width:"100%",maxWidth:"500px",marginBottom:"1.5rem"}}>
        <button onClick={()=>setStep(selected==="daytrip"?1.5:1)} style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:"0.9rem",fontWeight:"600",fontFamily:FONT,padding:0,marginBottom:"1.2rem"}}>← Back</button>
        <div style={{display:"flex",gap:"0.5rem"}}>{[1,2,3].map(n=><div key={n} style={{flex:1,height:"4px",borderRadius:"2px",background:n<=3?PUR:"#e5e7eb"}}/>)}</div>
        <p style={{color:"#9ca3af",fontSize:"0.75rem",marginTop:"0.5rem"}}>Step {selected==="daytrip"?"3":"2"} of {selected==="daytrip"?"3":"2"} — Pick a date & time</p>
      </div>

      <div style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"16px",padding:"0.8rem 1.2rem",display:"flex",alignItems:"center",gap:"0.8rem",marginBottom:"1.5rem",width:"100%",maxWidth:"500px"}}>
        <div style={{background:choice.gradient,borderRadius:"10px",width:"38px",height:"38px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>{displayEmoji}</div>
        <div><div style={{fontSize:"0.75rem",color:"#9ca3af",fontWeight:"600"}}>YOUR CHOICE</div><div style={{fontSize:"0.95rem",fontWeight:"700",color:"#111827"}}>{displayTitle}</div></div>
        <div style={{marginLeft:"auto"}}><span style={{background:choice.tagBg,color:choice.tagColor,fontSize:"0.7rem",fontWeight:"700",padding:"0.2rem 0.6rem",borderRadius:"1rem"}}>{choice.tag}</span></div>
      </div>

      <div style={{background:"white",borderRadius:"24px",padding:"1.5rem",width:"100%",maxWidth:"500px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.2rem"}}>
          <button onClick={prevMonth} style={{background:"#f9fafb",border:"none",borderRadius:"10px",width:"36px",height:"36px",cursor:"pointer",fontSize:"1rem"}}>‹</button>
          <span style={{fontWeight:"800",fontSize:"1rem",color:"#111827"}}>{MONTHS[calMonth]} {calYear}</span>
          <button onClick={nextMonth} style={{background:"#f9fafb",border:"none",borderRadius:"10px",width:"36px",height:"36px",cursor:"pointer",fontSize:"1rem"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"8px"}}>
          {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:"0.72rem",fontWeight:"700",color:"#9ca3af",padding:"4px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px"}}>
          {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const day=i+1,disabled=isDisabled(day),sel=selDate===day,tod=isToday(day);
            return <button key={day} onClick={()=>!disabled&&(setSelDate(day),setSelTime(null))} title={disabled&&!isPast(day)?"Not available":""} style={{border:"none",borderRadius:"10px",padding:"8px 0",fontSize:"0.88rem",fontWeight:sel?"800":tod?"700":"500",cursor:disabled?"not-allowed":"pointer",background:sel?PUR:tod&&!disabled?"#f0f4ff":"transparent",color:sel?"white":disabled?"#e5e7eb":tod?"#4f46e5":"#374151",textDecoration:disabled&&!isPast(day)?"line-through":"none",transition:"all 0.15s",fontFamily:FONT}}>{day}</button>;
          })}
        </div>
      </div>

      <div style={{width:"100%",maxWidth:"500px",marginBottom:"1rem",display:"flex",gap:"1rem",flexWrap:"wrap"}}>
        {getHints(selected).map(h=><div key={h.label} style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
          <span style={{fontSize:"0.72rem",fontWeight:"700",color:h.muted?"#fca5a5":"#9ca3af"}}>{h.label}:</span>
          <span style={{fontSize:"0.72rem",color:h.muted?"#fca5a5":"#c4b5d0"}}>{h.note}</span>
        </div>)}
      </div>

      {selDate&&(
        <div style={{background:"white",borderRadius:"24px",padding:"1.5rem",width:"100%",maxWidth:"500px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:"1rem"}}>
          <p style={{fontWeight:"800",fontSize:"0.9rem",color:"#111827",marginBottom:"1rem"}}>Pick a time — {formatDate(selDate)}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>
            {timeSlots.map(t=>{ const sel=selTime===t; return <button key={t} onClick={()=>setSelTime(t)} style={{border:sel?"none":"2px solid #f3f4f6",borderRadius:"12px",padding:"0.6rem 0",fontSize:"0.85rem",fontWeight:"700",cursor:"pointer",background:sel?PUR:"white",color:sel?"white":"#374151",transition:"all 0.15s",fontFamily:FONT,boxShadow:sel?"0 4px 12px rgba(79,70,229,0.3)":"none"}}>{t}</button>; })}
          </div>
        </div>
      )}

      {selDate&&selTime&&(
        <div style={{background:"white",borderRadius:"24px",padding:"1.5rem",width:"100%",maxWidth:"500px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:"1rem"}}>
          <p style={{fontWeight:"800",fontSize:"0.9rem",color:"#111827",marginBottom:"0.75rem"}}>Anything to add? <span style={{fontWeight:"400",color:"#9ca3af"}}>(optional)</span></p>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="A preference, a note, a condition… anything goes." rows={3}
            style={{width:"100%",border:"2px solid #f3f4f6",borderRadius:"14px",padding:"0.85rem 1rem",fontSize:"0.9rem",fontFamily:FONT,color:"#374151",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:"1.6"}}
            onFocus={e=>e.target.style.border="2px solid #a5b4fc"} onBlur={e=>e.target.style.border="2px solid #f3f4f6"}/>
        </div>
      )}

      {selected==="horse" && (
        <div style={{width:"100%",maxWidth:"500px",marginBottom:"1rem",background:"#fffbeb",border:"2px solid #fde68a",borderRadius:"16px",padding:"1rem 1.2rem"}}>
          <p style={{color:"#92400e",fontSize:"0.82rem",lineHeight:"1.6",margin:"0 0 0.5rem 0"}}>
            ⏰ <strong>The time shown is when we meet.</strong> Horse riding starts an hour later.
          </p>
          <p style={{color:"#92400e",fontSize:"0.82rem",lineHeight:"1.6",margin:0}}>
            📋 These are approximate times — need to be confirmed. This app is not synced with the horse riding service's website.
          </p>
        </div>
      )}
      {sendError && (
        <p style={{color:"#ef4444",fontSize:"0.85rem",marginBottom:"0.75rem",textAlign:"center",maxWidth:"500px",width:"100%"}}>
          Something went wrong. Please try again.
        </p>
      )}
      <button onClick={()=>selDate&&selTime&&!sending&&handleConfirm()} style={{background:selDate&&selTime?PUR:"#f3f4f6",color:selDate&&selTime?"white":"#9ca3af",border:"none",padding:"0.95rem 2.8rem",borderRadius:"2rem",fontSize:"1rem",fontWeight:"700",cursor:selDate&&selTime&&!sending?"pointer":"not-allowed",transition:"all 0.2s ease",boxShadow:selDate&&selTime?"0 4px 20px rgba(79,70,229,0.35)":"none",fontFamily:FONT,width:"100%",maxWidth:"500px",opacity:sending?0.7:1}}>
        {sending?"Sending... ⏳":selDate&&selTime?`Confirm — ${formatDate(selDate)} at ${selTime} →`:"Pick a date and time"}
      </button>
    </div>
  );

  // ── STEP 1.5: Day Trip destination picker ──────────────────────────────────
  if(step===1.5) return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,padding:"clamp(2rem,6vw,4rem) clamp(1rem,4vw,2rem)",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{KEYFRAMES}</style>
      <div style={{width:"100%",maxWidth:"500px",marginBottom:"1.5rem"}}>
        <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:"0.9rem",fontWeight:"600",fontFamily:FONT,padding:0,marginBottom:"1.2rem"}}>← Back</button>
        <div style={{display:"flex",gap:"0.5rem"}}>{[1,2,3].map(n=><div key={n} style={{flex:1,height:"4px",borderRadius:"2px",background:n<=2?PUR:"#e5e7eb"}}/>)}</div>
        <p style={{color:"#9ca3af",fontSize:"0.75rem",marginTop:"0.5rem"}}>Step 2 of 3 — Choose a destination</p>
      </div>

      <div style={{textAlign:"center",maxWidth:"500px",marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:"clamp(1.5rem,4vw,2rem)",fontWeight:"900",color:"#111827",marginBottom:"0.5rem"}}>Where to? 🚂</h2>
        <p style={{color:"#6b7280",fontSize:"0.95rem"}}>Both are Sundays-only. I'll buy the tickets.</p>
      </div>

      <DayTripPicker dest={dayTripDest} setDest={setDayTripDest} />

      <button onClick={()=>dayTripDest&&setStep(2)} style={{background:dayTripDest?PUR:"#f3f4f6",color:dayTripDest?"white":"#9ca3af",border:"none",padding:"0.95rem 2.8rem",borderRadius:"2rem",fontSize:"1rem",fontWeight:"700",cursor:dayTripDest?"pointer":"not-allowed",transition:"all 0.2s ease",boxShadow:dayTripDest?"0 4px 20px rgba(79,70,229,0.35)":"none",fontFamily:FONT,width:"100%",maxWidth:"500px",marginTop:"0.5rem"}}>
        {dayTripDest?`Let's go to ${destInfo?.name} →`:"Pick a destination first"}
      </button>
    </div>
  );

  // ── STEP 1 ─────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,padding:"clamp(2rem,6vw,4rem) clamp(1rem,4vw,2rem)",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{KEYFRAMES}</style>
      <div style={{width:"100%",maxWidth:"500px",marginBottom:"1.5rem"}}>
        <div style={{display:"flex",gap:"0.5rem"}}>{[1,2,3].map(n=><div key={n} style={{flex:1,height:"4px",borderRadius:"2px",background:n<=1?PUR:"#e5e7eb"}}/>)}</div>
        <p style={{color:"#9ca3af",fontSize:"0.75rem",marginTop:"0.5rem"}}>Step 1 of {selected==="daytrip"?"3":"2"} — Choose an activity</p>
      </div>

      <div style={{textAlign:"center",maxWidth:"540px",marginBottom:"clamp(2rem,5vw,3rem)"}}>
        <h1 style={{fontSize:"clamp(2rem,6vw,3rem)",fontWeight:"900",color:"#111827",lineHeight:"1.15",marginBottom:"1rem",letterSpacing:"-0.02em"}}>What do you want<br/>to do? 🗺️</h1>
        <p style={{color:"#6b7280",fontSize:"clamp(0.95rem,2.5vw,1.05rem)",lineHeight:"1.7"}}>Pick one option. I'll handle everything else —<br/>no planning required from your side.</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"1rem",width:"100%",maxWidth:"500px",marginBottom:"2rem"}}>
        {options.map(opt=>{
          const isSel=selected===opt.id,isHov=hovered===opt.id;
          return <div key={opt.id} onClick={()=>setSelected(opt.id)} onMouseEnter={()=>setHovered(opt.id)} onMouseLeave={()=>setHovered(null)}
            style={{background:"white",border:isSel?"2px solid #4f46e5":`2px solid ${isHov?opt.border:"#f3f4f6"}`,borderRadius:"20px",padding:"1.4rem 1.5rem",cursor:"pointer",display:"flex",gap:"1rem",alignItems:"flex-start",transition:"all 0.18s ease",boxShadow:isSel?"0 8px 30px rgba(79,70,229,0.15)":isHov?"0 4px 20px rgba(0,0,0,0.08)":"0 1px 4px rgba(0,0,0,0.05)",transform:isHov||isSel?"translateY(-2px)":"none"}}>
            <div style={{background:isSel?opt.gradient:"#f9fafb",borderRadius:"14px",width:"52px",height:"52px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0,transition:"all 0.18s",boxShadow:isSel?"0 4px 12px rgba(0,0,0,0.15)":"none"}}>{opt.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.35rem",flexWrap:"wrap"}}>
                <span style={{fontSize:"1rem",fontWeight:"700",color:"#111827"}}>{opt.title}</span>
                <span style={{background:opt.tagBg,color:opt.tagColor,fontSize:"0.7rem",fontWeight:"700",padding:"0.2rem 0.6rem",borderRadius:"1rem"}}>{opt.tag}</span>
              </div>
              <p style={{color:"#6b7280",fontSize:"0.88rem",lineHeight:"1.6",margin:0}}>{opt.description}</p>
            </div>
            <div style={{width:"20px",height:"20px",borderRadius:"50%",border:isSel?"2px solid #4f46e5":"2px solid #d1d5db",background:isSel?"#4f46e5":"white",flexShrink:0,marginTop:"4px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
              {isSel&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"white"}}/>}
            </div>
          </div>;
        })}
        <JokeCard onMarco={handleMarco}/>
      </div>

      <button onClick={()=>{ if(!selected)return; if(selected==="daytrip") setStep(1.5); else setStep(2); }}
        style={{background:selected?PUR:"#f3f4f6",color:selected?"white":"#9ca3af",border:"none",padding:"0.95rem 2.8rem",borderRadius:"2rem",fontSize:"1rem",fontWeight:"700",cursor:selected?"pointer":"not-allowed",transition:"all 0.2s ease",boxShadow:selected?"0 4px 20px rgba(79,70,229,0.35)":"none",transform:selected?"scale(1.02)":"scale(1)",fontFamily:FONT}}>
        {selected?"Next →":"Pick an option first"}
      </button>
      <p style={{color:"#d1d5db",fontSize:"0.78rem",marginTop:"1.5rem",letterSpacing:"0.04em"}}>no wrong answers · no pressure · just somewhere to go</p>
    </div>
  );
}
