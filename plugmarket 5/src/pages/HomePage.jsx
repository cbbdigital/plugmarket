import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { EV_DB, getRecommendationText } from "../data/evdb";

/* ── Supabase REST client (no SDK needed) ── */
const SB_URL = "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";

const sb = {
  headers: (token) => ({
    "apikey": SB_KEY,
    "Authorization": `Bearer ${token || SB_KEY}`,
  }),
  async query(table, params = "", token) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token || SB_KEY}` } });
      if (!r.ok) { console.error("sb.query failed:", r.status, await r.text()); return []; }
      return await r.json();
    } catch (e) { console.error("sb.query error:", e); return []; }
  },
  async insert(table, data, token) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: "POST", headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token || SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" }, body: JSON.stringify(data),
      });
      if (!r.ok) return null;
      const res = await r.json();
      return res?.[0] || res;
    } catch { return null; }
  },
  async update(table, match, data, token) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, {
        method: "PATCH", headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token || SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" }, body: JSON.stringify(data),
      });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },
  async remove(table, match, token) {
    try {
      await fetch(`${SB_URL}/rest/v1/${table}?${match}`, {
        method: "DELETE", headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token || SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
      });
      return true;
    } catch { return false; }
  },
  // Auth
  async signUp(email, password, fullName) {
    try {
      const r = await fetch(`${SB_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "apikey": SB_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, data: { full_name: fullName } }),
      });
      return await r.json();
    } catch { return { error: { message: "Network error" } }; }
  },
  async signIn(email, password) {
    try {
      const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SB_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await r.json();
    } catch { return { error: { message: "Network error" } }; }
  },
  async getUser(token) {
    try {
      const r = await fetch(`${SB_URL}/auth/v1/user`, {
        headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token}` },
      });
      return await r.json();
    } catch { return null; }
  },
  async signOut(token) {
    try {
      await fetch(`${SB_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token}` },
      });
    } catch {}
  },
  photoUrl(path) {
    return `${SB_URL}/storage/v1/object/public/listing-photos/${path}`;
  },
};

/* ── Auth context hook ── */
function useAuth() {
  const [session, setSession] = useState(() => {
    try {
      const s = JSON.parse(window.localStorage?.getItem("pm_session") || "null");
      return s;
    } catch { return null; }
  });
  const save = (s) => {
    setSession(s);
    try { if (s) window.localStorage?.setItem("pm_session", JSON.stringify(s)); else window.localStorage?.removeItem("pm_session"); } catch {}
  };
  const token = session?.access_token || null;
  const user = session?.user || null;
  return { session, token, user, save };
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=480&h=300&fit=crop";

/* ── Listing data hook — loads from Supabase, falls back to mock ── */
function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch active listings with their photos
        const rows = await sb.query("listings", "status=eq.active&order=created_at.desc");
        if (cancelled) return;
        if (rows.length > 0) {
          // Fetch all photos for these listings
          const ids = rows.map(r => r.id);
          const photos = await sb.query("listing_photos", `listing_id=in.(${ids.join(",")})&order=position.asc`);
          const photoMap = {};
          photos.forEach(p => {
            if (!photoMap[p.listing_id]) photoMap[p.listing_id] = [];
            photoMap[p.listing_id].push(p.url);
          });
          // Map DB rows to the shape the UI expects
          const mapped = rows.map(r => ({
            id: r.id,
            mk: r.make,
            md: r.model,
            vr: r.variant || "",
            yr: r.year,
            km: r.mileage_km,
            pr: r.price_eur,
            bat: r.battery_capacity_kwh || 0,
            rng: r.range_real_km || r.range_real_km || 0,
            dc: r.dc_charge_max_kw || 0,
            dr: r.drivetrain || "",
            cn: r.condition === "certified_pre_owned" ? "Certified" : r.condition === "new" ? "New" : "Used",
            co: r.country || "",
            ct: r.city || "",
            hp: r.state_of_health_pct || 100,
            ft: r.is_boosted || false,
            dy: Math.max(0, Math.round((Date.now() - new Date(r.created_at).getTime()) / 86400000)),
            imgs: photoMap[r.id] || [FALLBACK_IMG],
            _raw: r,
          }));
          setListings(mapped);
        }
      } catch (e) { console.error("Failed to load listings:", e); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { listings, loading };
}
/* ── Icons ── */
const I=({d,size=16,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const Bolt=p=><I {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
const Map2=p=><I {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}/>;
const Bat=p=><I {...p} d={<><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></>}/>;
const Srch=p=><I {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const CD=p=><I {...p} d={<polyline points="6 9 12 15 18 9"/>}/>;
const CR=p=><I {...p} d={<polyline points="9 18 15 12 9 6"/>}/>;
const Car=p=><I {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const Hrt=({filled,...p})=><I {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={filled?(p.color||"currentColor"):"none"}/>}/>;
const Shld=p=><I {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}/>;
const Trk=p=><I {...p} d={<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}/>;
const Calc=p=><I {...p} d={<><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></>}/>;
const Home=p=><I {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>;
const Plus=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>}/>;
const Usr=p=><I {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const Bck=p=><I {...p} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/>;
const Flt=p=><I {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>}/>;
const Lst=p=><I {...p} d={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></>}/>;
const Grd=p=><I {...p} d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>}/>;
const Info=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>}/>;
const Sun=p=><I {...p} d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></>}/>;
const Moon=p=><I {...p} d={<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>}/>;
const Lock=p=><I {...p} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>}/>;
const Mail=p=><I {...p} d={<><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></>}/>;
const MsgIc=p=><I {...p} d={<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>}/>;
const Eye=p=><I {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>;
const EyeOff=p=><I {...p} d={<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>}/>;
const Chk=p=><I {...p} d={<polyline points="20 6 9 17 4 12"/>}/>;

/* ── Brand (local, supplements shared BC/GR) ── */
const BC="#FF7500";
const BG="linear-gradient(135deg,#FF7500,#FF9533)";
const BG2="linear-gradient(135deg,#4D2300,#7A3900)";
const BL="#FFF3EB";
const BL2="#FFE0C7";
const BD="#4D2300";

/* ── Data ── */
const MK={Tesla:["Model 3","Model Y","Model S","Model X"],BMW:["iX3","iX1","i4","i5","i7","iX"],Volkswagen:["ID.3","ID.4","ID.5","ID.7"],Mercedes:["EQA","EQB","EQE","EQS"],Audi:["Q4 e-tron","Q6 e-tron","e-tron GT"],Hyundai:["Ioniq 5","Ioniq 6"],Kia:["EV6","EV9"],BYD:["Dolphin","Seal","Seal U"],Porsche:["Taycan"],Renault:["Megane E-Tech","Renault 5"],Skoda:["Enyaq","Elroq"],Volvo:["EX30","EX40","EX90"],MG:["MG4","ZS EV"],Cupra:["Born","Tavascan"],Ford:["Mustang Mach-E"],NIO:["ET5","ET7"],Fiat:["500e"]};
const CO=[{c:"DE",n:"Germany",f:"🇩🇪"},{c:"FR",n:"France",f:"🇫🇷"},{c:"NL",n:"Netherlands",f:"🇳🇱"},{c:"BE",n:"Belgium",f:"🇧🇪"},{c:"AT",n:"Austria",f:"🇦🇹"},{c:"IT",n:"Italy",f:"🇮🇹"},{c:"ES",n:"Spain",f:"🇪🇸"},{c:"PL",n:"Poland",f:"🇵🇱"},{c:"RO",n:"Romania",f:"🇷🇴"},{c:"SE",n:"Sweden",f:"🇸🇪"},{c:"NO",n:"Norway",f:"🇳🇴"},{c:"CZ",n:"Czech Rep.",f:"🇨🇿"}];


/* ── Helpers ── */
const gf=c=>CO.find(x=>x.c===c)?.f||"";
const gn=c=>CO.find(x=>x.c===c)?.n||c;
const cs=t=>({background:t.card,borderRadius:14,border:`1px solid ${t.bd}`,boxShadow:`0 2px 8px ${t.sh}`});
const tg=t=>({fontSize:10,padding:"2px 7px",borderRadius:5,background:t.tg,color:t.tt});
const is=t=>({width:"100%",height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 14px",fontSize:13,boxSizing:"border-box"});
const ab=(a,t)=>({border:a?`2px solid ${BC}`:`1px solid ${t.bd}`,background:a?(t.bg==="#131319"?"#2A2530":BL):t.inp,color:a?BC:t.tx,cursor:"pointer",borderRadius:10});
/* ── Sel ── */
function Sel({v,onChange,opts,ph,t}){
  return(
    <div style={{position:"relative"}}>
      <select value={v} onChange={e=>onChange(e.target.value)} style={{width:"100%",height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 30px 0 14px",fontSize:13,cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
        <option value="">{ph||"Any"}</option>
        {opts.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><CD size={14} color={t.tx3}/></div>
    </div>
  );
}
/* ── Image Slider (touch/swipe + arrows + dots) ── */
function ImgSlider({imgs,height,children,borderRadius=0}){
  const[idx,setIdx]=useState(0);
  const ref=useRef(null);
  const touch=useRef({x:0,t:0});
  const n=imgs?.length||0;
  const go=useCallback(d=>{setIdx(p=>{const nx=p+d;return nx<0?n-1:nx>=n?0:nx})},[n]);
  const onTS=useCallback(e=>{const tc=e.touches[0];touch.current={x:tc.clientX,t:Date.now()}},[]);
  const onTE=useCallback(e=>{const dx=e.changedTouches[0].clientX-touch.current.x;const dt=Date.now()-touch.current.t;if(Math.abs(dx)>30&&dt<400){go(dx<0?1:-1)}},[go]);
  if(!imgs||n===0) return <div style={{height,background:"#16213e",borderRadius,display:"flex",alignItems:"center",justifyContent:"center"}}><Car size={36} color="#4b5563"/></div>;
  return(
    <div style={{height,position:"relative",overflow:"hidden",borderRadius,background:"#16213e",touchAction:"pan-y"}} ref={ref} onTouchStart={onTS} onTouchEnd={onTE}>
      <div style={{display:"flex",width:`${n*100}%`,height:"100%",transform:`translateX(-${idx*(100/n)}%)`,transition:"transform 0.3s ease"}}>
        {imgs.map((src,i)=><img key={i} src={src} alt="" style={{width:`${100/n}%`,height:"100%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>)}
      </div>
      {/* Arrows */}
      {n>1&&<>
        <button onClick={e=>{e.stopPropagation();go(-1)}} style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:0.7,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.7}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={e=>{e.stopPropagation();go(1)}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:0.7,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.7}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </>}
      {/* Dots */}
      {n>1&&<div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
        {imgs.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i)}} style={{width:i===idx?14:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,0.5)",cursor:"pointer",transition:"all 0.2s"}}/>)}
      </div>}
      {/* Counter badge */}
      {n>1&&<div style={{position:"absolute",top:8,right:44,background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:5}}>{idx+1}/{n}</div>}
      {/* Overlay children (badges, fav button etc.) */}
      {children}
    </div>
  );
}
/* ── Promoted Card ── */
function PCard({c,favIds,toggleFav,t,onPress}){
  const fav=favIds.includes(c.id);
  const fl=gf(c.co);
  const bc={Sponsored:BG,Premium:"linear-gradient(135deg,#f59e0b,#d97706)","Top Deal":"linear-gradient(135deg,#10b981,#059669)"}[c.bg]||BG;
  return(
    <div onClick={()=>onPress&&onPress(c.id)} style={{minWidth:270,flex:"0 0 270px",...cs(t),borderRadius:16,overflow:"hidden",cursor:"pointer"}}>
      <ImgSlider imgs={c.imgs} height={160}>
        <div style={{position:"absolute",top:8,left:8,background:bc,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,textTransform:"uppercase"}}>{c.bg}</div>
        <button onClick={e=>{e.stopPropagation();toggleFav(c.id)}} style={{position:"absolute",top:8,right:8,width:30,height:30,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.35)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Hrt size={14} filled={fav} color={fav?"#f43f5e":"#fff"}/></button>
        {c.km<2000&&<div style={{position:"absolute",bottom:14,left:8,background:"rgba(16,185,129,0.9)",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:5}}>NEW</div>}
      </ImgSlider>
      <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:6}}>
        <div style={{fontSize:14,fontWeight:600,color:t.tx}}>{c.mk} {c.md}</div>
        <div style={{fontSize:11,color:t.tx2}}>{c.vr} · {c.yr}</div>
        <div style={{fontSize:19,fontWeight:700,color:t.tx}}>€{c.pr.toLocaleString()}</div>
        <div style={{display:"flex",gap:5}}>{[`${c.rng} km`,`${c.dc} kW`].map((v,i)=><span key={i} style={tg(t)}>{v}</span>)}</div>
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:`1px solid ${t.bd}`,fontSize:11,color:t.tx3}}>
          <span style={{display:"flex",alignItems:"center",gap:3}}><Map2 size={10} color={t.tx3}/>{c.ct} {fl}</span>
          <span>{c.km.toLocaleString()} km</span>
        </div>
      </div>
    </div>
  );
}
/* ── Recent Card ── */
function RCard({c,t,onPress}){
  const fl=gf(c.co);
  return(
    <div onClick={()=>onPress&&onPress(c.id)} style={{minWidth:210,flex:"0 0 210px",...cs(t),borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
      <ImgSlider imgs={c.imgs} height={120}/>
      <div style={{padding:"10px 12px"}}>
        <div style={{fontSize:13,fontWeight:600,color:t.tx}}>{c.mk} {c.md}</div>
        <div style={{fontSize:11,color:t.tx2,marginTop:1}}>{c.vr} · {c.yr}</div>
        <div style={{fontSize:16,fontWeight:700,color:t.tx,marginTop:5}}>€{c.pr.toLocaleString()}</div>
        <div style={{fontSize:11,color:t.tx3,marginTop:4,display:"flex",alignItems:"center",gap:3}}><Map2 size={10} color={t.tx3}/>{c.ct} {fl}</div>
      </div>
    </div>
  );
}
/* ── EV Finder ── */
function EVFinder({goSearch,navigate,t,favIds,toggleFav}){
  const[step,setStep]=useState(1);const[kmMode,setKmMode]=useState("yearly");const[kmVal,setKmVal]=useState("");
  const[longTrips,setLongTrips]=useState("never");const[budgetVal,setBudgetVal]=useState(100000);
  const[passengers,setPassengers]=useState("1-2");const[gasPrice,setGasPrice]=useState(1.65);
  const[elPrice,setElPrice]=useState(0.25);const[consumption,setConsumption]=useState(7.5);
  const yk=kmMode==="weekly"?Number(kmVal||0)*52:kmMode==="monthly"?Number(kmVal||0)*12:Number(kmVal||0);
  const bm=budgetVal>=100000?999999:budgetVal;const bl=budgetVal>=100000?"No limit":`Up to €${budgetVal.toLocaleString()}`;

  const gr=()=>EV_DB.map(r=>{let s=0;const wk=yk/52;const rng=r.range_summer||r.wltp||300;const dc=r.dc_peak||0;

    // ── Use-case matching based on driving pattern ──
    const isCity = yk<10000 && (longTrips==="never"||longTrips==="rarely");
    const isCommute = yk>=10000 && yk<20000 && (longTrips==="never"||longTrips==="rarely");
    const isMedium = (longTrips==="sometimes") || (yk>=15000 && yk<35000 && longTrips!=="often");
    const isLong = longTrips==="often" || yk>=35000;

    // Use the rich scores from EV_DB
    if(isCity) s += (r.city_score||5) * 4;
    else if(isCommute) s += (r.city_score||5) * 2 + (r.trip_score||5) * 1;
    else if(isMedium) s += (r.trip_score||5) * 3 + (r.city_score||5) * 1;
    else if(isLong) s += (r.trip_score||5) * 5;

    // Value score always matters
    s += (r.value_score||5) * 2;

    // Penalize mismatches
    if(isCity && r.use==="flagship") s-=30;
    if(isCity && r.use==="cruiser") s-=20;
    if(isLong && r.use==="city") s-=40;
    if(isLong && r.use==="commute") s-=25;

    // ── Charging power rules ──
    if(longTrips==="sometimes"||longTrips==="often"){
      if(dc>=150) s+=10; else s-=15;
    }
    if(longTrips==="often"){
      if(dc>=270) s+=20; else if(dc>=200) s+=10; else if(dc>=150) s+=5; else s-=20;
    }

    // ── Range adequacy ──
    if(rng >= wk*1.3) s+=15; else if(rng >= wk) s+=5; else s-=10;
    if(longTrips==="often" && rng>=500) s+=10;
    if(longTrips==="sometimes" && rng>=400) s+=8;

    // ── Budget ──
    if(r.pn>bm) s-=50;
    else if(r.pn/bm<0.5) s+=10;
    else if(r.pn/bm<0.8) s+=6;

    // ── Passengers / seating ──
    if(passengers==="5+" && r.seats>=7) s+=20;
    else if(passengers==="5+" && r.seats>=5) s+=8;
    else if(passengers==="5+" && r.seats<5) s-=15;
    if(passengers==="3-4" && r.seats>=5) s+=5;

    return{...r,score:s,_rng:rng,_dc:dc}}).sort((a,b)=>b.score-a.score).slice(0,3);

  const res=step===3?gr():[];const sav=yk>0?((yk/100)*consumption*gasPrice)-((yk/100)*16*elPrice):0;const fmt=v=>Math.round(v).toLocaleString();

  return(
    <div style={{padding:"16px 0 20px"}}>
      <div style={{...cs(t),borderRadius:18,overflow:"hidden"}}>
        <div style={{background:BG2,padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}><Bolt size={16} color={BL2}/></div>
          <div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Find your perfect EV</div><div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>Tell us how you drive</div></div>
        </div>
        <div style={{padding:"16px 20px"}}>
          {/* Steps */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[{n:1,l:"Driving"},{n:2,l:"Preferences"},{n:3,l:"Results"}].map(s=>(
              <div key={s.n} style={{flex:1,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:step>=s.n?BC:t.sec,color:step>=s.n?"#fff":t.tx3,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{step>s.n?"✓":s.n}</div>
                <span style={{fontSize:11,fontWeight:step===s.n?600:400,color:step===s.n?BC:t.tx2}}>{s.l}</span>
                {s.n<3&&<div style={{flex:1,height:2,borderRadius:1,background:step>s.n?BC:t.sec}}/>}
              </div>
            ))}
          </div>

          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:14,fontWeight:600,color:t.tx}}>How much do you drive?</div>
              <div style={{display:"flex",gap:6}}>
                {["weekly","monthly","yearly"].map(m=>(
                  <button key={m} onClick={()=>setKmMode(m)} style={{flex:1,height:34,borderRadius:8,...ab(kmMode===m,t),fontSize:12,fontWeight:kmMode===m?600:400}}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>
                ))}
              </div>
              <div style={{position:"relative"}}>
                <input type="number" value={kmVal} onChange={e=>setKmVal(e.target.value)} placeholder="e.g. 25000" style={{...is(t),height:46,fontSize:15,paddingRight:50}}/>
                <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:13,color:t.tx3}}>km</span>
              </div>
              {yk>0&&<div style={{background:t.sec,borderRadius:8,padding:"8px 12px",fontSize:12,color:t.tx2}}>≈ <strong style={{color:t.tx}}>{yk.toLocaleString()} km/year</strong>{yk<10000?" — light":yk<20000?" — average":yk<35000?" — frequent":" — heavy"}</div>}
              <div style={{fontSize:14,fontWeight:600,color:t.tx}}>Long trips (500+ km)?</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{v:"never",l:"Never",d:"City only"},{v:"rarely",l:"Rarely",d:"1-2x/year"},{v:"sometimes",l:"Sometimes",d:"Few months"},{v:"often",l:"Often",d:"Monthly+"}].map(x=>(
                  <button key={x.v} onClick={()=>setLongTrips(x.v)} style={{...ab(longTrips===x.v,t),padding:"10px 12px",textAlign:"left",fontSize:12}}>
                    <div style={{fontWeight:longTrips===x.v?600:500,color:longTrips===x.v?BC:t.tx}}>{x.l}</div>
                    <div style={{fontSize:10,color:t.tx3,marginTop:1}}>{x.d}</div>
                  </button>
                ))}
              </div>
              <div style={{fontSize:14,fontWeight:600,color:t.tx}}>Max budget?</div>
              <div>
                <input type="range" min={20000} max={100000} step={5000} value={budgetVal} onChange={e=>setBudgetVal(+e.target.value)} style={{width:"100%",accentColor:BC}}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                  <span style={{fontSize:10,color:t.tx3}}>€20k</span>
                  <span style={{fontSize:14,fontWeight:700,color:BC}}>{bl}</span>
                  <span style={{fontSize:10,color:t.tx3}}>No limit</span>
                </div>
              </div>
              <button onClick={()=>{if(kmVal)setStep(2)}} style={{width:"100%",height:42,borderRadius:10,border:"none",background:kmVal?BG:"rgba(128,128,128,0.12)",color:kmVal?"#fff":t.tx3,fontSize:14,fontWeight:600,cursor:kmVal?"pointer":"default"}}>Continue</button>
            </div>
          )}

          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:14,fontWeight:600,color:t.tx}}>Passengers?</div>
              <div style={{display:"flex",gap:8}}>
                {[{v:"1-2",l:"1–2"},{v:"3-4",l:"3–4"},{v:"5+",l:"5+"}].map(p=>(
                  <button key={p.v} onClick={()=>setPassengers(p.v)} style={{flex:1,padding:"12px 8px",borderRadius:10,...ab(passengers===p.v,t),textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:passengers===p.v?600:500,color:passengers===p.v?BC:t.tx}}>{p.l}</div>
                  </button>
                ))}
              </div>
              <div style={{fontSize:14,fontWeight:600,color:t.tx}}>Fuel costs</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:"Fuel",v:gasPrice,s:setGasPrice,u:"€/L"},{l:"L/100km",v:consumption,s:setConsumption,u:"L"},{l:"Electricity",v:elPrice,s:setElPrice,u:"€/kWh"}].map((f,i)=>(
                  <div key={i}>
                    <div style={{fontSize:11,fontWeight:600,color:t.tx2,marginBottom:3}}>{f.l}</div>
                    <div style={{position:"relative"}}>
                      <input type="number" step={0.01} value={f.v} onChange={e=>f.s(+e.target.value)} style={{...is(t),height:34,paddingRight:38,fontSize:12}}/>
                      <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>{f.u}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setStep(1)} style={{flex:1,height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,fontSize:13,cursor:"pointer"}}>Back</button>
                <button onClick={()=>setStep(3)} style={{flex:2,height:42,borderRadius:10,border:"none",background:BG,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>Show matches</button>
              </div>
            </div>
          )}

          {step===3&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[`${yk.toLocaleString()} km/yr`,longTrips+" trips",passengers+" pax",bl].map((x,i)=><span key={i} style={tg(t)}>{x}</span>)}
                <button onClick={()=>setStep(1)} style={{fontSize:11,color:BC,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Change</button>
              </div>
              {sav>0&&(
                <div style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                  <div><div style={{fontSize:11,fontWeight:600,color:"#065f46"}}>Annual savings</div><div style={{fontSize:20,fontWeight:800,color:"#059669"}}>€{fmt(sav)}/yr</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#065f46"}}>5-year</div><div style={{fontSize:14,fontWeight:700,color:"#059669"}}>€{fmt(sav*5)}</div></div>
                </div>
              )}
              <div style={{fontSize:15,fontWeight:700,color:t.tx}}>Top matches</div>
              <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4}}>
                {res.map((r,i)=>(
                  <div key={i} style={{minWidth:250,flex:"0 0 250px",...cs(t),borderRadius:14,overflow:"hidden",border:i===0?`2px solid ${BC}`:`1px solid ${t.bd}`,position:"relative"}}>
                    {i===0&&<div style={{position:"absolute",top:8,left:8,background:BG,color:"#fff",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5,zIndex:1}}>BEST MATCH</div>}
                    <div style={{position:"relative",height:140,background:"#16213e",overflow:"hidden"}}>
                      <img src={r.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>
                      <button onClick={e=>{e.stopPropagation();if(toggleFav)toggleFav(`evdb_${r.make}_${r.model}`)}} style={{position:"absolute",top:8,right:8,width:30,height:30,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.35)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Hrt size={14} filled={favIds?.includes(`evdb_${r.make}_${r.model}`)} color={favIds?.includes(`evdb_${r.make}_${r.model}`)?"#f43f5e":"#fff"}/></button>
                    </div>
                    <div style={{padding:"12px 14px"}}>
                      <div style={{fontSize:14,fontWeight:600,color:t.tx}}>{r.make} {r.model}</div>
                      <div style={{fontSize:11,color:t.tx2,marginTop:1}}>{r.price}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>{r.tags.map((x,ti)=><span key={ti} style={tg(t)}>{x}</span>)}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginTop:10}}>
                        {[{l:"Range",v:`${r._rng}km`},{l:"Battery",v:`${r.battery}kWh`},{l:"DC",v:`${r._dc}kW`}].map((s,si)=>(
                          <div key={si} style={{textAlign:"center",background:t.sec,borderRadius:6,padding:"5px 2px"}}>
                            <div style={{fontSize:9,color:t.tx3}}>{s.l}</div>
                            <div style={{fontSize:12,fontWeight:700,color:t.tx}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                      {r.charge_10_80_min&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:4}}>
                        <div style={{textAlign:"center",background:t.sec,borderRadius:6,padding:"5px 2px"}}><div style={{fontSize:9,color:t.tx3}}>10→80%</div><div style={{fontSize:12,fontWeight:700,color:t.tx}}>{r.charge_10_80_min}min</div></div>
                        <div style={{textAlign:"center",background:t.sec,borderRadius:6,padding:"5px 2px"}}><div style={{fontSize:9,color:t.tx3}}>Boot</div><div style={{fontSize:12,fontWeight:700,color:t.tx}}>{r.cargo_liters}L</div></div>
                      </div>}
                      <div style={{marginTop:8,fontSize:10,color:t.tx2,lineHeight:1.5,background:t.sec,borderRadius:6,padding:"6px 8px"}}>
                        {getRecommendationText(r, yk, longTrips)}
                      </div>
                      <button onClick={()=>{if(navigate)navigate(`/search?make=${encodeURIComponent(r.make)}&model=${encodeURIComponent(r.model)}`);else goSearch()}} style={{width:"100%",height:34,borderRadius:8,border:"none",background:i===0?BG:t.sec,color:i===0?"#fff":BC,fontSize:11,fontWeight:600,cursor:"pointer",marginTop:8}}>{i===0?"View listings":"See available"}</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setStep(1);setKmVal("")}} style={{alignSelf:"center",fontSize:11,color:BC,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Start over</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Homepage ── */
export default function HomePage() {
  const { t, dark } = useOutletContext();
  const navigate = useNavigate();
  const [favIds, setFavIds] = useState(()=>{try{return JSON.parse(localStorage.getItem("pm_favs")||"[]")}catch{return[]}});
  useEffect(()=>{try{localStorage.setItem("pm_favs",JSON.stringify(favIds))}catch{}},[favIds]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [co, setCo] = useState("");
  const [pMin, setPMin] = useState("");
  const [pMax, setPMax] = useState("");
  const [rngMin, setRngMin] = useState("");
  const [yMin, setYMin] = useState("");
  const [smartQuery, setSmartQuery] = useState("");

  // Smart search — parse natural language into filters
  const doSmartSearch = () => {
    const q = smartQuery.trim().toLowerCase();
    if (!q) return;
    const p = new URLSearchParams();
    // Parse make
    const makes = Object.keys(MK);
    const foundMake = makes.find(m => q.includes(m.toLowerCase()));
    if (foundMake) p.set("make", foundMake);
    // Parse model
    if (foundMake) {
      const models = MK[foundMake] || [];
      const foundModel = models.find(m => q.includes(m.toLowerCase()));
      if (foundModel) p.set("model", foundModel);
    }
    // Parse year (4-digit number between 2015-2026)
    const yearMatch = q.match(/\b(20[1-2][0-9])\b/);
    if (yearMatch) p.set("yMin", yearMatch[1]);
    // Parse "under X" or "below X" or "max X" for price
    const underMatch = q.match(/(?:under|below|max|up to|sub)\s*€?\s*(\d[\d,. ]*)/i);
    if (underMatch) { const price = underMatch[1].replace(/[,. ]/g, ""); if (+price > 100) p.set("pMax", price); }
    // Parse "from X" or "min X" or "above X" for price
    const fromMatch = q.match(/(?:from|min|above|over)\s*€?\s*(\d[\d,. ]*)/i);
    if (fromMatch) { const price = fromMatch[1].replace(/[,. ]/g, ""); if (+price > 100) p.set("pMin", price); }
    // Parse drivetrain
    if (q.includes("rwd")) p.set("dr", "RWD");
    else if (q.includes("awd") || q.includes("all wheel") || q.includes("4wd") || q.includes("quattro")) p.set("dr", "AWD");
    else if (q.includes("fwd") || q.includes("front wheel")) p.set("dr", "FWD");
    // Parse country
    const countryMap = {"germany":"DE","france":"FR","netherlands":"NL","belgium":"BE","austria":"AT","italy":"IT","spain":"ES","poland":"PL","romania":"RO","sweden":"SE","norway":"NO","czech":"CZ"};
    for (const [name, code] of Object.entries(countryMap)) { if (q.includes(name)) { p.set("co", code); break; } }
    // Also carry over dropdown filters if set
    if (!p.get("make") && make) p.set("make", make);
    if (!p.get("model") && model) p.set("model", model);
    if (!p.get("co") && co) p.set("co", co);
    navigate(`/search?${p.toString()}`);
  };
  const auth = useAuth();
  const { listings: dbListings, loading: dbLoading } = useListings();
  const allListings = dbListings;
  const featuredListings = dbListings.filter(l=>l.ft).slice(0,4);
  const recentListings = dbListings.slice(0,5);
  const filteredCount = allListings.filter(l=>{
    if(make&&l.mk!==make)return false;
    if(model&&l.md!==model)return false;
    if(co&&l.co!==co)return false;
    if(yMin&&l.yr<+yMin)return false;
    if(pMin&&l.pr<+pMin)return false;
    if(pMax&&l.pr>+pMax)return false;
    if(rngMin&&l.rng<+rngMin)return false;
    return true;
  }).length;

  useEffect(() => {
    if (!auth.token) return;
    (async () => {
      const favs = await sb.query("favourites", `user_id=eq.${auth.user?.id}&select=listing_id`, auth.token);
      setFavIds(favs.length > 0 ? favs.map(f => f.listing_id) : []);
    })();
  }, [auth.token, auth.user?.id]);

  const toggleFav = async (id) => {
    const isFav = favIds.includes(id);
    setFavIds(p => isFav ? p.filter(x => x !== id) : [...p, id]);
    if (auth.token && auth.user) {
      if (isFav) await sb.remove("favourites", `user_id=eq.${auth.user.id}&listing_id=eq.${id}`, auth.token);
      else await sb.insert("favourites", { user_id: auth.user.id, listing_id: id }, auth.token);
    }
  };

  const models = make ? MK[make] || [] : [];

  return (
    <>
      <div style={{padding:"20px 0 16px"}}>
        <div style={{maxWidth:520}}>
          <h1 style={{fontSize:26,fontWeight:800,lineHeight:1.2,margin:"0 0 4px",color:t.tx}}>Find your perfect<br/><span style={{background:"linear-gradient(135deg,#FF7500,#FF9533)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>electric vehicle</span></h1>
          <p style={{fontSize:13,color:t.tx2,margin:"0 0 16px"}}>{new Set(allListings.map(l=>l.co)).size} countries. {allListings.length} EVs listed.</p>
          <div style={{...cs(t),borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:10}}>
            {/* ── Smart search bar ── */}
            <div style={{position:"relative"}}>
              <input
                type="text"
                value={smartQuery}
                onChange={e=>setSmartQuery(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")doSmartSearch()}}
                placeholder='"2022 Porsche Taycan RWD" or "Tesla under 40000"'
                style={{...is(t),height:46,paddingLeft:38,paddingRight:14,fontSize:13}}
              />
              <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Srch size={16} color={t.tx3}/></div>
            </div>
            {smartQuery.trim()&&<button onClick={doSmartSearch} style={{width:"100%",height:44,borderRadius:12,border:"none",background:BG,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Srch size={17} color="#fff"/>Search
            </button>}
            {/* ── "or" divider ── */}
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,height:1,background:t.bd}}/>
              <span style={{fontSize:11,fontWeight:500,color:t.tx3}}>or filter by</span>
              <div style={{flex:1,height:1,background:t.bd}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Sel v={make} onChange={v=>{setMake(v);setModel("")}} opts={Object.keys(MK).sort()} ph="Make" t={t}/>
              <Sel v={model} onChange={setModel} opts={models} ph="Any" t={t}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Sel v={co} onChange={setCo} opts={CO.map(c=>({v:c.c,l:`${c.f} ${c.n}`}))} ph="Country" t={t}/>
              <Sel v={yMin} onChange={setYMin} opts={["2025","2024","2023","2022","2021","2020","2019","2018"]} ph="Year from" t={t}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{ph:"Price from",vl:pMin,s:setPMin},{ph:"Price to",vl:pMax,s:setPMax}].map((f,i)=>(
                <div key={i} style={{position:"relative"}}>
                  <input type="number" placeholder={f.ph} value={f.vl} onChange={e=>f.s(e.target.value)} style={{...is(t),paddingRight:28}}/>
                  <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:t.tx3}}>€</span>
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${t.bd}`,paddingTop:10}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:8}}><Bolt size={12} color={BC}/><span style={{fontSize:11,fontWeight:600,color:BC}}>EV filters</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{position:"relative"}}><input type="number" placeholder="Min range" value={rngMin} onChange={e=>setRngMin(e.target.value)} style={{...is(t),paddingRight:28}}/><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:t.tx3}}>km</span></div>
                <div style={{position:"relative"}}><input type="number" placeholder="Min battery" defaultValue="" style={{...is(t),paddingRight:34}}/><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:t.tx3}}>kWh</span></div>
              </div>
            </div>
            <button onClick={()=>{const p=new URLSearchParams();if(make)p.set("make",make);if(model)p.set("model",model);if(co)p.set("co",co);if(yMin)p.set("yMin",yMin);if(pMin)p.set("pMin",pMin);if(pMax)p.set("pMax",pMax);if(rngMin)p.set("rMin",rngMin);navigate(`/search?${p.toString()}`)}} style={{width:"100%",height:44,borderRadius:12,border:"none",background:BG,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:2}}>
              <Srch size={17} color="#fff"/>Search {filteredCount} EVs
            </button>
          </div>
        </div>
      </div>
      <div style={{padding:"4px 0 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontSize:17,fontWeight:700,color:t.tx}}>Featured vehicles</div><div style={{fontSize:12,color:t.tx3}}>Premium listings</div></div>
          <button onClick={()=>navigate("/search")} style={{display:"flex",alignItems:"center",gap:3,background:"none",border:"none",color:BC,fontSize:12,fontWeight:600,cursor:"pointer"}}>View all<CR size={13} color={BC}/></button>
        </div>
        <div style={{display:"flex",gap:14,overflowX:"auto",paddingBottom:6,maskImage:"linear-gradient(to right,black 95%,transparent 100%)",WebkitMaskImage:"linear-gradient(to right,black 95%,transparent 100%)"}}>
          {dbLoading?<div style={{padding:"30px 0",width:"100%",textAlign:"center",fontSize:12,color:t.tx3}}>Loading...</div>
          :featuredListings.length===0?<div style={{padding:"30px 0",width:"100%",textAlign:"center",fontSize:13,color:t.tx3}}>No featured listings yet. Be the first to list your EV!</div>
          :featuredListings.map(c=><PCard key={c.id} c={c} favIds={favIds} toggleFav={toggleFav} t={t} onPress={(id)=>navigate(`/listing/${id}`)}/>)}
        </div>
      </div>
      <div style={{padding:"0 0 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontSize:17,fontWeight:700,color:t.tx}}>Recently added</div><div style={{fontSize:12,color:t.tx3}}>Fresh listings</div></div>
          <button onClick={()=>navigate("/search")} style={{display:"flex",alignItems:"center",gap:3,background:"none",border:"none",color:BC,fontSize:12,fontWeight:600,cursor:"pointer"}}>View all<CR size={13} color={BC}/></button>
        </div>
        <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:6,maskImage:"linear-gradient(to right,black 95%,transparent 100%)",WebkitMaskImage:"linear-gradient(to right,black 95%,transparent 100%)"}}>
          {dbLoading?<div style={{padding:"30px 0",width:"100%",textAlign:"center",fontSize:12,color:t.tx3}}>Loading...</div>
          :recentListings.length===0?<div style={{padding:"30px 0",width:"100%",textAlign:"center",fontSize:13,color:t.tx3}}>No listings yet</div>
          :recentListings.map(c=><RCard key={c.id} c={c} t={t} onPress={(id)=>navigate(`/listing/${id}`)}/>)}
        </div>
      </div>

      {/* EV FINDER */}
      <EVFinder goSearch={()=>navigate("/search")} navigate={navigate} t={t} favIds={favIds} toggleFav={toggleFav}/>
      <div style={{borderTop:`1px solid ${t.bd}`,padding:"20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:22,height:22,borderRadius:6,background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}><Bolt size={11} color="#fff"/></div>
          <span style={{fontSize:13,fontWeight:600,color:t.tx}}>PlugMarket<span style={{color:BC}}>.eu</span></span>
        </div>
        <div style={{display:"flex",gap:16,fontSize:11,color:t.tx3}}>
          <span style={{cursor:"pointer"}}>About</span><span style={{cursor:"pointer"}}>For dealers</span><span style={{cursor:"pointer"}}>Privacy</span>
        </div>
        <div style={{fontSize:10,color:t.tx3}}>© 2026 PlugMarket.eu</div>
      </div>
    </>
  );
}
