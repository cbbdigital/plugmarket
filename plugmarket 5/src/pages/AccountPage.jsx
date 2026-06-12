import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BC, GR, cs } from "../styles/theme";

// ── Supabase REST client ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
const sbHeaders = (token) => ({ "apikey": SB_KEY, "Authorization": `Bearer ${token || SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" });
async function sbQuery(table, params = "", token) { try { const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: sbHeaders(token) }); if (!r.ok) return []; return await r.json(); } catch { return []; } }
async function sbUpdate(table, match, data, token) { try { const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, { method: "PATCH", headers: sbHeaders(token), body: JSON.stringify(data) }); return r.ok; } catch { return false; } }
async function sbDelete(table, match, token) { try { const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, { method: "DELETE", headers: sbHeaders(token) }); return r.ok; } catch { return false; } }
async function sbUploadVatDoc(uid, file, token) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${uid}/vat-document.${ext}`;
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/vat-docs/${path}`, {
      method: "POST",
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token}`, "x-upsert": "true", "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!r.ok) { console.error("VAT upload error:", await r.text()); return null; }
    return `${SB_URL}/storage/v1/object/public/vat-docs/${path}`;
  } catch (e) { console.error("VAT upload failed:", e); return null; }
}

// Icons
const I=({d,size=16,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const Bolt=p=><I {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
const Home=p=><I {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>;
const Srch=p=><I {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const Plus=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>}/>;
const Hrt=p=><I {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>}/>;
const Chat=p=><I {...p} d={<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>}/>;
const Usr=p=><I {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const ChR=p=><I {...p} d={<polyline points="9 18 15 12 9 6"/>}/>;
const Bak=p=><I {...p} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/>;
const Map=p=><I {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}/>;
const Car=p=><I {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const Tag=p=><I {...p} d={<><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>}/>;
const Mail=p=><I {...p} d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>;
const Shld=p=><I {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}/>;
const Bell=p=><I {...p} d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>}/>;
const Globe=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>}/>;
const CC=p=><I {...p} d={<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>}/>;
const Moon=p=><I {...p} d={<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>}/>;
const Sun=p=><I {...p} d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>}/>;
const Out=p=><I {...p} d={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>}/>;
const Edit=p=><I {...p} d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>;
const Trash=p=><I {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>}/>;
const Chk=p=><I {...p} d={<polyline points="20 6 9 17 4 12"/>}/>;
const Star=({filled,...p})=><I {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={filled?(p.color||"#f59e0b"):"none"}/>}/>;
const Cam=p=><I {...p} d={<><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>}/>;
const Key=p=><I {...p} d={<><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>}/>;
const Help=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>;
const File=p=><I {...p} d={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/>;
const Eye=p=><I {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>;
const TUp=p=><I {...p} d={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>}/>;
const Clk=p=><I {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>;
const PlusLn=p=><I {...p} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>;
const Dots=p=><I {...p} d={<><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>}/>;
const DL=p=><I {...p} d={<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/>;
const ChDn=p=><I {...p} d={<polyline points="6 9 12 15 18 9"/>}/>;

// Data
const COUNTRIES=[{c:"RO",n:"Romania"},{c:"DE",n:"Germany"},{c:"FR",n:"France"},{c:"NL",n:"Netherlands"},{c:"BE",n:"Belgium"},{c:"AT",n:"Austria"},{c:"IT",n:"Italy"},{c:"ES",n:"Spain"},{c:"PL",n:"Poland"},{c:"SE",n:"Sweden"},{c:"NO",n:"Norway"},{c:"DK",n:"Denmark"},{c:"CZ",n:"Czech Rep."},{c:"PT",n:"Portugal"}];
const LANGS=[{c:"en",n:"English"},{c:"de",n:"Deutsch"},{c:"fr",n:"Français"},{c:"ro",n:"Română"},{c:"nl",n:"Nederlands"},{c:"es",n:"Español"},{c:"it",n:"Italiano"},{c:"pl",n:"Polski"},{c:"sv",n:"Svenska"}];
const REVIEWS=[
  {id:1,name:"Thomas K.",city:"Munich",rating:5,date:"Feb 14, 2026",text:"Excellent seller! The Ioniq 5 was exactly as described. Very transparent about battery health and provided all documentation.",vehicle:"Hyundai Ioniq 5"},
  {id:2,name:"Anna S.",city:"Vienna",rating:5,date:"Dec 8, 2025",text:"Perfect transaction. Ciprian was honest about every detail, even minor scratches I wouldn't have noticed. Would buy from again.",vehicle:"Renault Megane E-Tech"},
  {id:3,name:"Erik L.",city:"Stockholm",rating:4,date:"Oct 22, 2025",text:"Good communication and fair pricing. Delivery took a bit longer than expected due to transport logistics, but overall positive.",vehicle:"Tesla Model 3"},
  {id:4,name:"Marcel D.",city:"Amsterdam",rating:5,date:"Aug 3, 2025",text:"Ciprian went above and beyond - provided battery degradation report, full service history, and even met me halfway for the handover.",vehicle:"Volkswagen ID.4"},
  {id:5,name:"Sophie B.",city:"Berlin",rating:5,date:"Jun 18, 2025",text:"Very professional for a private seller. All paperwork was prepared in advance. The car was in better condition than the photos showed.",vehicle:"BMW iX3"},
  {id:6,name:"Pierre M.",city:"Lyon",rating:4,date:"Apr 2, 2025",text:"Honest and straightforward. Minor scratch on the rear bumper was disclosed upfront. Fair negotiation process.",vehicle:"Kia EV6"},
  {id:7,name:"Luca R.",city:"Milan",rating:5,date:"Jan 15, 2025",text:"One of the best buying experiences I've had. Ciprian provided video walkaround before I travelled to see the car. Highly recommended!",vehicle:"Polestar 2"},
];

// Shared
function Toggle({value,onChange}){return <div onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,background:value?BC:"rgba(128,128,128,0.2)",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:2,left:value?22:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/></div>}
function Badge({label,color,bg}){return <span style={{fontSize:10,fontWeight:600,color,background:bg,padding:"3px 8px",borderRadius:6}}>{label}</span>}
function SBadge({status}){const m={active:{l:"Active",c:"#10b981",b:"rgba(16,185,129,0.1)"},paused:{l:"Paused",c:"#f59e0b",b:"rgba(245,158,11,0.1)"},expired:{l:"Offline",c:"#ef4444",b:"rgba(239,68,68,0.1)"}};const s=m[status]||m.active;return <Badge label={s.l} color={s.c} bg={s.b}/>}
function onlineState(car){
  if(car.status==="expired") return {kind:"expired"};
  if(!car.paidUntil) return null;
  const days=Math.ceil((new Date(car.paidUntil).getTime()-Date.now())/86400000);
  if(days<=0) return {kind:"expired"};
  if(days<=7) return {kind:"expiring",days};
  return {kind:"online",days,until:new Date(car.paidUntil)};
}
function Row({icon,label,desc,t,onClick,right,danger}){return <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${t.bd}`,cursor:onClick?"pointer":"default"}}><div style={{width:36,height:36,borderRadius:10,background:danger?"rgba(239,68,68,0.08)":t.sec,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{icon}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:danger?"#ef4444":t.tx}}>{label}</div>{desc&&<div style={{fontSize:11,color:t.tx3,marginTop:1}}>{desc}</div>}</div>{right||(onClick&&<ChR size={16} color={t.tx3}/>)}</div>}
function Sect({title,children,t}){return <div style={{...cs(t),padding:"4px 18px",marginBottom:14}}>{title&&<div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,padding:"14px 0 4px"}}>{title}</div>}{children}</div>}
function SubH({title,t,onBack}){return <div style={{padding:"14px 0 10px",display:"flex",alignItems:"center",gap:10}}>{onBack&&<button onClick={onBack} aria-label="Back" style={{width:34,height:34,borderRadius:10,border:`1px solid ${t.bd}`,background:t.card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.tx} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>}<span style={{fontSize:17,fontWeight:700}}>{title}</span></div>}

// ── Sub-pages ──
function ListingsPage({t,onBack,nav,user,session}){
  const[filter,setFilter]=useState("all");
  const[listings,setListings]=useState([]);
  const[loading,setLoading]=useState(true);
  const[deleteTarget,setDeleteTarget]=useState(null);
  const token=session?.access_token;
  const uid=user?.id;
  const d=t.bg==="#131319";

  const loadListings=async()=>{
    if(!token||!uid)return;
    const rows=await sbQuery("listings",`seller_id=eq.${uid}&status=neq.deleted&order=created_at.desc`,token);
    if(rows.length>0){
      const ids=rows.map(r=>r.id);
      const photos=await sbQuery("listing_photos",`listing_id=in.(${ids.join(",")})&position=eq.0`,token);
      const photoMap={};
      photos.forEach(p=>{photoMap[p.listing_id]=p.url});
      setListings(rows.map(r=>({
        id:r.id,make:r.make,model:`${r.model}${r.variant?" "+r.variant:""}`,year:r.year,
        price:r.price_eur,km:r.mileage_km,
        img:photoMap[r.id]||"https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=260&fit=crop",
        status:r.status||"active",views:r.view_count||0,inquiries:r.inquiry_count||0,
        saved:r.save_count||0,days:Math.max(0,Math.round((Date.now()-new Date(r.created_at).getTime())/86400000)),
        soh:r.state_of_health_pct||100,battery:r.battery_capacity_kwh?`${r.battery_capacity_kwh} kWh`:"—",boosted:r.is_boosted||false,
        paidUntil:r.paid_until,plan:r.plan,
      })));
    } else { setListings([]); }
    setLoading(false);
  };

  useEffect(()=>{loadListings()},[user,session]);

  const togglePause=async(car)=>{
    const newStatus=car.status==="paused"?"active":"paused";
    const ok=await sbUpdate("listings",`id=eq.${car.id}`,{status:newStatus},token);
    if(ok) setListings(prev=>prev.map(l=>l.id===car.id?{...l,status:newStatus}:l));
  };

  const confirmDelete=async()=>{
    if(!deleteTarget)return;
    const ok=await sbUpdate("listings",`id=eq.${deleteTarget.id}`,{status:"deleted"},token);
    if(ok) setListings(prev=>prev.filter(l=>l.id!==deleteTarget.id));
    setDeleteTarget(null);
  };

  const[toast,setToast]=useState(null);
  const boostListing=async(car)=>{
    nav(`/boost?listing=${car.id}`);
  };

  // Responsive
  const[wide,setWide]=useState(typeof window!=="undefined"?window.innerWidth>=700:false);
  useEffect(()=>{const h=()=>setWide(window.innerWidth>=700);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);

  const items=filter==="all"?listings:listings.filter(l=>l.status===filter);
  const tv=listings.reduce((a,l)=>a+l.views,0);
  const ti=listings.reduce((a,l)=>a+l.inquiries,0);

  if(loading) return <div style={{textAlign:"center",padding:"60px 0",color:t.tx3}}>Loading listings...</div>;

  return <>
    {/* Toast */}
    {toast&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:99999,background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",padding:"12px 24px",borderRadius:12,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",gap:8,animation:"fadeIn 0.3s ease"}}><Chk size={16} color="#fff"/>{toast}</div>}
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

    {/* Delete confirmation modal */}
    {deleteTarget&&(
      <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setDeleteTarget(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:20,padding:28,maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <Trash size={24} color="#ef4444"/>
          </div>
          <div style={{fontSize:18,fontWeight:700,color:t.tx,marginBottom:6}}>Delete listing?</div>
          <div style={{fontSize:13,color:t.tx2,lineHeight:1.6,marginBottom:20}}>
            <strong>{deleteTarget.year} {deleteTarget.make} {deleteTarget.model}</strong> will be permanently removed. This action cannot be undone.
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setDeleteTarget(null)} style={{flex:1,height:42,borderRadius:12,border:`1px solid ${t.bd}`,background:t.card,color:t.tx,fontSize:13,fontWeight:500,cursor:"pointer"}}>Cancel</button>
            <button onClick={confirmDelete} style={{flex:1,height:42,borderRadius:12,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(239,68,68,0.3)"}}>Delete</button>
          </div>
        </div>
      </div>
    )}

    <SubH title="My listings" t={t} onBack={onBack}/>

    {/* Sell another EV — top */}
    <button onClick={()=>nav("/sell")} style={{width:"100%",height:48,borderRadius:12,border:"none",background:GR,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16,boxShadow:"0 4px 14px rgba(255,117,0,0.25)"}}><PlusLn size={18} color="#fff"/> Sell another EV</button>

    {/* Stats */}
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {[{n:listings.filter(l=>l.status==="active").length,l:"Active",ic:<Car size={14} color={BC}/>},{n:tv,l:"Views",ic:<Eye size={14} color="#6366f1"/>},{n:ti,l:"Inquiries",ic:<Chat size={14} color="#10b981"/>}].map((s,i)=><div key={i} style={{flex:1,...cs(t),padding:"12px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>{s.ic}<span style={{fontSize:17,fontWeight:700,color:t.tx}}>{s.n}</span><span style={{fontSize:10,color:t.tx3}}>{s.l}</span></div>)}
    </div>

    {/* Filters */}
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {[{v:"all",l:"All"},{v:"active",l:"Active"},{v:"paused",l:"Paused"}].map(f=><button key={f.v} onClick={()=>setFilter(f.v)} style={{padding:"6px 14px",borderRadius:8,border:filter===f.v?"none":`1px solid ${t.bd}`,background:filter===f.v?GR:t.card,color:filter===f.v?"#fff":t.tx2,fontSize:12,fontWeight:500,cursor:"pointer"}}>{f.l}</button>)}
    </div>

    {/* Listings grid */}
    {items.length===0?(
      <div style={{textAlign:"center",padding:"40px 0"}}><Car size={36} color={t.tx3}/><div style={{fontSize:14,fontWeight:600,color:t.tx2,marginTop:10}}>No listings yet</div><div style={{fontSize:12,color:t.tx3,marginTop:4}}>Create your first listing to start selling</div></div>
    ):(
      <div style={{display:"grid",gridTemplateColumns:wide?"1fr 1fr":"1fr",gap:12,paddingBottom:12}}>
        {items.map(car=>(
          <div key={car.id} style={{...cs(t),overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {/* Image — full width, fixed height */}
            <div onClick={()=>nav(`/listing/${car.id}`)} style={{position:"relative",height:wide?170:160,overflow:"hidden",cursor:"pointer",background:d?"#1a1a22":"#f0f0f0"}}>
              <img src={car.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              <div style={{position:"absolute",top:8,left:8}}><SBadge status={car.status}/></div>
              {car.boosted&&<div style={{position:"absolute",top:8,right:8,background:GR,color:"#fff",fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:4}}>BOOSTED</div>}
              {/* Stats overlay bottom-right */}
              <div style={{position:"absolute",bottom:8,right:8,display:"flex",gap:6}}>
                {[{n:car.views,ic:<Eye size={10} color="#fff"/>},{n:car.inquiries,ic:<Chat size={10} color="#fff"/>},{n:car.saved,ic:<Hrt size={10} color="#fff"/>}].map((s,i)=>(
                  <span key={i} style={{display:"flex",alignItems:"center",gap:3,background:"rgba(0,0,0,0.5)",padding:"2px 6px",borderRadius:4,fontSize:10,color:"#fff",fontWeight:500}}>{s.ic}{s.n}</span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div onClick={()=>nav(`/listing/${car.id}`)} style={{padding:"12px 14px",cursor:"pointer",flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:t.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{car.year} {car.make} {car.model}</div>
                  <div style={{fontSize:12,color:t.tx2,marginTop:3}}>{car.km.toLocaleString()} km · {car.battery} · {car.soh}% SoH</div>
                </div>
                <div style={{fontSize:18,fontWeight:800,color:BC,flexShrink:0}}>€{car.price.toLocaleString()}</div>
              </div>
              <div style={{fontSize:11,color:t.tx3,marginTop:6,display:"flex",alignItems:"center",gap:4}}>
                <Clk size={11} color={t.tx3}/> Listed {car.days}d ago
              </div>
              {(()=>{
                const os=onlineState(car);
                if(!os) return null;
                if(os.kind==="online") return <div style={{fontSize:11,color:"#10b981",marginTop:4,display:"flex",alignItems:"center",gap:4}}><Chk size={11} color="#10b981"/> {os.days} day{os.days!==1?"s":""} left{car.plan==="trial"?" (free trial)":""} · until {os.until.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>;
                if(os.kind==="expiring") return <div style={{fontSize:11,color:"#f59e0b",marginTop:4,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><Clk size={11} color="#f59e0b"/> {os.days} day{os.days!==1?"s":""} left — renew to keep online</div>;
                return <div style={{fontSize:11,color:"#ef4444",marginTop:4,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><Clk size={11} color="#ef4444"/> Offline — renew to relist</div>;
              })()}
            </div>

            {/* Renew banner when expiring/expired */}
            {(()=>{
              const os=onlineState(car);
              if(!os||os.kind==="online") return null;
              return (
                <button onClick={()=>nav(`/plan?listing=${car.id}&renew=1`)} style={{margin:"0 14px 12px",height:40,borderRadius:10,border:"none",background:GR,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 8px rgba(255,117,0,0.25)"}}>
                  <Clk size={14} color="#fff"/> Renew listing
                </button>
              );
            })()}

            {/* Action buttons — 2x2 grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:`1px solid ${t.bd}`}}>
              {[
                {l:"Edit",ic:<Edit size={13}/>,clr:t.tx2,action:()=>nav(`/sell?edit=${car.id}`)},
                {l:car.status==="paused"?"Activate":"Pause",ic:car.status==="paused"?<Chk size={13} color="#10b981"/>:<Clk size={13} color="#f59e0b"/>,clr:car.status==="paused"?"#10b981":"#f59e0b",action:()=>togglePause(car)},
                {l:"Boost",ic:<TUp size={13}/>,clr:car.boosted?"#10b981":BC,action:()=>boostListing(car)},
                {l:"Delete",ic:<Trash size={13}/>,clr:"#ef4444",action:()=>setDeleteTarget(car)},
              ].map((a,i)=>(
                <button key={i} onClick={a.action} style={{
                  padding:"10px 0",background:"none",border:"none",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                  fontSize:11,fontWeight:500,color:a.clr,
                  borderRight:i%2===0?`1px solid ${t.bd}`:"none",
                  borderTop:i>=2?`1px solid ${t.bd}`:"none",
                }}>{a.ic}{a.l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </>;
}

function SoldPage({t,onBack,user,session}){
  const[sold,setSold]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!user||!session?.access_token)return;
    (async()=>{
      const rows=await sbQuery("listings",`seller_id=eq.${user.id}&status=eq.sold&order=sold_at.desc`,session.access_token);
      if(rows.length>0){
        const ids=rows.map(r=>r.id);
        const photos=await sbQuery("listing_photos",`listing_id=in.(${ids.join(",")})&position=eq.0`,session.access_token);
        const photoMap={};photos.forEach(p=>{photoMap[p.listing_id]=p.url});
        setSold(rows.map(r=>({id:r.id,make:r.make,model:`${r.model}${r.variant?" "+r.variant:""}`,year:r.year,price:r.price_eur,soldPrice:r.sold_price_eur||r.price_eur,km:r.mileage_km,img:photoMap[r.id]||"https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=260&fit=crop",soldDate:r.sold_at?new Date(r.sold_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—",daysListed:r.sold_at?Math.max(1,Math.round((new Date(r.sold_at)-new Date(r.created_at))/86400000)):0})));
      }
      setLoading(false);
    })();
  },[user,session]);
  const rev=sold.reduce((a,l)=>a+(l.soldPrice||0),0);
  const avg=sold.length?Math.round(sold.reduce((a,l)=>a+l.daysListed,0)/sold.length):0;
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",color:t.tx3}}>Loading...</div>;
  return <>
    <SubH title="Sold vehicles" t={t} onBack={onBack}/>
    <div style={{display:"flex",gap:8,padding:"16px 0"}}>
      {[{n:`€${rev.toLocaleString()}`,l:"Total revenue",c:"#10b981"},{n:sold.length,l:"Vehicles sold",c:t.tx},{n:sold.length?`${avg}d`:"—",l:"Avg. sell time",c:BC}].map((s,i)=><div key={i} style={{flex:1,...cs(t),padding:"14px 12px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.n}</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>{s.l}</div></div>)}
    </div>
    {sold.length===0?(
      <div style={{textAlign:"center",padding:"40px 0"}}><Tag size={36} color={t.tx3}/><div style={{fontSize:14,fontWeight:600,color:t.tx2,marginTop:10}}>No sold vehicles yet</div></div>
    ):(
      sold.map(car=><div key={car.id} style={{...cs(t),marginBottom:12,overflow:"hidden"}}><div style={{display:"flex"}}><div style={{width:130,minHeight:120,flexShrink:0,position:"relative"}}><img src={car.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(30%)"}}/><div style={{position:"absolute",top:8,left:8}}><Badge label="Sold" color="#6366f1" bg="rgba(99,102,241,0.15)"/></div></div><div style={{flex:1,padding:"12px 14px"}}><div style={{fontSize:14,fontWeight:600,color:t.tx}}>{car.year} {car.make} {car.model}</div><div style={{fontSize:12,color:t.tx2,marginTop:2}}>{car.km.toLocaleString()} km</div><div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:6}}><span style={{fontSize:16,fontWeight:700,color:"#10b981"}}>€{car.soldPrice.toLocaleString()}</span>{car.soldPrice<car.price&&<span style={{fontSize:11,color:t.tx3,textDecoration:"line-through"}}>€{car.price.toLocaleString()}</span>}</div><div style={{display:"flex",gap:8,marginTop:4,fontSize:11,color:t.tx3}}><span>{car.soldDate}</span><span>·</span><span>{car.daysListed} days listed</span></div></div></div></div>)
    )}
  </>;
}

function ReviewsPage({t,onBack}){
  const avg=(REVIEWS.reduce((a,r)=>a+r.rating,0)/REVIEWS.length).toFixed(1);
  const dist=[5,4,3,2,1].map(n=>({n,c:REVIEWS.filter(r=>r.rating===n).length}));
  return <>
    <SubH title="Reviews" t={t} onBack={onBack}/>
    <div style={{...cs(t),padding:20,margin:"16px 0 14px"}}><div style={{display:"flex",alignItems:"center",gap:20}}><div style={{textAlign:"center"}}><div style={{fontSize:40,fontWeight:800,color:t.tx}}>{avg}</div><div style={{display:"flex",gap:2,justifyContent:"center",marginTop:4}}>{[1,2,3,4,5].map(i=><Star key={i} size={14} color="#f59e0b" filled={i<=Math.round(avg)}/>)}</div><div style={{fontSize:11,color:t.tx3,marginTop:4}}>{REVIEWS.length} reviews</div></div><div style={{flex:1}}>{dist.map(dd=><div key={dd.n} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:11,color:t.tx3,width:10,textAlign:"right"}}>{dd.n}</span><Star size={10} color="#f59e0b" filled/><div style={{flex:1,height:6,borderRadius:3,background:t.sec,overflow:"hidden"}}><div style={{width:`${REVIEWS.length?(dd.c/REVIEWS.length)*100:0}%`,height:"100%",borderRadius:3,background:"#f59e0b"}}/></div><span style={{fontSize:10,color:t.tx3,width:14,textAlign:"right"}}>{dd.c}</span></div>)}</div></div></div>
    {REVIEWS.map(r=><div key={r.id} style={{...cs(t),padding:16,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:38,height:38,borderRadius:"50%",background:t.sec,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:t.tx2}}>{r.name.split(" ").map(w=>w[0]).join("")}</div><div><div style={{fontSize:13,fontWeight:600,color:t.tx}}>{r.name}</div><div style={{fontSize:11,color:t.tx3}}>{r.city} · {r.date}</div></div></div><div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(i=><Star key={i} size={12} color="#f59e0b" filled={i<=r.rating}/>)}</div></div><p style={{fontSize:13,color:t.tx2,lineHeight:1.6,margin:"10px 0 0"}}>{r.text}</p><div style={{fontSize:11,color:t.tx3,marginTop:8,display:"flex",alignItems:"center",gap:4}}><Car size={12} color={t.tx3}/> {r.vehicle}</div></div>)}
  </>;
}

function EditPage({t,onBack,user,session,profile,updateProfile,fetchProfile}){
  const isDealer = profile?.seller_type === "dealer";
  const token = session?.access_token;
  const uid = user?.id;

  // Common
  const[name,setName]=useState(profile?.full_name||"");
  const[phone,setPhone]=useState(profile?.phone||"");
  const[city,setCity]=useState(profile?.city||"");
  const[country,setCountry]=useState(profile?.country||"RO");
  const[address,setAddress]=useState(profile?.address||"");
  const[bio,setBio]=useState(profile?.bio||"");

  // Dealer business
  const[firmName,setFirmName]=useState(profile?.firm_name||"");
  const[vatNumber,setVatNumber]=useState(profile?.vat_number||"");
  const[mapsUrl,setMapsUrl]=useState(profile?.maps_url||"");
  const[website,setWebsite]=useState(profile?.website||"");

  // VAT document
  const[vatDocUrl,setVatDocUrl]=useState(profile?.vat_doc_url||"");
  const[uploadingDoc,setUploadingDoc]=useState(false);
  const verified = profile?.dealer_verified === true;

  const[saved,setSaved]=useState(false);
  const[saving,setSaving]=useState(false);

  const inp={width:"100%",height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 14px",fontSize:13,boxSizing:"border-box",outline:"none"};
  const lbl={fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"};
  const initials=(name||user?.email||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  const handleVatUpload=async(e)=>{
    const file=e.target.files?.[0];
    if(!file||!uid||!token)return;
    setUploadingDoc(true);
    const url=await sbUploadVatDoc(uid,file,token);
    if(url){
      // cache-bust so the new image shows
      const display=`${url}?v=${Date.now()}`;
      setVatDocUrl(display);
      await sbUpdate("profiles",`id=eq.${uid}`,{vat_doc_url:url},token);
      if(fetchProfile) fetchProfile(uid);
    } else {
      alert("Upload failed. Make sure a 'vat-docs' storage bucket exists in Supabase.");
    }
    setUploadingDoc(false);
    e.target.value="";
  };

  const handleSave=async()=>{
    setSaving(true);
    const updates={
      full_name:name||null, phone:phone||null, city:city||null,
      country:country||null, address:address||null, bio:bio||null,
    };
    if(isDealer){
      updates.firm_name=firmName||null;
      updates.vat_number=vatNumber||null;
      updates.maps_url=mapsUrl||null;
      updates.website=website||null;
    }
    // seller_type intentionally NOT included — locked at signup
    let ok=false;
    if(updateProfile){ const {error}=await updateProfile(updates); ok=!error; }
    else { ok=await sbUpdate("profiles",`id=eq.${uid}`,updates,token); }
    setSaving(false);
    if(ok){ setSaved(true); setTimeout(()=>{setSaved(false);onBack()},800); }
    else { alert("Could not save changes. Please try again."); }
  };

  return <>
    <SubH title="Edit profile" t={t} onBack={onBack}/>

    {/* Avatar */}
    <div style={{display:"flex",justifyContent:"center",padding:"28px 0 20px"}}>
      <div style={{position:"relative"}}>
        <div style={{width:88,height:88,borderRadius:"50%",background:GR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"#fff"}}>{initials}</div>
      </div>
    </div>

    {/* Account type — locked */}
    <div style={{...cs(t),padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:10,background:t.sec,display:"flex",alignItems:"center",justifyContent:"center"}}><Usr size={18} color={BC}/></div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:t.tx}}>{isDealer?"Dealer account":"Private account"}</div>
        <div style={{fontSize:11,color:t.tx3,marginTop:1}}>Account type can't be changed</div>
      </div>
      {isDealer&&(verified
        ? <Badge label="Verified" color="#10b981" bg="rgba(16,185,129,0.1)"/>
        : <Badge label="Verification pending" color="#f59e0b" bg="rgba(245,158,11,0.1)"/>)}
    </div>

    {/* Common fields */}
    <div style={{...cs(t),padding:18,marginBottom:14}}><div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div><label style={lbl}>{isDealer?"Contact name":"Full name"}</label><input value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
      <div><label style={lbl}>Email</label><div style={{...inp,display:"flex",alignItems:"center",color:t.tx3,background:t.sec}}>{user?.email}<span style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}><Chk size={13} color="#10b981"/><span style={{fontSize:11,color:"#10b981"}}>Verified</span></span></div></div>
      <div><label style={lbl}>Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp} placeholder="+40 ..."/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><label style={lbl}>City</label><input value={city} onChange={e=>setCity(e.target.value)} style={inp}/></div>
        <div><label style={lbl}>Country</label><div style={{position:"relative"}}><select value={country} onChange={e=>setCountry(e.target.value)} style={{...inp,appearance:"none",WebkitAppearance:"none",paddingRight:30,cursor:"pointer"}}>{COUNTRIES.map(c=><option key={c.c} value={c.c}>{c.n}</option>)}</select><div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><ChDn size={14} color={t.tx3}/></div></div></div>
      </div>
      <div><label style={lbl}>Address</label><input value={address} onChange={e=>setAddress(e.target.value)} style={inp} placeholder="Street, number"/></div>
      <div><label style={lbl}>Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{...inp,height:"auto",padding:"10px 14px",resize:"vertical",fontFamily:"inherit",lineHeight:1.5}}/></div>
    </div></div>

    {/* Dealer business details */}
    {isDealer&&(
      <div style={{...cs(t),padding:18,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14}}>Business details</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={lbl}>Firm name</label><input value={firmName} onChange={e=>setFirmName(e.target.value)} style={inp} placeholder="Trading / brand name"/></div>
          <div><label style={lbl}>VAT number</label><input value={vatNumber} onChange={e=>setVatNumber(e.target.value)} style={inp} placeholder="e.g. RO12345678"/></div>
          <div><label style={lbl}>Website</label><input value={website} onChange={e=>setWebsite(e.target.value)} style={inp} placeholder="https://..."/></div>
          <div><label style={lbl}>Google Maps link</label><input value={mapsUrl} onChange={e=>setMapsUrl(e.target.value)} style={inp} placeholder="https://maps.google.com/..."/></div>
        </div>
      </div>
    )}

    {/* VAT document upload — dealers only */}
    {isDealer&&(
      <div style={{...cs(t),padding:18,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>VAT document</div>
        {verified ? (
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0"}}>
            <Shld size={18} color="#10b981"/>
            <div style={{fontSize:13,color:t.tx2}}>Your dealer account is verified.</div>
          </div>
        ) : (
          <div style={{fontSize:12,color:t.tx2,lineHeight:1.6,marginBottom:12}}>
            Upload a clear photo or scan of your VAT registration document. Our team reviews it and verifies your dealer account, usually within 1–2 business days.
          </div>
        )}

        {vatDocUrl ? (
          <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${t.bd}`,marginBottom:12}}>
            <img src={vatDocUrl} alt="VAT document" style={{width:"100%",maxHeight:240,objectFit:"contain",background:t.sec,display:"block"}} onError={e=>{e.target.style.display="none"}}/>
            <div style={{padding:"8px 12px",fontSize:11,color:t.tx3,display:"flex",alignItems:"center",gap:6}}><File size={13} color={t.tx3}/> Document uploaded {verified?"· verified":"· awaiting review"}</div>
          </div>
        ) : null}

        {!verified&&(
          <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,height:46,borderRadius:12,border:`2px dashed ${t.bd}`,background:t.sec,color:t.tx2,fontSize:13,fontWeight:600,cursor:uploadingDoc?"default":"pointer"}}>
            <input type="file" accept="image/*,.pdf" onChange={handleVatUpload} style={{display:"none"}} disabled={uploadingDoc}/>
            {uploadingDoc ? "Uploading..." : (vatDocUrl?<><Cam size={16} color={t.tx2}/> Replace document</>:<><Cam size={16} color={t.tx2}/> Upload VAT document</>)}
          </label>
        )}
      </div>
    )}

    <button onClick={handleSave} disabled={saving} style={{width:"100%",height:46,borderRadius:12,border:"none",background:GR,color:"#fff",fontSize:14,fontWeight:600,cursor:saving?"default":"pointer",opacity:saving?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 10px rgba(255,117,0,0.3)"}}>{saved?<><Chk size={16} color="#fff"/> Saved!</>:saving?"Saving...":"Save changes"}</button>
  </>;
}

function SecurityPage({t,onBack}){return <>
  <SubH title="Security" t={t} onBack={onBack}/>
  <div style={{padding:"16px 0"}}>
    <Sect t={t} title="Password"><Row t={t} icon={<Key size={18} color={BC}/>} label="Change password" desc="Last changed 3 months ago" onClick={()=>{}}/></Sect>
    <Sect t={t} title="Two-factor authentication"><Row t={t} icon={<Shld size={18} color="#10b981"/>} label="2FA enabled" desc="Authenticator app" right={<Badge label="Active" color="#10b981" bg="rgba(16,185,129,0.1)"/>}/></Sect>
    <Sect t={t} title="Active sessions">
      {[{dev:"Chrome on macOS",loc:"Satu Mare, Romania",time:"Current session",active:true},{dev:"PlugMarket App on iPhone",loc:"Satu Mare, Romania",time:"2 hours ago",active:false}].map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${t.bd}`}}><div><div style={{fontSize:13,fontWeight:500,color:t.tx}}>{s.dev}</div><div style={{fontSize:11,color:t.tx3,marginTop:2}}>{s.loc} · {s.time}</div></div>{s.active?<Badge label="Active" color="#10b981" bg="rgba(16,185,129,0.1)"/>:<button style={{fontSize:11,color:"#ef4444",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Revoke</button>}</div>)}
    </Sect>
    <Sect t={t} title="Data & privacy">
      <Row t={t} icon={<DL size={18} color={t.tx2}/>} label="Download my data" desc="Request a copy of your account data" onClick={()=>{}}/>
      <Row t={t} icon={<Trash size={18} color="#ef4444"/>} label="Delete account" desc="Permanently remove your account" onClick={()=>{}} danger/>
    </Sect>
  </div>
</>}

function brandColor(b){const m={visa:"#1a1f71",mastercard:"#eb001b",amex:"#2e77bb",discover:"#ff6000"};return m[(b||"").toLowerCase()]||"#555"}

function PaymentPage({t,onBack,user,session}){
  const token=session?.access_token;
  const uid=user?.id;
  const[cards,setCards]=useState([]);
  const[loading,setLoading]=useState(true);
  const[removeTarget,setRemoveTarget]=useState(null);

  const load=async()=>{
    if(!uid||!token){setLoading(false);return;}
    const rows=await sbQuery("payment_methods",`user_id=eq.${uid}&order=is_main.desc,created_at.asc`,token);
    setCards(rows);
    setLoading(false);
  };
  useEffect(()=>{load()},[user,session]);

  const setMain=async(card)=>{
    if(card.is_main)return;
    // unset all, then set chosen
    await sbUpdate("payment_methods",`user_id=eq.${uid}`,{is_main:false},token);
    const ok=await sbUpdate("payment_methods",`id=eq.${card.id}`,{is_main:true},token);
    if(ok) setCards(prev=>prev.map(c=>({...c,is_main:c.id===card.id})).sort((a,b)=>(b.is_main?1:0)-(a.is_main?1:0)));
  };

  const confirmRemove=async()=>{
    if(!removeTarget)return;
    const wasMain=removeTarget.is_main;
    const ok=await sbDelete("payment_methods",`id=eq.${removeTarget.id}`,token);
    if(ok){
      let next=cards.filter(c=>c.id!==removeTarget.id);
      // if we removed the main card, promote the first remaining
      if(wasMain&&next.length>0&&!next.some(c=>c.is_main)){
        await sbUpdate("payment_methods",`id=eq.${next[0].id}`,{is_main:true},token);
        next=next.map((c,i)=>({...c,is_main:i===0}));
      }
      setCards(next);
    }
    setRemoveTarget(null);
  };

  const addCard=()=>{
    // Real card entry must go through Stripe (tokenized) — wired to a Netlify
    // function + Stripe SetupIntent later. Placeholder for now.
    alert("Adding a card will open secure Stripe checkout once payments are connected.");
  };

  const main=cards.find(c=>c.is_main);
  const supp=cards.filter(c=>!c.is_main);

  return <>
    <SubH title="Payment methods" t={t} onBack={onBack}/>

    {/* Remove confirmation */}
    {removeTarget&&(
      <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setRemoveTarget(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:20,padding:28,maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Trash size={22} color="#ef4444"/></div>
          <div style={{fontSize:17,fontWeight:700,color:t.tx,marginBottom:6}}>Remove card?</div>
          <div style={{fontSize:13,color:t.tx2,marginBottom:18}}>{(removeTarget.brand||"Card")} ending {removeTarget.last4} will be removed.</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setRemoveTarget(null)} style={{flex:1,height:42,borderRadius:12,border:`1px solid ${t.bd}`,background:t.card,color:t.tx,fontSize:13,fontWeight:500,cursor:"pointer"}}>Cancel</button>
            <button onClick={confirmRemove} style={{flex:1,height:42,borderRadius:12,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Remove</button>
          </div>
        </div>
      </div>
    )}

    {loading?(
      <div style={{textAlign:"center",padding:"60px 0",color:t.tx3}}>Loading cards...</div>
    ):(
      <div style={{padding:"6px 0"}}>
        {/* Main card */}
        <div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Main card</div>
        {main?(
          <div style={{borderRadius:16,padding:18,marginBottom:18,background:`linear-gradient(135deg,${brandColor(main.brand)},#000)`,color:"#fff",boxShadow:"0 8px 24px rgba(0,0,0,0.25)",position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <CC size={26} color="rgba(255,255,255,0.9)"/>
              <span style={{fontSize:10,fontWeight:700,background:"rgba(255,255,255,0.2)",padding:"3px 9px",borderRadius:20,letterSpacing:0.5}}>MAIN</span>
            </div>
            <div style={{fontSize:19,fontWeight:600,letterSpacing:2,marginTop:24,fontFamily:"monospace"}}>•••• •••• •••• {main.last4}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:14}}>
              <div>
                <div style={{fontSize:9,opacity:0.7,textTransform:"uppercase"}}>Card holder</div>
                <div style={{fontSize:13,fontWeight:600}}>{main.holder_name||(user?.email||"")}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,opacity:0.7,textTransform:"uppercase"}}>Expires</div>
                <div style={{fontSize:13,fontWeight:600}}>{String(main.exp_month).padStart(2,"0")}/{String(main.exp_year).slice(-2)}</div>
              </div>
            </div>
            <button onClick={()=>setRemoveTarget(main)} style={{position:"absolute",bottom:14,right:14,width:30,height:30,borderRadius:8,border:"none",background:"rgba(255,255,255,0.15)",cursor:"pointer",display:"none"}}/>
          </div>
        ):(
          <div style={{...cs(t),padding:"22px 18px",marginBottom:18,textAlign:"center",border:`1.5px dashed ${t.bd}`,background:"none"}}>
            <CC size={28} color={t.tx3}/>
            <div style={{fontSize:13,color:t.tx2,marginTop:8}}>No main card yet</div>
          </div>
        )}

        {/* Supplementary cards */}
        <div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Supplementary cards</div>
        {supp.length===0?(
          <div style={{fontSize:12,color:t.tx3,padding:"4px 0 14px"}}>No supplementary cards.</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {supp.map(c=>(
              <div key={c.id} style={{...cs(t),padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:28,borderRadius:6,background:brandColor(c.brand),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CC size={16} color="#fff"/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:t.tx,textTransform:"capitalize"}}>{c.brand||"Card"} •••• {c.last4}</div>
                  <div style={{fontSize:11,color:t.tx3,marginTop:1}}>Expires {String(c.exp_month).padStart(2,"0")}/{String(c.exp_year).slice(-2)}</div>
                </div>
                <button onClick={()=>setMain(c)} style={{fontSize:11,fontWeight:600,color:BC,background:"none",border:`1px solid ${t.bd}`,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>Set main</button>
                <button onClick={()=>setRemoveTarget(c)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${t.bd}`,background:t.sec,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Trash size={14} color="#ef4444"/></button>
              </div>
            ))}
          </div>
        )}

        {/* Add card */}
        <button onClick={addCard} style={{width:"100%",height:48,borderRadius:12,border:`1.5px dashed ${BC}`,background:"rgba(255,117,0,0.04)",color:BC,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
          <PlusLn size={18} color={BC}/> Add a card
        </button>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14}}>
          <Shld size={13} color={t.tx3}/>
          <span style={{fontSize:11,color:t.tx3}}>Cards are securely stored by Stripe — never on our servers</span>
        </div>
      </div>
    )}
  </>;
}

function LangPage({t,onBack}){
  const[lang,setLang]=useState("en");const[curr,setCurr]=useState("EUR");const[region,setRegion]=useState("RO");const[saved,setSaved]=useState(false);
  const inp={width:"100%",height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 14px",fontSize:13,boxSizing:"border-box",outline:"none",appearance:"none",WebkitAppearance:"none",cursor:"pointer"};
  const Cv=()=><div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><ChDn size={14} color={t.tx3}/></div>;
  return <>
    <SubH title="Language & region" t={t} onBack={onBack}/>
    <div style={{padding:"16px 0"}}>
      <div style={{...cs(t),padding:18}}><div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Language</label><div style={{position:"relative"}}><select value={lang} onChange={e=>setLang(e.target.value)} style={{...inp,paddingRight:30}}>{LANGS.map(l=><option key={l.c} value={l.c}>{l.n}</option>)}</select><Cv/></div></div>
        <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Currency</label><div style={{position:"relative"}}><select value={curr} onChange={e=>setCurr(e.target.value)} style={{...inp,paddingRight:30}}>{["EUR","GBP","CHF","SEK","NOK","DKK","PLN","CZK","RON","HUF"].map(c=><option key={c} value={c}>{c}</option>)}</select><Cv/></div></div>
        <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Region</label><div style={{position:"relative"}}><select value={region} onChange={e=>setRegion(e.target.value)} style={{...inp,paddingRight:30}}>{COUNTRIES.map(c=><option key={c.c} value={c.c}>{c.n}</option>)}</select><Cv/></div></div>
      </div></div>
      <div style={{background:"rgba(255,117,0,0.05)",borderRadius:12,padding:"12px 16px",marginTop:14,border:"1px solid rgba(255,117,0,0.1)"}}><div style={{fontSize:12,color:t.tx2,lineHeight:1.5}}>Changing your region affects which listings you see by default. You can always search across all EU countries.</div></div>
      <button onClick={()=>{setSaved(true);setTimeout(()=>{setSaved(false);onBack()},800)}} style={{width:"100%",height:46,borderRadius:12,border:"none",background:GR,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:16,boxShadow:"0 2px 10px rgba(255,117,0,0.3)"}}>{saved?<><Chk size={16} color="#fff"/> Saved!</>:"Save preferences"}</button>
    </div>
  </>;
}

function HelpPage({t,onBack}){
  const[open,setOpen]=useState(null);
  const faqs=[
    {q:"How do I list my EV for sale?",a:"Go to the Sell tab in the bottom navigation. You'll be guided through a 6-step process: vehicle details, EV specifications (battery, range, charging), photos, pricing with a description, contact info, and a final review before publishing. The whole process takes about 5–10 minutes."},
    {q:"Is it free to list a vehicle?",a:"Your first listing is free for 30 days. After the trial, listings are kept active with a plan (€9.99/month or €49.99 for 6 months). You can also boost any listing for more visibility — €2.99 for 24 hours or €5.99 for 7 days."},
    {q:"How does the battery health (SoH) verification work?",a:"When listing your EV, you can enter the State of Health percentage from your vehicle's diagnostic system or a third-party battery report. Buyers see this prominently on your listing. We recommend getting a certified battery report from your dealership or an independent service — listings with verified SoH data sell on average 40% faster."},
    {q:"How do I communicate with buyers?",a:"When a buyer sends an inquiry through your listing, you'll receive a notification and the conversation appears in the Messages tab. All communication stays within PlugMarket for your safety. You can share additional photos, negotiate pricing, and arrange viewings through the chat."},
    {q:"What payment methods are accepted?",a:"PlugMarket facilitates the connection between buyers and sellers. Payment and vehicle transfer are arranged directly between both parties. We recommend using bank transfers for large transactions and meeting in person to complete the handover. Always verify documents before finalising a sale."},
    {q:"Can I sell to buyers in other EU countries?",a:"Yes, PlugMarket operates across the entire European Union. Your listing is visible to buyers in all EU countries. Cross-border sales are common on our platform. Keep in mind that import regulations, registration requirements, and VAT rules vary by country — we recommend both parties research the specific requirements for their countries."},
    {q:"How do I edit or remove my listing?",a:"Go to Account → My Listings. Each listing has action buttons for Edit, Pause, Boost, and Delete. Editing lets you update any field including photos and price. Pausing temporarily hides the listing from search results without deleting it. You can reactivate a paused listing at any time."},
    {q:"What should I include in the vehicle description?",a:"A good description covers: recent maintenance history, charging habits (home vs. DC fast charging), tyre condition, reason for selling, included extras (winter tyres, charging cables), and any known issues. Honest, detailed descriptions build trust and lead to faster sales. Listings with thorough descriptions sell 2x faster on average."},
    {q:"How are seller ratings calculated?",a:"After a completed transaction, the buyer can leave a 1–5 star rating and a written review. Your overall rating is the average across all reviews. Ratings are visible on your profile and on each of your listings. Maintaining good communication, accurate descriptions, and fair pricing are the best ways to earn high ratings."},
    {q:"How do I delete my account?",a:"Go to Account → Security → Data & Privacy → Delete Account. This will permanently remove your profile, listings, messages, and reviews. This action cannot be undone. If you just want to take a break, consider pausing your listings instead."},
  ];
  return <>
    <SubH title="Help centre" t={t} onBack={onBack}/>
    <div style={{padding:"6px 0"}}>
      <div style={{...cs(t),padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,background:`linear-gradient(135deg,rgba(255,117,0,0.06),rgba(255,149,51,0.06))`,border:`1px solid rgba(255,117,0,0.1)`}}>
        <Help size={18} color={BC}/>
        <div style={{fontSize:12,color:t.tx2,lineHeight:1.5}}>Can't find what you're looking for? Contact our support team for personalised help.</div>
      </div>
      {faqs.map((f,i)=><div key={i} style={{...cs(t),marginBottom:8,overflow:"hidden"}}>
        <div onClick={()=>setOpen(open===i?null:i)} style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",gap:12}}>
          <span style={{fontSize:13,fontWeight:500,color:t.tx,flex:1}}>{f.q}</span>
          <div style={{transform:open===i?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}><ChDn size={16} color={t.tx3}/></div>
        </div>
        {open===i&&<div style={{padding:"0 16px 14px",fontSize:13,color:t.tx2,lineHeight:1.7,borderTop:`1px solid ${t.bd}`}}><div style={{paddingTop:12}}>{f.a}</div></div>}
      </div>)}
    </div>
  </>;
}

function ContactPage({t,onBack}){
  return <>
    <SubH title="Contact support" t={t} onBack={onBack}/>
    <div style={{padding:"16px 0"}}>
      <div style={{...cs(t),padding:24,textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(255,117,0,0.1),rgba(255,149,51,0.1))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}><Mail size={24} color={BC}/></div>
        <div style={{fontSize:16,fontWeight:700,color:t.tx,marginTop:16}}>Email us</div>
        <div style={{fontSize:13,color:t.tx2,marginTop:6,lineHeight:1.6}}>Our support team typically responds within 24 hours on business days.</div>
        <div style={{fontSize:15,fontWeight:600,color:BC,marginTop:16,padding:"12px 20px",background:"rgba(255,117,0,0.06)",borderRadius:10,border:"1px solid rgba(255,117,0,0.12)",display:"inline-block"}}>support@plugmarket.eu</div>
        <div style={{fontSize:12,color:t.tx3,marginTop:16,lineHeight:1.5}}>Please include your account email and a description of your issue. For listing-related questions, include the listing title or ID.</div>
      </div>
      <div style={{...cs(t),padding:18,marginTop:14}}>
        <div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Before contacting us</div>
        <div style={{fontSize:13,color:t.tx2,lineHeight:1.6}}>Many questions are answered in our Help Centre. Check the FAQs first — you might find an instant answer without waiting for a reply.</div>
      </div>
    </div>
  </>;
}

function TermsPage({t,onBack}){
  const [tab,setTab]=useState("terms"); // terms | privacy
  const S=({n,title,children})=>(
    <div style={{marginBottom:22}}>
      <div style={{fontSize:14.5,fontWeight:700,color:t.tx,marginBottom:7}}>{n?`${n}. `:""}{title}</div>
      <div style={{fontSize:13,color:t.tx2,lineHeight:1.8}}>{children}</div>
    </div>
  );
  const Sub=({title,children})=>(
    <div style={{margin:"10px 0"}}>
      <div style={{fontSize:13,fontWeight:600,color:t.tx,marginBottom:3}}>{title}</div>
      <div style={{fontSize:13,color:t.tx2,lineHeight:1.8}}>{children}</div>
    </div>
  );
  const Li=({children})=><li style={{marginBottom:5}}>{children}</li>;
  const UL=({children})=><ul style={{margin:"6px 0 6px 18px",padding:0,fontSize:13,color:t.tx2,lineHeight:1.7}}>{children}</ul>;
  const tabBtn=(id,label)=>(
    <button onClick={()=>setTab(id)} style={{flex:1,height:40,borderRadius:10,border:tab===id?`1.5px solid ${BC}`:`1px solid ${t.bd}`,background:tab===id?"rgba(255,117,0,0.06)":t.card,color:tab===id?BC:t.tx2,fontSize:13,fontWeight:tab===id?700:500,cursor:"pointer"}}>{label}</button>
  );

  return <>
    <SubH title="Terms & Privacy" t={t} onBack={onBack}/>
    <div style={{padding:"6px 0"}}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {tabBtn("terms","Terms of Service")}
        {tabBtn("privacy","Privacy & GDPR")}
      </div>

      {tab==="terms"&&(
      <div style={{...cs(t),padding:"20px 18px"}}>
        <div style={{fontSize:12,color:t.tx3,marginBottom:4}}>Terms of Service</div>
        <div style={{fontSize:12,color:t.tx3,marginBottom:20}}>Last updated: 12 June 2026 · Effective immediately on acceptance</div>

        <S n="1" title="About PlugMarket and these Terms">
          PlugMarket.eu (“PlugMarket”, “we”, “us”, “our”) is an online marketplace operated by [Company Legal Name], a company registered in Romania under company number [Company Registration No.], with its registered office at [Registered Office Address] and VAT number [VAT No.]. PlugMarket connects private sellers and professional dealers of electric vehicles with prospective buyers across the European Union. These Terms of Service (“Terms”) form a binding agreement between you and PlugMarket and govern your access to and use of our websites, applications, and services (together, the “Platform”). By creating an account, listing a vehicle, sending a message, or otherwise using the Platform, you confirm that you have read, understood, and accepted these Terms and our Privacy &amp; Data Protection notice. If you do not agree, you must not use the Platform.
        </S>

        <S n="2" title="Definitions">
          <UL>
            <Li>“User” — any person who accesses or uses the Platform, whether or not registered.</Li>
            <Li>“Buyer” — a User who browses or enquires about vehicles.</Li>
            <Li>“Seller” — a User who lists a vehicle, whether a “Private Seller” (consumer) or a “Dealer” (acting for purposes relating to their trade, business, craft, or profession).</Li>
            <Li>“Listing” — a vehicle advertisement created by a Seller.</Li>
            <Li>“Content” — any text, photographs, specifications, messages, reviews, or other material submitted to the Platform.</Li>
            <Li>“Paid Services” — listing plans, listing credits/packs, boosts, featured placement, and any other fee-based feature.</Li>
          </UL>
        </S>

        <S n="3" title="Eligibility">
          To register or transact you must be at least 18 years old and able to enter into a legally binding contract in your country of residence. The Platform is intended for use within the European Union; if you access it from elsewhere, you are responsible for compliance with local law. Dealers must be lawfully registered to trade in their jurisdiction and hold any licences required to sell motor vehicles. We may request evidence of identity, VAT registration, or trading status at any time and may refuse, suspend, or terminate access where eligibility cannot be verified.
        </S>

        <S n="4" title="Accounts: registration, account types and security">
          You must provide accurate, current, and complete information and keep it up to date. There are two account types — Private and Dealer — selected at registration. The account type determines your obligations and cannot be changed after sign-up; to switch, you must close your account and register again. You are responsible for safeguarding your login credentials and for all activity under your account, and you must notify us immediately of any suspected unauthorised use. You may not transfer your account to another person or maintain multiple accounts to evade limits, suspensions, or fees.
        </S>

        <S n="5" title="The role of PlugMarket — we are an intermediary only">
          PlugMarket provides a venue that allows Sellers and Buyers to find one another and communicate. We are not a party to any sale, purchase, or other agreement between Users. We do not own, inspect, take possession of, warrant, or guarantee any vehicle, and we do not act as agent, broker, escrow holder, dealer, importer, valuer, or insurer for any transaction. All negotiations, contracts, payments, inspections, transport, registration, and transfers of ownership take place directly between Buyer and Seller, at their own risk. We do not guarantee that any listing is accurate, that any vehicle exists or is as described, that a Seller is able to sell or a Buyer to pay, or that any transaction will complete.
        </S>

        <S n="6" title="Listings and EV-specific accuracy">
          Sellers are solely responsible for the accuracy and completeness of every Listing, including make, model, variant, year, mileage, condition, price, drivetrain, VIN where provided, registration details, and all photographs.
          <Sub title="Electric-vehicle disclosures">
            Because battery condition materially affects value, Sellers must give honest figures for battery capacity, usable capacity, and State of Health (SoH) where stated, and must not misrepresent range, charging speed, or charging history. Any battery degradation report, service history, accident history, modification, outstanding finance, or import status known to the Seller must be disclosed.
          </Sub>
          <Sub title="Ownership and legality">
            Every listed vehicle must be lawfully owned by the Seller, or the Seller must hold the owner’s explicit authority to sell it. Listings for stolen vehicles, vehicles subject to undisclosed liens or finance, cloned vehicles, or vehicles that cannot lawfully be transferred are strictly prohibited. We may remove any Listing and suspend any account that breaches this clause, without notice.
          </Sub>
        </S>

        <S n="7" title="Dealer obligations and consumer law">
          Dealers act in a business capacity and must comply with all laws applicable to professional motor-vehicle sales, including EU and national consumer-protection, distance-selling, advertising, guarantee, and pre-contractual information requirements. Dealers must provide accurate business identity and VAT details, honour the statutory legal guarantee of conformity owed to consumer Buyers, and clearly state price, whether VAT is included or deductible, and any applicable consumer right of withdrawal for distance sales. Dealers are responsible for their own compliance; PlugMarket does not provide legal advice and does not assume Dealers’ statutory obligations. Verified-dealer status, where shown, indicates only that we have received certain documentation and is not an endorsement or warranty.
        </S>

        <S n="8" title="Fees, Paid Services, subscriptions and refunds">
          Creating an account and browsing are free, and we charge Buyers no fee. A Seller’s first Listing is free for 30 days; thereafter a Listing is kept online with a paid plan (30-day or 6-month). Optional Paid Services include listing boosts, featured placement, and Dealer listing packs (credits). Prices are shown in euros before purchase and may include or exclude VAT as indicated. Payments are processed by our payment provider (Stripe); we do not store full card details. Dealer pack credits are tied to your account, are non-transferable, and—except where required by law—are non-refundable once redeemed.
          <Sub title="Right of withdrawal for digital services">
            Where you are a consumer purchasing a Paid Service, you may have a statutory 14-day right of withdrawal. By asking us to begin a Paid Service immediately (for example, publishing or boosting a Listing right away), you request performance during the withdrawal period and acknowledge that, once the service is fully performed, the right of withdrawal is lost; if performance is ongoing when you withdraw, you may owe a proportionate amount for what was supplied. Statutory consumer rights under EU and national law are not affected.
          </Sub>
        </S>

        <S n="9" title="Messaging, the one-message rule and off-platform conduct">
          Messaging exists to let Buyers and Sellers discuss a specific vehicle. To reduce spam and protect Sellers, a new conversation is limited to a single opening message from the Buyer; further messages are enabled once the Seller replies. You must not use messaging to send unsolicited commercial messages, harass or threaten others, share another person’s personal data unlawfully, attempt to defraud, or solicit payments or actions outside the Platform in order to evade these Terms or our fees. We may read, screen, limit, or remove messages where necessary to operate the Platform, ensure safety, or comply with law, consistent with our Privacy notice.
        </S>

        <S n="10" title="Reviews and ratings">
          Reviews must reflect genuine experience and must not be false, defamatory, incentivised, or manipulated. You may not post or solicit fake reviews, review your own account, or trade reviews. We may remove reviews that breach these Terms and may suspend accounts that manipulate ratings.
        </S>

        <S n="11" title="Prohibited conduct">
          You agree not to: post false, misleading, or fraudulent Content; list prohibited or unlawful vehicles; harass, threaten, discriminate against, or abuse others; use the Platform for any unlawful purpose, including money laundering or sanctions evasion; circumvent security, access controls, rate limits, or fees; scrape, harvest, copy, or reproduce Platform Content or data without authorisation; introduce malware; impersonate any person or entity; create multiple or fake accounts; or interfere with the proper functioning of the Platform. We may remove Content and suspend or terminate accounts that breach this clause.
        </S>

        <S n="12" title="Intellectual property and your content licence">
          The Platform, including its software, design, branding, logos, text, and graphics, is owned by PlugMarket or its licensors and protected by intellectual-property law. You retain ownership of Content you submit. By submitting Content, you grant PlugMarket a non-exclusive, worldwide, royalty-free, sub-licensable licence to host, store, reproduce, adapt for formatting, display, and distribute that Content for the purpose of operating, promoting, and improving the Platform. You confirm you hold the rights necessary to grant this licence and that your Content does not infringe any third party’s rights. The licence ends when you delete the Content or close your account, except for copies retained as required by law or in backups for a limited period.
        </S>

        <S n="13" title="Transactions, risk and due diligence">
          Because PlugMarket is not a party to sales, Buyers and Sellers bear full responsibility for their transactions. We strongly recommend that Buyers verify identity and documentation, inspect the vehicle (or commission an independent inspection and battery-health check), confirm there is no outstanding finance, and use secure, traceable payment methods—never sending money to anyone they have not verified. Beware of deals that seem too good to be true, requests to transact off-platform, pressure to pay quickly, or requests for payment by irreversible means. PlugMarket does not provide escrow and is not responsible for losses arising between Users.
        </S>

        <S n="14" title="Disclaimers">
          The Platform is provided “as is” and “as available”. To the maximum extent permitted by law, we exclude all warranties not expressly stated, including as to the accuracy of Listings, the quality, legality, or safety of any vehicle, uninterrupted or error-free operation, and the conduct of any User. Nothing in these Terms excludes liability that cannot lawfully be excluded.
        </S>

        <S n="15" title="Limitation of liability">
          To the maximum extent permitted by law, PlugMarket is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profit, data, goodwill, or opportunity, arising from your use of the Platform, any transaction between Users, vehicle defects, or inaccurate Listings. Our total aggregate liability to you for any claim arising out of or relating to the Platform or these Terms shall not exceed the greater of the total fees you paid to PlugMarket in the twelve months before the event giving rise to the claim, or €100. Nothing limits liability for death or personal injury caused by our negligence, for fraud, or for any liability that cannot be limited under applicable EU or national law, including a consumer’s mandatory rights.
        </S>

        <S n="16" title="Indemnity">
          You agree to indemnify and hold PlugMarket harmless from claims, losses, and reasonable costs arising from your breach of these Terms, your Content, your Listings, your transactions with other Users, or your violation of any law or third-party right, except to the extent the loss results from our own breach or negligence.
        </S>

        <S n="17" title="Suspension and termination">
          You may close your account at any time. We may suspend or terminate access, remove Content, or withdraw Listings where we reasonably believe you have breached these Terms or the law, where required by a competent authority, or to protect Users or the Platform. Where practical and lawful we will give notice and a chance to remedy. Termination does not affect rights or liabilities accrued before it, and clauses that by their nature should survive (including IP, liability, indemnity, and governing law) will continue.
        </S>

        <S n="18" title="Changes to the Platform and to these Terms">
          We may modify or discontinue features of the Platform. We may update these Terms; for material changes affecting your rights or obligations we will give at least 30 days’ notice by email or on the Platform before they take effect. Continued use after the effective date constitutes acceptance. If you do not agree, you may close your account before the changes take effect.
        </S>

        <S n="19" title="Force majeure, assignment and severability">
          We are not liable for failure or delay caused by events beyond our reasonable control. We may assign these Terms to a successor in connection with a merger, acquisition, or sale of assets; you may not assign your rights without our consent. If any provision is held invalid, the remainder continues in force.
        </S>

        <S n="20" title="Governing law and dispute resolution">
          These Terms are governed by the laws of Romania and applicable EU law. Subject to any mandatory consumer-protection rules of your country of residence, the competent courts of [Court / City], Romania shall have jurisdiction. As an EU consumer you may also use the European Commission’s Online Dispute Resolution platform at ec.europa.eu/consumers/odr. We will try in good faith to resolve disputes informally first; please contact us before commencing proceedings.
        </S>

        <S n="21" title="Contact">
          Questions about these Terms: [Company Legal Name], [Registered Office Address], support@plugmarket.eu.
        </S>
      </div>
      )}

      {tab==="privacy"&&(
      <div style={{...cs(t),padding:"20px 18px"}}>
        <div style={{fontSize:12,color:t.tx3,marginBottom:4}}>Privacy &amp; Data Protection Notice (GDPR)</div>
        <div style={{fontSize:12,color:t.tx3,marginBottom:20}}>Last updated: 12 June 2026</div>

        <S n="1" title="Who we are (Data Controller)">
          The controller of your personal data is [Company Legal Name], [Registered Office Address], Romania (company no. [Company Registration No.]). For any privacy matter, contact privacy@plugmarket.eu. [If appointed: Our Data Protection Officer can be reached at dpo@plugmarket.eu.] This notice explains what personal data we process, why, on what legal basis, with whom we share it, how long we keep it, and the rights you have under the EU General Data Protection Regulation (GDPR) and Romanian data-protection law.
        </S>

        <S n="2" title="The data we collect">
          <UL>
            <Li><b>Account &amp; profile</b> — name or company name, email, password (stored hashed by our auth provider), phone, address, city, country, bio, profile and cover images.</Li>
            <Li><b>Dealer data</b> — legal/firm name, VAT number, business address, website, map link, and the VAT or registration document you upload for verification.</Li>
            <Li><b>Listings</b> — vehicle details, photographs, and any information you choose to include.</Li>
            <Li><b>Messages</b> — the content and metadata of conversations between Users.</Li>
            <Li><b>Transactions &amp; payments</b> — records of Paid Services you buy. Card payments are handled by Stripe; we receive confirmation and limited details (such as the last four digits and status) but not your full card number.</Li>
            <Li><b>Technical &amp; usage data</b> — IP address, device and browser information, log data, and interactions with the Platform, collected via cookies and similar technologies.</Li>
            <Li><b>Support data</b> — information you provide when you contact us.</Li>
          </UL>
          We do not intentionally collect special-category data; please do not include it in Listings or messages.
        </S>

        <S n="3" title="Why we use your data and our legal bases">
          <UL>
            <Li><b>To provide the Platform</b> (accounts, listings, search, messaging, favourites) — <i>performance of a contract</i> (Art. 6(1)(b)).</Li>
            <Li><b>To process Paid Services and prevent payment fraud</b> — <i>contract</i> and <i>legitimate interests</i> (Art. 6(1)(b),(f)).</Li>
            <Li><b>To verify Dealers and handle VAT documents</b> — <i>legal obligation</i> and <i>legitimate interests</i> in marketplace trust (Art. 6(1)(c),(f)).</Li>
            <Li><b>To send service messages</b> (e.g. listing-expiry, security) — <i>contract</i> / <i>legitimate interests</i>.</Li>
            <Li><b>To send marketing</b>, where applicable — <i>consent</i> (Art. 6(1)(a)), which you can withdraw at any time.</Li>
            <Li><b>To keep the Platform safe and prevent abuse</b> — <i>legitimate interests</i> (Art. 6(1)(f)).</Li>
            <Li><b>To comply with law and respond to authorities</b> — <i>legal obligation</i> (Art. 6(1)(c)).</Li>
            <Li><b>Non-essential cookies/analytics</b> — <i>consent</i> where required.</Li>
          </UL>
        </S>

        <S n="4" title="Who we share data with (recipients and processors)">
          We do not sell your personal data. We share it only as needed:
          <UL>
            <Li><b>Other Users</b> — your public profile, Listings, and the city/region shown on a Listing are visible to others; message content is shared with the User you contact.</Li>
            <Li><b>Service providers (processors)</b> acting on our instructions: Supabase (database, authentication, file storage), Netlify (hosting and serverless functions), Stripe (payments), and our email provider (transactional email). Each processes data under a data-processing agreement.</Li>
            <Li><b>Authorities and advisers</b> — where required by law, to establish or defend legal claims, or to prevent fraud or harm.</Li>
            <Li><b>Successors</b> — in connection with a merger, acquisition, or asset sale, subject to this notice.</Li>
          </UL>
        </S>

        <S n="5" title="International transfers">
          Some providers may process data outside the European Economic Area. Where they do, we rely on an adequacy decision or appropriate safeguards such as the European Commission’s Standard Contractual Clauses, together with supplementary measures where needed. You can ask us for details of the safeguards in place.
        </S>

        <S n="6" title="How long we keep data">
          We keep personal data only as long as necessary for the purposes above. In general: account and profile data for the life of your account and a limited period afterwards; Listings and messages while relevant to the service and for a reasonable period thereafter; transaction and invoicing records for the period required by tax and accounting law (typically up to 10 years in Romania); verification documents for as long as needed to maintain dealer status; and logs for a short, security-appropriate period. When data is no longer needed we delete or anonymise it.
        </S>

        <S n="7" title="Your rights">
          Subject to conditions in the GDPR, you have the right to: access your data; rectify inaccurate data; erase data (“right to be forgotten”); restrict or object to processing, including objecting to processing based on legitimate interests and to direct marketing at any time; data portability; and to withdraw consent at any time without affecting prior processing. You can exercise many of these from your account settings or by emailing privacy@plugmarket.eu. We will respond within one month. You also have the right to lodge a complaint with a supervisory authority — in Romania, the National Supervisory Authority for Personal Data Processing (ANSPDCP, dataprotection.ro) — or with the authority in your EU country of residence.
        </S>

        <S n="8" title="Cookies and similar technologies">
          We use cookies and local storage that are strictly necessary to run the Platform (for example, to keep you signed in and remember your theme and favourites). Where we use non-essential cookies or analytics, we ask for your consent and you can change your choice at any time. You can also control cookies through your browser, though disabling essential cookies may break core features.
        </S>

        <S n="9" title="Security">
          We use appropriate technical and organisational measures to protect personal data, including encryption in transit, access controls, hashed passwords, and server-side handling of sensitive operations. No system is perfectly secure; if a personal-data breach is likely to affect your rights, we will notify the supervisory authority and, where required, you, in line with the GDPR.
        </S>

        <S n="10" title="Children">
          The Platform is not intended for anyone under 18, and we do not knowingly collect their data. If you believe a minor has provided us data, contact us and we will delete it.
        </S>

        <S n="11" title="Automated decision-making">
          We do not make decisions producing legal or similarly significant effects about you based solely on automated processing. Features such as the EV recommender and price-positioning indicator are informational tools and do not determine your access to the Platform.
        </S>

        <S n="12" title="Changes and contact">
          We may update this notice; we will post the new version with its date and, for material changes, give notice as we do for our Terms. For any privacy question or to exercise your rights: [Company Legal Name], [Registered Office Address], privacy@plugmarket.eu.
        </S>
      </div>
      )}
    </div>
  </>;
}

// ══ Main ══
export default function AccountPage(){
  const { t, dark, setDark } = useOutletContext();
  const { user, session, signOut, profile, updateProfile, fetchProfile, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const[page,setPage]=useState(sp.get("page")||"home");
  const[notifEmail,setNotifEmail]=useState(true);
  const[notifPush,setNotifPush]=useState(true);
  const[notifNewMsg,setNotifNewMsg]=useState(true);
  const[notifPrice,setNotifPrice]=useState(true);
  const[stats,setStats]=useState({listings:0,saved:0,messages:0,rating:0,sold:0,reviews:0});
  const[notifs,setNotifs]=useState([]);

  // A session token in storage means we're logged in but useAuth may still be hydrating.
  // Only redirect to /login once auth has finished loading AND there's genuinely no session.
  const hasStoredSession = () => {
    try { const r = localStorage.getItem("sb-tmftxqwqwceuiydleuag-auth-token"); if (r) { const s = JSON.parse(r); return !!s?.access_token; } } catch {}
    return false;
  };

  useEffect(() => { if (!authLoading && !user && !hasStoredSession()) nav("/login"); }, [authLoading, user, nav]);

  useEffect(()=>{
    if(!user||!session?.access_token)return;
    const token=session.access_token;
    const uid=user.id;
    (async()=>{
      const listings=await sbQuery("listings",`seller_id=eq.${uid}&status=neq.deleted&select=id,status`,token);
      const active=listings.filter(l=>l.status==="active").length;
      const sold=listings.filter(l=>l.status==="sold").length;
      const favs=await sbQuery("favourites",`user_id=eq.${uid}&select=listing_id`,token);
      // Only count favourites whose listing still exists
      let savedCount=0;
      const favIds=(favs||[]).map(f=>f.listing_id).filter(id=>typeof id==="string"&&id.length>10&&!id.startsWith("evdb_"));
      if(favIds.length){
        const liveFav=await sbQuery("listings",`id=in.(${favIds.join(",")})&select=id`,token);
        const liveSet=new Set((liveFav||[]).map(x=>x.id));
        savedCount=favIds.filter(id=>liveSet.has(id)).length;
      }
      // Only count conversations that actually have at least one message
      const convos=await sbQuery("conversations",`or=(buyer_id.eq.${uid},seller_id.eq.${uid})&select=id`,token);
      let realConvos=0;
      if(convos.length){
        const cids=convos.map(c=>c.id);
        const msgs=await sbQuery("messages",`conversation_id=in.(${cids.join(",")})&select=conversation_id`,token);
        realConvos=new Set((msgs||[]).map(m=>m.conversation_id)).size;
      }
      const reviews=await sbQuery("reviews",`seller_id=eq.${uid}&select=rating`,token);
      const avgRating=reviews.length>0?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):"—";
      setStats({listings:active,saved:savedCount,messages:realConvos,rating:avgRating,sold,reviews:reviews.length});
      const notes=await sbQuery("notifications",`user_id=eq.${uid}&read=eq.false&order=created_at.desc`,token);
      setNotifs(notes);
    })();
  },[user,session]);

  if (!user) {
    // Session still loading — show a brief placeholder rather than bouncing to /login
    if (authLoading || hasStoredSession()) return <div style={{padding:"60px 0",textAlign:"center",fontSize:13,color:t.tx3}}>Loading your account…</div>;
    return null;
  }

  const goHome=()=>{ setPage("home"); try{ nav("/account",{replace:true}); }catch{} };
  const isDealer = profile?.seller_type === "dealer";
  const dealerVerified = profile?.dealer_verified === true;
  const needsVatDoc = isDealer && !dealerVerified && !profile?.vat_doc_url;

  const dismissNotif=async(id)=>{
    setNotifs(prev=>prev.filter(n=>n.id!==id));
    if(session?.access_token) await sbUpdate("notifications",`id=eq.${id}`,{read:true},session.access_token);
  };

  const content = ()=>{
    if(page==="listings") return <ListingsPage t={t} onBack={goHome} nav={nav} user={user} session={session}/>;
    if(page==="sold") return <SoldPage t={t} onBack={goHome} user={user} session={session}/>;
    if(page==="reviews") return <ReviewsPage t={t} onBack={goHome}/>;
    if(page==="edit") return <EditPage t={t} onBack={goHome} user={user} session={session} profile={profile} updateProfile={updateProfile} fetchProfile={fetchProfile}/>;
    if(page==="security") return <SecurityPage t={t} onBack={goHome}/>;
    if(page==="payment") return <PaymentPage t={t} onBack={goHome} user={user} session={session}/>;
    if(page==="language") return <LangPage t={t} onBack={goHome}/>;
    if(page==="help") return <HelpPage t={t} onBack={goHome}/>;
    if(page==="contact") return <ContactPage t={t} onBack={goHome}/>;
    if(page==="terms") return <TermsPage t={t} onBack={goHome}/>;

    // Home
    const isWide = typeof window !== "undefined" && window.innerWidth >= 700;
    return <>
      {/* Renewal / in-app notifications */}
      {notifs.map(n=>(
        <div key={n.id} style={{...cs(t),padding:"14px 16px",marginTop:10,marginBottom:14,display:"flex",alignItems:"center",gap:12,border:`1px solid rgba(255,117,0,0.3)`,background:"rgba(255,117,0,0.05)"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,117,0,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Bell size={18} color={BC}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:t.tx}}>{n.title}</div>
            <div style={{fontSize:11,color:t.tx2,marginTop:1}}>{n.body}</div>
          </div>
          {n.type==="renewal"&&n.listing_id&&(
            <button onClick={()=>nav(`/plan?listing=${n.listing_id}&renew=1`)} style={{fontSize:12,fontWeight:600,color:"#fff",background:GR,border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",flexShrink:0}}>Renew</button>
          )}
          <button onClick={()=>dismissNotif(n.id)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${t.bd}`,background:t.sec,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Chk size={14} color={t.tx3}/></button>
        </div>
      ))}

      {/* Dealer verification prompt */}
      {needsVatDoc&&(
        <div onClick={()=>setPage("edit")} style={{...cs(t),padding:"14px 16px",marginTop:10,marginBottom:14,display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:`1px solid rgba(245,158,11,0.3)`,background:"rgba(245,158,11,0.06)"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(245,158,11,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Shld size={18} color="#f59e0b"/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:t.tx}}>Finish dealer verification</div>
            <div style={{fontSize:11,color:t.tx2,marginTop:1}}>Upload your VAT document to get verified.</div>
          </div>
          <ChR size={16} color={t.tx3}/>
        </div>
      )}

      {/* Profile card — always full width */}
      <div style={{...cs(t),padding:20,marginTop:(needsVatDoc||notifs.length>0)?0:10,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:GR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"#fff",flexShrink:0}}>{(profile?.full_name||user?.email||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{fontSize:18,fontWeight:700,color:t.tx}}>{profile?.full_name||user?.email}</div>
              {isDealer&&dealerVerified&&<Chk size={15} color="#10b981"/>}
            </div>
            <div style={{fontSize:12,color:t.tx2,marginTop:2}}>{user?.email}</div>
            {isDealer&&<div style={{fontSize:11,color:dealerVerified?BC:"#f59e0b",fontWeight:600,marginTop:3}}>{profile?.firm_name?profile.firm_name+" · ":""}Dealer{dealerVerified?" · Verified":" · Verification pending"}</div>}
            {profile?.city&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}><Map size={12} color={t.tx3}/><span style={{fontSize:11,color:t.tx3}}>{profile.city}{profile.country?`, ${profile.country}`:""}</span></div>}
          </div>
          <button onClick={()=>setPage("edit")} style={{width:36,height:36,borderRadius:10,border:`1px solid ${t.bd}`,background:t.sec,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Edit size={16} color={t.tx2}/></button>
        </div>
        <div style={{display:"flex",gap:1,marginTop:16,background:t.bd,borderRadius:12,overflow:"hidden"}}>
          {[{n:stats.listings,l:"Listings"},{n:stats.saved,l:"Saved"},{n:stats.messages,l:"Messages"},{n:stats.rating,l:"Rating"}].map((s,i)=><div key={i} style={{flex:1,background:t.sec,padding:"12px 0",textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:t.tx}}>{s.n}</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>{s.l}</div></div>)}
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{fontSize:11,color:t.tx3}}>Member since {new Date(user?.created_at||Date.now()).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</div>
          <span style={{color:t.tx3}}>·</span>
          <button onClick={()=>nav(`/seller/${user.id}`)} style={{fontSize:11,color:BC,background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:0}}>View public profile</button>
        </div>
      </div>

      {/* Sections — 2-col grid on wide, stacked on narrow */}
      <div style={{display:"grid",gridTemplateColumns:isWide?"1fr 1fr":"1fr",gap:14}}>
        <Sect t={t} title="My vehicles">
          <Row t={t} icon={<Car size={18} color={BC}/>} label="My listings" desc={`${stats.listings} active listing${stats.listings!==1?"s":""}`} onClick={()=>setPage("listings")}/>
          <Row t={t} icon={<Chat size={18} color={BC}/>} label="Messages" desc={`${stats.messages} conversation${stats.messages!==1?"s":""}`} onClick={()=>nav("/messages")}/>
          <Row t={t} icon={<Tag size={18} color={t.tx2}/>} label="Sold vehicles" desc={`${stats.sold} vehicle${stats.sold!==1?"s":""} sold`} onClick={()=>setPage("sold")}/>
          <Row t={t} icon={<Star size={18} color="#f59e0b" filled/>} label="Reviews" desc={stats.reviews>0?`${stats.rating} avg from ${stats.reviews} review${stats.reviews!==1?"s":""}`:"No reviews yet"} onClick={()=>setPage("reviews")}/>
        </Sect>
        <Sect t={t} title="Account">
          <Row t={t} icon={<Usr size={18} color={t.tx2}/>} label="Edit profile" desc={isDealer?"Business details, VAT document":"Name, photo, location"} onClick={()=>setPage("edit")}/>
          <Row t={t} icon={<Shld size={18} color={t.tx2}/>} label="Security" desc="Password, 2FA, sessions" onClick={()=>setPage("security")}/>
          <Row t={t} icon={<CC size={18} color={t.tx2}/>} label="Payment methods" desc="Manage your cards" onClick={()=>setPage("payment")}/>
          <Row t={t} icon={<Globe size={18} color={t.tx2}/>} label="Language & region" desc="English · EUR · Romania" onClick={()=>setPage("language")}/>
        </Sect>
        <Sect t={t} title="Notifications">
          <Row t={t} icon={<Mail size={18} color={t.tx2}/>} label="Email notifications" right={<Toggle value={notifEmail} onChange={setNotifEmail}/>}/>
          <Row t={t} icon={<Bell size={18} color={t.tx2}/>} label="Push notifications" right={<Toggle value={notifPush} onChange={setNotifPush}/>}/>
          <Row t={t} icon={<Chat size={18} color={t.tx2}/>} label="New message alerts" right={<Toggle value={notifNewMsg} onChange={setNotifNewMsg}/>}/>
          <Row t={t} icon={<Tag size={18} color={t.tx2}/>} label="Price drop alerts" right={<Toggle value={notifPrice} onChange={setNotifPrice}/>}/>
        </Sect>
        <div>
          <Sect t={t} title="Appearance">
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${t.bd}`}}>
              <div style={{width:36,height:36,borderRadius:10,background:t.sec,display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?<Moon size={18} color={BC}/>:<Sun size={18} color="#f59e0b"/>}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>Dark mode</div><div style={{fontSize:11,color:t.tx3,marginTop:1}}>{dark?"Dark theme active":"Light theme active"}</div></div>
              <Toggle value={dark} onChange={setDark}/>
            </div>
          </Sect>
          <Sect t={t} title="Support">
            <Row t={t} icon={<Help size={18} color={t.tx2}/>} label="Help centre" desc="FAQs and guides" onClick={()=>setPage("help")}/>
            <Row t={t} icon={<Chat size={18} color={t.tx2}/>} label="Contact support" desc="Get help from our team" onClick={()=>setPage("contact")}/>
            <Row t={t} icon={<File size={18} color={t.tx2}/>} label="Terms & Privacy" onClick={()=>setPage("terms")}/>
          </Sect>
        </div>
      </div>
      <Sect t={t}><Row t={t} icon={<Out size={18} color="#ef4444"/>} label="Log out" danger onClick={()=>{signOut();nav("/login")}}/></Sect>
      <div style={{textAlign:"center",padding:"16px 0 8px"}}><div style={{fontSize:11,color:t.tx3}}>PlugMarket.eu · v1.0.2</div></div>
    </>;
  };

  return content();
}
