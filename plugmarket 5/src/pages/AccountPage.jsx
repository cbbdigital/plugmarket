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
function SBadge({status}){const m={active:{l:"Active",c:"#10b981",b:"rgba(16,185,129,0.1)"},paused:{l:"Paused",c:"#f59e0b",b:"rgba(245,158,11,0.1)"}};const s=m[status]||m.active;return <Badge label={s.l} color={s.c} bg={s.b}/>}
function Row({icon,label,desc,t,onClick,right,danger}){return <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${t.bd}`,cursor:onClick?"pointer":"default"}}><div style={{width:36,height:36,borderRadius:10,background:danger?"rgba(239,68,68,0.08)":t.sec,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{icon}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:danger?"#ef4444":t.tx}}>{label}</div>{desc&&<div style={{fontSize:11,color:t.tx3,marginTop:1}}>{desc}</div>}</div>{right||(onClick&&<ChR size={16} color={t.tx3}/>)}</div>}
function Sect({title,children,t}){return <div style={{...cs(t),padding:"4px 18px",marginBottom:14}}>{title&&<div style={{fontSize:12,fontWeight:600,color:t.tx3,textTransform:"uppercase",letterSpacing:0.5,padding:"14px 0 4px"}}>{title}</div>}{children}</div>}
function SubH({title,t}){return <div style={{padding:"14px 0 10px"}}><span style={{fontSize:17,fontWeight:700}}>{title}</span></div>}

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
    const ok=await sbUpdate("listings",`id=eq.${car.id}`,{is_boosted:true},token);
    if(ok) setListings(prev=>prev.map(l=>l.id===car.id?{...l,boosted:true}:l));
    if(ok){setToast(`${car.year} ${car.make} ${car.model} is now featured!`);setTimeout(()=>setToast(null),3000);}
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
            </div>

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

function EditPage({t,onBack}){
  const[name,setName]=useState("Ciprian M.");const[phone,setPhone]=useState("+40 742 000 000");const[city,setCity]=useState("Satu Mare");const[country,setCountry]=useState("RO");const[bio,setBio]=useState("EV enthusiast from Romania. Currently driving a Tesla Model 3 LR.");const[saved,setSaved]=useState(false);
  const inp={width:"100%",height:42,borderRadius:10,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 14px",fontSize:13,boxSizing:"border-box",outline:"none"};
  return <>
    <SubH title="Edit profile" t={t} onBack={onBack}/>
    <div style={{display:"flex",justifyContent:"center",padding:"28px 0 20px"}}><div style={{position:"relative"}}><div style={{width:88,height:88,borderRadius:"50%",background:GR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"#fff"}}>CM</div><div style={{position:"absolute",bottom:0,right:0,width:30,height:30,borderRadius:"50%",background:t.card,border:`2px solid ${t.bg}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}}><Cam size={14} color={t.tx2}/></div></div></div>
    <div style={{...cs(t),padding:18,marginBottom:14}}><div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Full name</label><input value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
      <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Email</label><div style={{...inp,display:"flex",alignItems:"center",color:t.tx3,background:t.sec}}>ciprian@plugmarket.eu <span style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}><Chk size={13} color="#10b981"/><span style={{fontSize:11,color:"#10b981"}}>Verified</span></span></div></div>
      <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>City</label><input value={city} onChange={e=>setCity(e.target.value)} style={inp}/></div>
        <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Country</label><div style={{position:"relative"}}><select value={country} onChange={e=>setCountry(e.target.value)} style={{...inp,appearance:"none",WebkitAppearance:"none",paddingRight:30,cursor:"pointer"}}>{COUNTRIES.map(c=><option key={c.c} value={c.c}>{c.n}</option>)}</select><div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><ChDn size={14} color={t.tx3}/></div></div></div>
      </div>
      <div><label style={{fontSize:12,fontWeight:600,color:t.tx2,marginBottom:4,display:"block"}}>Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{...inp,height:"auto",padding:"10px 14px",resize:"vertical",fontFamily:"inherit",lineHeight:1.5}}/></div>
    </div></div>
    <button onClick={()=>{setSaved(true);setTimeout(()=>{setSaved(false);onBack()},800)}} style={{width:"100%",height:46,borderRadius:12,border:"none",background:GR,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 10px rgba(255,117,0,0.3)"}}>{saved?<><Chk size={16} color="#fff"/> Saved!</>:"Save changes"}</button>
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

function PaymentPage({t,onBack}){return <>
  <SubH title="Payment methods" t={t} onBack={onBack}/>
  <div style={{textAlign:"center",padding:"60px 0"}}>
    <CC size={48} color={t.tx3}/>
    <div style={{fontSize:16,fontWeight:600,color:t.tx,marginTop:16}}>Coming soon</div>
    <div style={{fontSize:13,color:t.tx2,marginTop:6,lineHeight:1.6}}>Payment methods and billing will be available here once we integrate with Stripe.</div>
  </div>
</>}

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

function HelpPage({t}){
  const[open,setOpen]=useState(null);
  const faqs=[
    {q:"How do I list my EV for sale?",a:"Go to the Sell tab in the bottom navigation. You'll be guided through a 6-step process: vehicle details, EV specifications (battery, range, charging), photos, pricing with a description, contact info, and a final review before publishing. The whole process takes about 5–10 minutes."},
    {q:"Is it free to list a vehicle?",a:"Basic listings are completely free. You can optionally boost your listing for increased visibility at €9.99, which places it higher in search results and in the Featured section on the homepage for 7 days."},
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
    <SubH title="Help centre" t={t}/>
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

function ContactPage({t}){
  return <>
    <SubH title="Contact support" t={t}/>
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

function TermsPage({t}){
  const S=({title,children})=><div style={{marginBottom:24}}><div style={{fontSize:15,fontWeight:700,color:t.tx,marginBottom:8}}>{title}</div><div style={{fontSize:13,color:t.tx2,lineHeight:1.8}}>{children}</div></div>;
  return <>
    <SubH title="Terms & Privacy" t={t}/>
    <div style={{padding:"6px 0"}}>
      <div style={{...cs(t),padding:"20px 18px"}}>
        <div style={{fontSize:12,color:t.tx3,marginBottom:20}}>Last updated: March 1, 2026</div>

        <S title="1. About PlugMarket">
          PlugMarket.eu is an online marketplace operated within the European Union that connects private sellers and professional dealers of electric vehicles with potential buyers across Europe. The platform provides listing, search, messaging, and related services to facilitate the buying and selling of electric vehicles. PlugMarket does not own, buy, sell, or lease any vehicles listed on the platform. We act solely as an intermediary connecting buyers and sellers.
        </S>

        <S title="2. Eligibility and Account Registration">
          To use PlugMarket, you must be at least 18 years old and legally capable of entering into binding agreements in your country of residence. When creating an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account. PlugMarket reserves the right to suspend or terminate accounts that violate these terms, contain fraudulent information, or are used for purposes that harm other users or the platform.
        </S>

        <S title="3. Listing Vehicles">
          Sellers are solely responsible for the accuracy and completeness of their vehicle listings, including but not limited to: vehicle specifications, battery health (State of Health), mileage, condition, pricing, photographs, and any disclosures about damage, accidents, or modifications. Misrepresenting a vehicle's condition, history, or specifications is a violation of these terms and may result in listing removal and account suspension. All listed vehicles must be legally owned by the seller or the seller must have explicit authorisation from the owner to sell the vehicle. Listings for stolen vehicles, vehicles with undisclosed liens, or vehicles that cannot legally be transferred are strictly prohibited.
        </S>

        <S title="4. Transactions Between Users">
          PlugMarket facilitates introductions between buyers and sellers but is not a party to any transaction. All negotiations, agreements, payments, vehicle inspections, and transfers of ownership are conducted directly between the buyer and seller. PlugMarket does not guarantee the condition, safety, legality, or quality of any listed vehicle, the accuracy of any listing content, the ability of sellers to sell or buyers to purchase, or that a transaction will be completed. Both buyers and sellers are encouraged to exercise due diligence, including verifying vehicle documentation, arranging independent inspections, and using secure payment methods.
        </S>

        <S title="5. Fees and Payments">
          Creating an account and browsing listings on PlugMarket is free. Basic vehicle listings are free of charge. Optional premium services, including listing boosts, featured placement, and subscription plans, are available for a fee. All fees are displayed clearly before purchase and are charged in euros. Payments for premium services are processed through secure third-party payment providers. Refunds for premium services are provided in accordance with applicable EU consumer protection laws. PlugMarket does not process payments between buyers and sellers for vehicle transactions.
        </S>

        <S title="6. User Conduct">
          When using PlugMarket, you agree not to: post false, misleading, or fraudulent listings; harass, threaten, or abuse other users; use the platform for any illegal purpose; attempt to circumvent platform security measures; scrape, copy, or reproduce platform content without authorisation; send unsolicited commercial messages to other users; create multiple accounts to evade suspensions or bans; or manipulate ratings or reviews. PlugMarket reserves the right to remove content and suspend accounts that violate these guidelines, at our sole discretion and without prior notice.
        </S>

        <S title="7. Intellectual Property">
          All content on PlugMarket, including but not limited to the logo, design, software, text, and graphics, is owned by PlugMarket or its licensors and is protected by applicable intellectual property laws. User-generated content, including listing descriptions and photographs, remains the property of the respective users. By posting content on PlugMarket, you grant us a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content in connection with operating and promoting the platform.
        </S>

        <S title="8. Privacy and Data Protection">
          PlugMarket is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR) and applicable national data protection laws. We collect and process personal data including your name, email address, phone number, location, and usage data to provide and improve our services, facilitate communication between users, send service-related notifications, personalise your experience, and comply with legal obligations. We do not sell your personal data to third parties. Data may be shared with payment processors and service providers necessary for platform operation, law enforcement when required by law, and other users to the extent necessary for transactions (for example, showing your city on a listing). You have the right to access, correct, delete, or export your personal data at any time through your account settings or by contacting our support team. For detailed information about cookies, data retention periods, and your full privacy rights, please refer to our complete Privacy Policy available on our website.
        </S>

        <S title="9. Limitation of Liability">
          To the maximum extent permitted by applicable law, PlugMarket shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, any transaction between users, vehicle defects, inaccuracies in listings, or inability to access the platform. PlugMarket's total liability for any claim arising from these terms shall not exceed the total fees you have paid to PlugMarket in the twelve months preceding the claim. Nothing in these terms excludes or limits liability that cannot be excluded or limited under applicable EU or national law.
        </S>

        <S title="10. Dispute Resolution">
          In the event of a dispute between users, PlugMarket encourages resolution through direct communication. We may, at our discretion, provide mediation assistance but are not obligated to do so. For disputes between you and PlugMarket, these terms are governed by the laws of the European Union and the applicable laws of Romania. Any legal proceedings shall be brought before the competent courts of Satu Mare, Romania, unless mandatory consumer protection laws in your country of residence provide otherwise. As a consumer in the EU, you also have the right to submit complaints to the European Online Dispute Resolution platform at ec.europa.eu/consumers/odr.
        </S>

        <S title="11. Changes to These Terms">
          PlugMarket may update these terms from time to time. We will notify you of material changes by email or through the platform at least 30 days before they take effect. Your continued use of the platform after changes take effect constitutes acceptance of the updated terms. If you do not agree with the changes, you may close your account before the new terms take effect.
        </S>

        <S title="12. Contact">
          If you have any questions about these terms, please contact us at support@plugmarket.eu. PlugMarket is operated within the European Union. Registered address details are available upon request.
        </S>
      </div>
    </div>
  </>;
}

// ══ Main ══
export default function AccountPage(){
  const { t, dark, setDark } = useOutletContext();
  const { user, session, signOut, profile } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const[page,setPage]=useState(sp.get("page")||"home");
  const[notifEmail,setNotifEmail]=useState(true);
  const[notifPush,setNotifPush]=useState(true);
  const[notifNewMsg,setNotifNewMsg]=useState(true);
  const[notifPrice,setNotifPrice]=useState(true);
  const[stats,setStats]=useState({listings:0,saved:0,messages:0,rating:0,sold:0,reviews:0});

  useEffect(() => { if (!user) nav("/login"); }, [user, nav]);

  useEffect(()=>{
    if(!user||!session?.access_token)return;
    const token=session.access_token;
    const uid=user.id;
    (async()=>{
      const listings=await sbQuery("listings",`seller_id=eq.${uid}&status=neq.deleted&select=id,status`,token);
      const active=listings.filter(l=>l.status==="active").length;
      const sold=listings.filter(l=>l.status==="sold").length;
      const favs=await sbQuery("favourites",`user_id=eq.${uid}&select=id`,token);
      const convos=await sbQuery("conversations",`or=(buyer_id.eq.${uid},seller_id.eq.${uid})&select=id`,token);
      const reviews=await sbQuery("reviews",`seller_id=eq.${uid}&select=rating`,token);
      const avgRating=reviews.length>0?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):"—";
      setStats({listings:active,saved:favs.length,messages:convos.length,rating:avgRating,sold,reviews:reviews.length});
    })();
  },[user,session]);

  if (!user) return null;

  const goHome=()=>setPage("home");

  const content = ()=>{
    if(page==="listings") return <ListingsPage t={t} onBack={goHome} nav={nav} user={user} session={session}/>;
    if(page==="sold") return <SoldPage t={t} onBack={goHome} user={user} session={session}/>;
    if(page==="reviews") return <ReviewsPage t={t} onBack={goHome}/>;
    if(page==="edit") return <EditPage t={t} onBack={goHome}/>;
    if(page==="security") return <SecurityPage t={t} onBack={goHome}/>;
    if(page==="payment") return <PaymentPage t={t} onBack={goHome}/>;
    if(page==="language") return <LangPage t={t} onBack={goHome}/>;
    if(page==="help") return <HelpPage t={t}/>;
    if(page==="contact") return <ContactPage t={t}/>;
    if(page==="terms") return <TermsPage t={t}/>;

    // Home
    const isWide = typeof window !== "undefined" && window.innerWidth >= 700;
    return <>
      {/* Profile card — always full width */}
      <div style={{...cs(t),padding:20,marginTop:10,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:GR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"#fff",flexShrink:0}}>{(profile?.full_name||user?.email||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:18,fontWeight:700,color:t.tx}}>{profile?.full_name||user?.email}</div>
            <div style={{fontSize:12,color:t.tx2,marginTop:2}}>{user?.email}</div>
            {profile?.city&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}><Map size={12} color={t.tx3}/><span style={{fontSize:11,color:t.tx3}}>{profile.city}{profile.country?`, ${profile.country}`:""}</span></div>}
          </div>
          <button onClick={()=>setPage("edit")} style={{width:36,height:36,borderRadius:10,border:`1px solid ${t.bd}`,background:t.sec,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Edit size={16} color={t.tx2}/></button>
        </div>
        <div style={{display:"flex",gap:1,marginTop:16,background:t.bd,borderRadius:12,overflow:"hidden"}}>
          {[{n:stats.listings,l:"Listings"},{n:stats.saved,l:"Saved"},{n:stats.messages,l:"Messages"},{n:stats.rating,l:"Rating"}].map((s,i)=><div key={i} style={{flex:1,background:t.sec,padding:"12px 0",textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:t.tx}}>{s.n}</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>{s.l}</div></div>)}
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
          {profile?.is_verified&&<div style={{fontSize:11,color:t.tx3,display:"flex",alignItems:"center",gap:4}}><Chk size={12} color="#10b981"/> Verified seller</div>}
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
          <Row t={t} icon={<Usr size={18} color={t.tx2}/>} label="Edit profile" desc="Name, photo, location" onClick={()=>setPage("edit")}/>
          <Row t={t} icon={<Shld size={18} color={t.tx2}/>} label="Security" desc="Password, 2FA, sessions" onClick={()=>setPage("security")}/>
          <Row t={t} icon={<CC size={18} color={t.tx2}/>} label="Payment methods" desc="Coming soon" onClick={()=>setPage("payment")}/>
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
