import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";

// ── Supabase REST client ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
async function sbGet(table,params){try{const r=await fetch(`${SB_URL}/rest/v1/${table}?${params}`,{headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`}});if(!r.ok)return[];return await r.json()}catch{return[]}}

/* ── Icons ── */
const I=({d,size=16,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const Bolt=p=><I {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
const Map2=p=><I {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}/>;
const Srch=p=><I {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const CD=p=><I {...p} d={<polyline points="6 9 12 15 18 9"/>}/>;
const Car=p=><I {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const Hrt=({filled,...p})=><I {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={filled?(p.color||"currentColor"):"none"}/>}/>;
const Flt=p=><I {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>}/>;

const BC="#FF7500";
const BG="linear-gradient(135deg,#FF7500,#FF9533)";
const BL="#FFF3EB";

const MK={Tesla:["Model 3","Model Y","Model S","Model X"],BMW:["iX3","iX1","i4","i5","i7","iX"],Volkswagen:["ID.3","ID.4","ID.5","ID.7"],Mercedes:["EQA","EQB","EQE","EQS"],Audi:["Q4 e-tron","Q6 e-tron","e-tron GT"],Hyundai:["Ioniq 5","Ioniq 6"],Kia:["EV6","EV9"],BYD:["Dolphin","Seal","Seal U"],Porsche:["Taycan"],Renault:["Megane E-Tech","Renault 5"],Skoda:["Enyaq","Elroq"],Volvo:["EX30","EX40","EX90"],MG:["MG4","ZS EV"],Cupra:["Born","Tavascan"],Ford:["Mustang Mach-E"],NIO:["ET5","ET7"],Fiat:["500e"]};
const CO=[{c:"DE",n:"Germany",f:"🇩🇪"},{c:"FR",n:"France",f:"🇫🇷"},{c:"NL",n:"Netherlands",f:"🇳🇱"},{c:"BE",n:"Belgium",f:"🇧🇪"},{c:"AT",n:"Austria",f:"🇦🇹"},{c:"IT",n:"Italy",f:"🇮🇹"},{c:"ES",n:"Spain",f:"🇪🇸"},{c:"PL",n:"Poland",f:"🇵🇱"},{c:"RO",n:"Romania",f:"🇷🇴"},{c:"SE",n:"Sweden",f:"🇸🇪"},{c:"NO",n:"Norway",f:"🇳🇴"},{c:"CZ",n:"Czech Rep.",f:"🇨🇿"}];
const COLORS=["Black","White","Silver","Gray","Blue","Red","Green","Yellow","Orange","Brown"];
const COLOR_HEX={Black:"#1a1a1a",White:"#f0f0f0",Silver:"#c0c0c0",Gray:"#808080",Blue:"#3b82f6",Red:"#ef4444",Green:"#22c55e",Yellow:"#eab308",Orange:"#f97316",Brown:"#92400e"};

/* ── Helpers ── */
const gf=c=>CO.find(x=>x.c===c)?.f||"";
const cs=t=>({background:t.card,borderRadius:14,border:`1px solid ${t.bd}`,boxShadow:`0 2px 8px ${t.sh}`});
const tg=t=>({fontSize:10,padding:"2px 7px",borderRadius:5,background:t.tg,color:t.tt});
const is=t=>({width:"100%",height:38,borderRadius:9,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 12px",fontSize:12,boxSizing:"border-box"});
const ab=(a,t)=>({border:a?`2px solid ${BC}`:`1px solid ${t.bd}`,background:a?(t.bg==="#131319"?"#2A2530":BL):t.inp,color:a?BC:t.tx,cursor:"pointer",borderRadius:8});
/* ── Sel ── */
function Sel({v,onChange,opts,ph,t}){
  return(
    <div style={{position:"relative"}}>
      <select value={v} onChange={e=>onChange(e.target.value)} style={{...is(t),padding:"0 26px 0 10px",cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
        <option value="">{ph||"Any"}</option>
        {opts.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><CD size={12} color={t.tx3}/></div>
    </div>
  );
}
/* ── Image Slider ── */
function ImgSlider({imgs,height,children,borderRadius=0}){
  const[idx,setIdx]=useState(0);
  const touch=useRef({x:0,t:0});
  const n=imgs?.length||0;
  const go=useCallback(d=>{setIdx(p=>{const nx=p+d;return nx<0?n-1:nx>=n?0:nx})},[n]);
  if(!imgs||n===0) return <div style={{height,background:"#16213e",borderRadius,display:"flex",alignItems:"center",justifyContent:"center"}}><Car size={36} color="#4b5563"/></div>;
  return(
    <div style={{height,position:"relative",overflow:"hidden",borderRadius,background:"#16213e",touchAction:"pan-y"}}
      onTouchStart={e=>{touch.current={x:e.touches[0].clientX,t:Date.now()}}}
      onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touch.current.x;const dt=Date.now()-touch.current.t;if(Math.abs(dx)>30&&dt<400)go(dx<0?1:-1)}}>
      <div style={{display:"flex",width:`${n*100}%`,height:"100%",transform:`translateX(-${idx*(100/n)}%)`,transition:"transform 0.3s ease"}}>
        {imgs.map((src,i)=><img key={i} src={src} alt="" style={{width:`${100/n}%`,height:"100%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>)}
      </div>
      {n>1&&<>
        <button onClick={e=>{e.stopPropagation();go(-1)}} style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={e=>{e.stopPropagation();go(1)}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </>}
      {n>1&&<div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
        {imgs.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i)}} style={{width:i===idx?14:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,0.5)",cursor:"pointer",transition:"all 0.2s"}}/>)}
      </div>}
      {n>1&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:5}}>{idx+1}/{n}</div>}
      {children}
    </div>
  );
}

/* ── Filter Section (reused for sidebar + mobile) ── */
function FilterSection({label,children}){
  return <div style={{marginBottom:16}}><div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</div>{children}</div>;
}

export default function SearchPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const[make,setMake]=useState(sp.get("make")||"");
  const[model,setModel]=useState(sp.get("model")||"");
  const[co,setCo]=useState(sp.get("co")||"");
  const[cond,setCond]=useState("");
  const[dr,setDr]=useState("");
  const[pMin,setPMin]=useState(sp.get("pMin")||"");
  const[pMax,setPMax]=useState(sp.get("pMax")||"");
  const[rMin,setRMin]=useState(sp.get("rMin")||"");
  const[yMin,setYMin]=useState(sp.get("yMin")||"");
  const[yMax,setYMax]=useState("");
  const[batMin,setBatMin]=useState(20);
  const[batMax,setBatMax]=useState(120);
  const[dcMin,setDcMin]=useState("");
  const[color,setColor]=useState("");
  const[sort,setSort]=useState("newest");
  const[showF,setShowF]=useState(false);
  const[favIds,setFavIds]=useState(()=>{try{return JSON.parse(localStorage.getItem("pm_favs")||"[]")}catch{return[]}});
  useEffect(()=>{try{localStorage.setItem("pm_favs",JSON.stringify(favIds))}catch{}},[favIds]);
  const toggleFav=(id)=>setFavIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const[allListings,setAllListings]=useState([]);
  const[dbLoading,setDbLoading]=useState(true);
  const[narrow,setNarrow]=useState(()=>typeof window!=="undefined"?window.innerWidth<768:false);
  useEffect(()=>{const h=()=>setNarrow(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);

  const updateUrl=()=>{
    const p=new URLSearchParams();
    if(make)p.set("make",make);if(model)p.set("model",model);if(co)p.set("co",co);
    if(pMin)p.set("pMin",pMin);if(pMax)p.set("pMax",pMax);if(rMin)p.set("rMin",rMin);if(yMin)p.set("yMin",yMin);
    setSp(p,{replace:true});
  };

  const sellerFilter = sp.get("seller") || "";

  useEffect(()=>{
    (async()=>{
      let query = "status=eq.active&order=created_at.desc";
      if (sellerFilter) query += `&seller_id=eq.${sellerFilter}`;
      const rows=await sbGet("listings",query);
      if(rows.length>0){
        const ids=rows.map(r=>r.id);
        const photos=await sbGet("listing_photos",`listing_id=in.(${ids.join(",")})&order=position.asc`);
        const photoMap={};
        photos.forEach(p=>{if(!photoMap[p.listing_id])photoMap[p.listing_id]=[];photoMap[p.listing_id].push(p.url)});
        const FALLBACK="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=480&h=300&fit=crop";
        setAllListings(rows.map(r=>({
          id:r.id,mk:r.make,md:r.model,vr:r.variant||"",yr:r.year,km:r.mileage_km,pr:r.price_eur,
          bat:r.battery_capacity_kwh||0,rng:r.range_real_km||0,wltp:r.range_wltp_km||0,dc:r.dc_charge_max_kw||0,
          dr:(r.drivetrain||"").toUpperCase(),cn:r.condition==="certified_pre_owned"?"CPO":r.condition==="new"?"New":"Used",
          co:r.country||"",ct:r.city||"",hp:r.state_of_health_pct||100,
          ft:r.is_boosted||false,dy:Math.max(0,Math.round((Date.now()-new Date(r.created_at).getTime())/86400000)),
          imgs:photoMap[r.id]||[FALLBACK],
          sid:r.seller_id,pw:r.power_kw||0,
        })));
      }
      setDbLoading(false);
    })();
  },[sellerFilter]);

  const mods=make?MK[make]||[]:[];
  const filtered=useMemo(()=>{
    let r=(allListings||[]).filter(l=>{
      if(make&&l.mk!==make)return false;if(model&&l.md!==model)return false;
      if(co&&l.co!==co)return false;if(cond&&l.cn!==cond)return false;
      if(dr&&l.dr!==dr)return false;if(pMin&&l.pr<+pMin)return false;
      if(pMax&&l.pr>+pMax)return false;if(rMin&&l.rng<+rMin)return false;
      if(yMin&&l.yr<+yMin)return false;if(yMax&&l.yr>+yMax)return false;
      if(l.bat<batMin||l.bat>batMax)return false;
      if(dcMin&&l.dc<+dcMin)return false;
      return true;
    });
    if(sort==="price_asc")r.sort((a,b)=>a.pr-b.pr);
    else if(sort==="price_desc")r.sort((a,b)=>b.pr-a.pr);
    else if(sort==="range")r.sort((a,b)=>b.rng-a.rng);
    else if(sort==="km")r.sort((a,b)=>a.km-b.km);
    else r.sort((a,b)=>a.dy-b.dy);
    return r;
  },[make,model,co,cond,dr,pMin,pMax,rMin,yMin,yMax,batMin,batMax,dcMin,sort,allListings]);

  const clear=()=>{setMake("");setModel("");setCo("");setCond("");setDr("");setPMin("");setPMax("");setRMin("");setYMin("");setYMax("");setBatMin(20);setBatMax(120);setDcMin("");setColor("")};
  const activeCount=[make,model,co,cond,dr,pMin,pMax,rMin,yMin,yMax,dcMin,color].filter(Boolean).length+(batMin>20||batMax<120?1:0);

  /* ── Listing Card ── */
  function SC({l}){
    const fav=favIds.includes(l.id);
    const dt=l.dy===0?"Just listed":`${l.dy}d ago`;
    const imgH = narrow ? 160 : 200;
    return(
      <div onClick={()=>navigate(`/listing/${l.id}`)} style={{...cs(t),borderRadius:14,padding:0,overflow:"hidden",cursor:"pointer",display:"flex",flexDirection:narrow?"column":"row"}}>
        <div style={{width:narrow?"100%":280,minWidth:narrow?"100%":280,height:imgH,flexShrink:0}}>
          <ImgSlider imgs={l.imgs} height={imgH} borderRadius={0}>
            {l.ft&&<div style={{position:"absolute",top:8,left:8,background:BG,color:"#fff",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5}}>FEATURED</div>}
            <button onClick={e=>{e.stopPropagation();toggleFav(l.id)}} style={{position:"absolute",top:8,right:44,width:30,height:30,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.35)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Hrt size={13} filled={fav} color={fav?"#f43f5e":"#fff"}/></button>
          </ImgSlider>
        </div>
        <div style={{flex:1,padding:narrow?"12px 14px":"16px 20px",display:"flex",flexDirection:"column",gap:5,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:narrow?15:17,fontWeight:700,color:t.tx}}>{l.mk} {l.md}</div>
              <div style={{fontSize:12,color:t.tx2}}>{l.vr} · {l.yr}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:narrow?18:22,fontWeight:800,color:BC}}>€{l.pr.toLocaleString()}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
            {[
              `${l.km.toLocaleString()} km`,
              l.cn,
              `${l.bat} kWh`,
              l.rng?`${l.rng} km range`:null,
              l.wltp?`WLTP ${l.wltp} km`:null,
              `${l.dc} kW DC`,
              l.dr||null,
            ].filter(Boolean).map((v,i)=>(
              <span key={i} style={{...tg(t),fontSize:10,padding:"2px 7px"}}>{v}</span>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"auto",paddingTop:6,fontSize:11,color:t.tx3}}>
            <span style={{display:"flex",alignItems:"center",gap:3}}><Map2 size={11} color={t.tx3}/>{l.ct} {gf(l.co)}</span>
            <span>{dt}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Filters panel content (shared between sidebar + mobile drawer) ── */
  const filtersContent = (
    <div style={{"--tx3":t.tx3}}>
      <FilterSection label="Make & Model">
        <Sel v={make} onChange={v=>{setMake(v);setModel("")}} opts={Object.keys(MK).sort()} ph="Any make" t={t}/>
        <div style={{marginTop:6}}><Sel v={model} onChange={setModel} opts={mods} ph={make?"Any model":"Select make first"} t={t}/></div>
      </FilterSection>

      <FilterSection label="Country">
        <Sel v={co} onChange={setCo} opts={CO.map(c=>({v:c.c,l:`${c.f} ${c.n}`}))} ph="Any country" t={t}/>
      </FilterSection>

      <FilterSection label="Year">
        <div style={{display:"flex",gap:6}}>
          <Sel v={yMin} onChange={setYMin} opts={["2025","2024","2023","2022","2021","2020","2019","2018"]} ph="From" t={t}/>
          <Sel v={yMax} onChange={setYMax} opts={["2025","2024","2023","2022","2021","2020","2019","2018"]} ph="To" t={t}/>
        </div>
      </FilterSection>

      <FilterSection label="Price range">
        <div style={{display:"flex",gap:6}}>
          <div style={{flex:1,position:"relative"}}>
            <input type="number" placeholder="Min" value={pMin} onChange={e=>setPMin(e.target.value)} style={{...is(t),paddingRight:22}}/>
            <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>€</span>
          </div>
          <div style={{flex:1,position:"relative"}}>
            <input type="number" placeholder="Max" value={pMax} onChange={e=>setPMax(e.target.value)} style={{...is(t),paddingRight:22}}/>
            <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>€</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection label="Min range">
        <div style={{position:"relative"}}>
          <input type="number" placeholder="Any" value={rMin} onChange={e=>setRMin(e.target.value)} style={{...is(t),paddingRight:28}}/>
          <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>km</span>
        </div>
      </FilterSection>

      <FilterSection label="Battery capacity">
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:11,fontWeight:600,color:BC,minWidth:38}}>{batMin}</span>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
            <input type="range" min={20} max={120} step={5} value={batMin} onChange={e=>{const v=+e.target.value;if(v<batMax)setBatMin(v)}} style={{width:"100%",accentColor:BC}}/>
            <input type="range" min={20} max={120} step={5} value={batMax} onChange={e=>{const v=+e.target.value;if(v>batMin)setBatMax(v)}} style={{width:"100%",accentColor:BC}}/>
          </div>
          <span style={{fontSize:11,fontWeight:600,color:BC,minWidth:44}}>{batMax} kWh</span>
        </div>
      </FilterSection>

      <FilterSection label="Min DC charging">
        <div style={{position:"relative"}}>
          <input type="number" placeholder="Any" value={dcMin} onChange={e=>setDcMin(e.target.value)} style={{...is(t),paddingRight:28}}/>
          <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>kW</span>
        </div>
      </FilterSection>

      <FilterSection label="Condition">
        <div style={{display:"flex",gap:4}}>
          {["Any","New","Used","CPO"].map(d=>(
            <button key={d} onClick={()=>setCond(d==="Any"?"":d)} style={{flex:1,height:32,borderRadius:7,fontSize:11,fontWeight:(d==="Any"&&!cond)||(cond===d)?600:400,...ab((d==="Any"&&!cond)||(cond===d),t)}}>{d}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Drivetrain">
        <div style={{display:"flex",gap:4}}>
          {["Any","RWD","AWD","FWD"].map(d=>(
            <button key={d} onClick={()=>setDr(d==="Any"?"":d)} style={{flex:1,height:32,borderRadius:7,fontSize:11,fontWeight:(d==="Any"&&!dr)||(dr===d)?600:400,...ab((d==="Any"&&!dr)||(dr===d),t)}}>{d}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Color">
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {COLORS.map(c=>{
            const active=color===c;
            return <button key={c} onClick={()=>setColor(active?"":c)} title={c} style={{width:26,height:26,borderRadius:"50%",background:COLOR_HEX[c],border:active?`3px solid ${BC}`:`2px solid ${t.bd}`,cursor:"pointer",boxShadow:active?`0 0 0 2px ${t.bg}, 0 0 0 4px ${BC}`:"none",transition:"all 0.15s"}}/>;
          })}
        </div>
        {color&&<div style={{fontSize:11,color:BC,fontWeight:500,marginTop:4}}>{color}</div>}
      </FilterSection>

      <div style={{display:"flex",gap:6,marginTop:8}}>
        <button onClick={()=>{updateUrl()}} style={{flex:1,height:38,borderRadius:9,border:"none",background:BG,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          <Srch size={13} color="#fff"/> Search
        </button>
        {activeCount>0&&<button onClick={()=>{clear();updateUrl()}} style={{height:38,padding:"0 14px",borderRadius:9,border:`1px solid ${t.bd}`,background:t.inp,color:"#ef4444",fontSize:11,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
          ✕ Clear
        </button>}
      </div>
    </div>
  );

  /* ── Seller filter banner ── */
  const sellerBanner = sellerFilter ? (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",marginBottom:10,borderRadius:10,background:t.sec,border:`1px solid ${t.bd}`}}>
      <span style={{fontSize:12,color:t.tx2}}>Showing all listings from this seller</span>
      <button onClick={()=>setSp({})} style={{fontSize:11,color:BC,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Clear filter</button>
    </div>
  ) : null;

  /* ── Results header ── */
  const resultsHeader = (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 0 10px"}}>
      <span style={{fontSize:13,color:t.tx2}}><strong style={{color:t.tx}}>{filtered.length}</strong> vehicles</span>
      <div style={{position:"relative"}}>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{height:30,borderRadius:7,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 24px 0 8px",fontSize:11,cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
          <option value="newest">Newest</option><option value="price_asc">Price ↑</option><option value="price_desc">Price ↓</option><option value="range">Range</option><option value="km">Lowest km</option>
        </select>
        <div style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><CD size={10} color={t.tx3}/></div>
      </div>
    </div>
  );

  /* ── Results list ── */
  const resultsList = dbLoading ? (
    <div style={{textAlign:"center",padding:"40px 0"}}><div style={{width:32,height:32,border:`3px solid ${BC}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{fontSize:12,color:t.tx3,marginTop:12}}>Loading listings...</div></div>
  ) : filtered.length===0 ? (
    <div style={{textAlign:"center",padding:"40px 0"}}><Srch size={32} color={t.tx3}/><div style={{fontSize:14,fontWeight:600,color:t.tx2,marginTop:10}}>No matches</div><button onClick={clear} style={{marginTop:12,padding:"7px 16px",borderRadius:8,border:"none",background:BC,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Reset filters</button></div>
  ) : (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>{filtered.map(l=><SC key={l.id} l={l}/>)}</div>
  );

  /* ═══ MOBILE LAYOUT ═══ */
  if (narrow) {
    return (
      <>
        {/* Compact top filters */}
        <div style={{padding:"12px 0 8px",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{flex:"1 1 100px",minWidth:90}}><Sel v={make} onChange={v=>{setMake(v);setModel("")}} opts={Object.keys(MK).sort()} ph="Make" t={t}/></div>
          <div style={{flex:"1 1 100px",minWidth:90}}><Sel v={model} onChange={setModel} opts={mods} ph="Model" t={t}/></div>
          <div style={{flex:"1 1 100px",minWidth:90}}><Sel v={co} onChange={setCo} opts={CO.map(c=>({v:c.c,l:`${c.f} ${c.n}`}))} ph="Country" t={t}/></div>
          <button onClick={()=>setShowF(!showF)} style={{height:38,padding:"0 12px",borderRadius:9,...ab(showF||activeCount>0,t),fontSize:11,fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
            <Flt size={12}/> Filters
            {activeCount>0&&<span style={{minWidth:16,height:16,borderRadius:8,background:BC,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{activeCount}</span>}
          </button>
        </div>

        {/* Expandable filter panel */}
        {showF && (
          <div style={{...cs(t),borderRadius:14,padding:16,marginBottom:12}}>
            {filtersContent}
          </div>
        )}

        {sellerBanner}
        {resultsHeader}
        {resultsList}
      </>
    );
  }

  /* ═══ DESKTOP LAYOUT — sidebar + listings ═══ */
  return (
    <div style={{display:"flex",gap:20,padding:"16px 0 0",alignItems:"flex-start"}}>
      {/* ── LEFT: Filters sidebar ── */}
      <div style={{width:260,minWidth:260,flexShrink:0,position:"sticky",top:76,maxHeight:"calc(100vh - 90px)",overflowY:"auto",paddingRight:8,paddingBottom:20}}>
        <div style={{...cs(t),borderRadius:14,padding:16}}>
          <div style={{fontSize:14,fontWeight:700,color:t.tx,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><Flt size={14} color={BC}/> Filters</div>
          {filtersContent}
        </div>
      </div>

      {/* ── RIGHT: Results ── */}
      <div style={{flex:1,minWidth:0}}>
        {sellerBanner}
        {resultsHeader}
        {resultsList}
      </div>
    </div>
  );
}
