import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";

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

const BC="#FF7500";
const BG="linear-gradient(135deg,#FF7500,#FF9533)";
const BL="#FFF3EB";
const BD="#4D2300";

const MK={Tesla:["Model 3","Model Y","Model S","Model X"],BMW:["iX3","iX1","i4","i5","i7","iX"],Volkswagen:["ID.3","ID.4","ID.5","ID.7"],Mercedes:["EQA","EQB","EQE","EQS"],Audi:["Q4 e-tron","Q6 e-tron","e-tron GT"],Hyundai:["Ioniq 5","Ioniq 6"],Kia:["EV6","EV9"],BYD:["Dolphin","Seal","Seal U"],Porsche:["Taycan"],Renault:["Megane E-Tech","Renault 5"],Skoda:["Enyaq","Elroq"],Volvo:["EX30","EX40","EX90"],MG:["MG4","ZS EV"],Cupra:["Born","Tavascan"],Ford:["Mustang Mach-E"],NIO:["ET5","ET7"],Fiat:["500e"]};
const CO=[{c:"DE",n:"Germany",f:"🇩🇪"},{c:"FR",n:"France",f:"🇫🇷"},{c:"NL",n:"Netherlands",f:"🇳🇱"},{c:"BE",n:"Belgium",f:"🇧🇪"},{c:"AT",n:"Austria",f:"🇦🇹"},{c:"IT",n:"Italy",f:"🇮🇹"},{c:"ES",n:"Spain",f:"🇪🇸"},{c:"PL",n:"Poland",f:"🇵🇱"},{c:"RO",n:"Romania",f:"🇷🇴"},{c:"SE",n:"Sweden",f:"🇸🇪"},{c:"NO",n:"Norway",f:"🇳🇴"},{c:"CZ",n:"Czech Rep.",f:"🇨🇿"}];
/* ── Extra photo pool (simulates multi-photo listings) ── */
const XP=[
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=480&h=300&fit=crop",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=480&h=300&fit=crop",
];
const mkImgs=(main,id)=>[main,XP[(id*3)%XP.length],XP[(id*3+1)%XP.length],XP[(id*3+2)%XP.length]];

const PRO=[
  {id:1,mk:"Tesla",md:"Model Y",vr:"Long Range AWD",yr:2025,km:2100,pr:52900,rng:533,dc:250,ct:"Munich",co:"DE",imgs:mkImgs("https://images.unsplash.com/photo-1619317190803-58529786b291?w=400&h=260&fit=crop",1),bg:"Sponsored"},
  {id:2,mk:"Porsche",md:"Taycan",vr:"4S",yr:2024,km:12400,pr:79900,rng:464,dc:270,ct:"Stuttgart",co:"DE",imgs:mkImgs("https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=400&h=260&fit=crop",2),bg:"Premium"},
  {id:3,mk:"BMW",md:"iX",vr:"xDrive50",yr:2024,km:8900,pr:68500,rng:630,dc:195,ct:"Amsterdam",co:"NL",imgs:mkImgs("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=260&fit=crop",3),bg:"Sponsored"},
  {id:4,mk:"Hyundai",md:"Ioniq 5",vr:"AWD 77kWh",yr:2025,km:800,pr:48200,rng:507,dc:350,ct:"Brussels",co:"BE",imgs:mkImgs("https://images.unsplash.com/photo-1675255998683-a2247c4de89c?w=400&h=260&fit=crop",4),bg:"Top Deal"},
];
const REC=[
  {id:5,mk:"Skoda",md:"Elroq",vr:"85",yr:2025,km:3200,pr:37500,rng:560,dc:175,ct:"Prague",co:"CZ",imgs:mkImgs("https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=260&fit=crop",5)},
  {id:6,mk:"Renault",md:"Renault 5",vr:"Iconic",yr:2025,km:1200,pr:27990,rng:400,dc:100,ct:"Lyon",co:"FR",imgs:mkImgs("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=260&fit=crop",6)},
  {id:7,mk:"Volvo",md:"EX30",vr:"Extended",yr:2025,km:4500,pr:36200,rng:476,dc:153,ct:"Gothenburg",co:"SE",imgs:mkImgs("https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400&h=260&fit=crop",7)},
  {id:8,mk:"Cupra",md:"Born",vr:"V3 77kWh",yr:2024,km:11000,pr:34800,rng:548,dc:185,ct:"Barcelona",co:"ES",imgs:mkImgs("https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=400&h=260&fit=crop",8)},
  {id:9,mk:"Mercedes",md:"EQA",vr:"250+",yr:2024,km:21000,pr:39800,rng:528,dc:100,ct:"Vienna",co:"AT",imgs:mkImgs("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=260&fit=crop",9)},
];
const SLS=[
  {id:1,mk:"Tesla",md:"Model 3",vr:"Long Range",yr:2024,km:18500,pr:38900,bat:75,rng:602,dc:250,dr:"RWD",cn:"Used",co:"DE",ct:"Munich",hp:97,ft:true,dy:2,imgs:mkImgs("https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=480&h=300&fit=crop",1)},
  {id:2,mk:"BMW",md:"iX3",vr:"Inspiring",yr:2023,km:32000,pr:41500,bat:80,rng:461,dc:150,dr:"RWD",cn:"Used",co:"DE",ct:"Berlin",hp:95,ft:false,dy:5,imgs:mkImgs("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=480&h=300&fit=crop",2)},
  {id:3,mk:"Volkswagen",md:"ID.4",vr:"Pro",yr:2025,km:5200,pr:43900,bat:77,rng:520,dc:175,dr:"RWD",cn:"Certified",co:"NL",ct:"Amsterdam",hp:99,ft:true,dy:1,imgs:mkImgs("https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=480&h=300&fit=crop",3)},
  {id:4,mk:"Hyundai",md:"Ioniq 5",vr:"AWD LR",yr:2024,km:12000,pr:46200,bat:77,rng:507,dc:350,dr:"AWD",cn:"Used",co:"BE",ct:"Brussels",hp:98,ft:false,dy:3,imgs:mkImgs("https://images.unsplash.com/photo-1675255998683-a2247c4de89c?w=480&h=300&fit=crop",4)},
  {id:5,mk:"BYD",md:"Seal",vr:"Design AWD",yr:2025,km:800,pr:44990,bat:82,rng:520,dc:150,dr:"AWD",cn:"New",co:"FR",ct:"Paris",hp:100,ft:true,dy:0,imgs:mkImgs("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=480&h=300&fit=crop",5)},
  {id:6,mk:"Porsche",md:"Taycan",vr:"4S",yr:2023,km:35000,pr:72500,bat:93,rng:464,dc:270,dr:"AWD",cn:"Used",co:"DE",ct:"Stuttgart",hp:93,ft:false,dy:14,imgs:mkImgs("https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=480&h=300&fit=crop",6)},
  {id:7,mk:"Renault",md:"Renault 5",vr:"Iconic",yr:2025,km:1200,pr:27990,bat:52,rng:400,dc:100,dr:"FWD",cn:"New",co:"FR",ct:"Lyon",hp:100,ft:true,dy:1,imgs:mkImgs("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=480&h=300&fit=crop",7)},
  {id:8,mk:"Tesla",md:"Model Y",vr:"Performance",yr:2024,km:8200,pr:52900,bat:75,rng:514,dc:250,dr:"AWD",cn:"Used",co:"DE",ct:"Hamburg",hp:99,ft:true,dy:1,imgs:mkImgs("https://images.unsplash.com/photo-1619317190803-58529786b291?w=480&h=300&fit=crop",8)},
  {id:9,mk:"Volvo",md:"EX30",vr:"Extended",yr:2025,km:4500,pr:36200,bat:69,rng:476,dc:153,dr:"RWD",cn:"New",co:"SE",ct:"Gothenburg",hp:100,ft:true,dy:2,imgs:mkImgs("https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=480&h=300&fit=crop",9)},
];
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

export default function SearchPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const[make,setMake]=useState(sp.get("make")||"");
  const[model,setModel]=useState(sp.get("model")||"");
  const[co,setCo]=useState(sp.get("co")||"");
  const[cond,setCond]=useState("");
  const[dr,setDr]=useState("");
  const[pMin,setPMin]=useState(sp.get("pMin")||"");
  const[pMax,setPMax]=useState(sp.get("pMax")||"");
  const[rMin,setRMin]=useState(sp.get("rMin")||"");
  const[batMin,setBatMin]=useState(20);
  const[batMax,setBatMax]=useState(120);
  const[color,setColor]=useState("");
  const[doors,setDoors]=useState("");
  const[sort,setSort]=useState("newest");
  const[showF,setShowF]=useState(false);
  const[favIds,setFavIds]=useState([]);
  const toggleFav=(id)=>setFavIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const allListings=SLS;
  const mods=make?MK[make]||[]:[];
  const COLORS=["Black","White","Silver","Gray","Blue","Red","Green","Yellow","Orange","Brown"];
  const filtered=useMemo(()=>{
    let r=(allListings||SLS).filter(l=>{
      if(make&&l.mk!==make)return false;if(model&&l.md!==model)return false;
      if(co&&l.co!==co)return false;if(cond&&l.cn!==cond)return false;
      if(dr&&l.dr!==dr)return false;if(pMin&&l.pr<+pMin)return false;
      if(pMax&&l.pr>+pMax)return false;if(rMin&&l.rng<+rMin)return false;
      if(l.bat<batMin||l.bat>batMax)return false;
      return true;
    });
    if(sort==="price_asc")r.sort((a,b)=>a.pr-b.pr);
    else if(sort==="price_desc")r.sort((a,b)=>b.pr-a.pr);
    else if(sort==="range")r.sort((a,b)=>b.rng-a.rng);
    else r.sort((a,b)=>a.dy-b.dy);
    return r;
  },[make,model,co,cond,dr,pMin,pMax,rMin,batMin,batMax,sort,allListings]);
  const clear=()=>{setMake("");setModel("");setCo("");setCond("");setDr("");setPMin("");setPMax("");setRMin("");setBatMin(20);setBatMax(120);setColor("");setDoors("")};
  const activeCount=[make,model,co,cond,dr,pMin,pMax,rMin,color,doors].filter(Boolean).length+(batMin>20||batMax<120?1:0);

  function SC({l}){
    const fav=favIds.includes(l.id);
    const dt=l.dy===0?"Just listed":`${l.dy}d ago`;
    return(
      <div style={{...cs(t),borderRadius:14,padding:12,display:"flex",gap:12}}>
        <div style={{width:160,minWidth:160,height:140,borderRadius:10,overflow:"hidden",flexShrink:0}}>
          <ImgSlider imgs={l.imgs} height={140} borderRadius={10}>
            {l.ft&&<div style={{position:"absolute",top:6,left:6,background:BG,color:"#fff",fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:4}}>FEATURED</div>}
            <button onClick={e=>{e.stopPropagation();toggleFav(l.id)}} style={{position:"absolute",top:6,right:6,width:26,height:26,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.35)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Hrt size={12} filled={fav} color={fav?"#f43f5e":"#fff"}/></button>
          </ImgSlider>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,minWidth:0,overflow:"hidden"}}>
          <div style={{fontSize:16,fontWeight:700,color:t.tx}}>{l.mk} {l.md}</div>
          <div style={{fontSize:12,color:t.tx2}}>{l.vr} · {l.yr}</div>
          <div style={{fontSize:20,fontWeight:800,color:BC}}>€{l.pr.toLocaleString()}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
            {[`${l.km.toLocaleString()} km`,l.cn,`${l.bat} kWh`,`${l.rng} km range`,`${l.dc} kW`,l.dr].map((v,i)=>(
              <span key={i} style={{...tg(t),fontSize:11,padding:"2px 8px"}}>{v}</span>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"auto",fontSize:11,color:t.tx3}}>
            <span style={{display:"flex",alignItems:"center",gap:2}}><Map2 size={10} color={t.tx3}/>{l.ct} {gf(l.co)}</span>
            <span>{dt}</span>
          </div>
        </div>
      </div>
    );
  }

  return(
    <>
      {/* Top row: make, model, country */}
      <div style={{padding:"14px 0 10px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
        {[{l:"Make",v:make,s:v=>{setMake(v);setModel("")},o:Object.keys(MK).sort()},{l:"Model",v:model,s:setModel,o:mods,ph:"Any"},{l:"Country",v:co,s:setCo,o:CO.map(c=>({v:c.c,l:`${c.f} ${c.n}`}))}].map((f,i)=>(
          <div key={i} style={{flex:"1 1 130px",minWidth:110}}>
            <div style={{fontSize:10,fontWeight:600,color:t.tx3,marginBottom:3}}>{f.l}</div>
            <Sel v={f.v} onChange={f.s} opts={f.o} ph={f.ph} t={t}/>
          </div>
        ))}
        <button onClick={()=>setShowF(!showF)} style={{height:42,padding:"0 14px",borderRadius:10,...ab(showF,t),fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
          <Flt size={13}/>{showF?"Less":"More"}
          {activeCount>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:BC,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{activeCount}</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showF&&(
        <div style={{...cs(t),borderRadius:14,padding:16,marginBottom:14}}>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>

            {/* Price */}
            <div style={{flex:"1 1 200px",minWidth:180}}>
              <div style={{fontSize:12,fontWeight:600,color:t.tx,marginBottom:8}}>Price range</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,position:"relative"}}>
                  <input type="number" placeholder="From" value={pMin} onChange={e=>setPMin(e.target.value)} style={{...is(t),height:36,fontSize:12,paddingRight:24}}/>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>€</span>
                </div>
                <span style={{color:t.tx3,alignSelf:"center",fontSize:12}}>–</span>
                <div style={{flex:1,position:"relative"}}>
                  <input type="number" placeholder="To" value={pMax} onChange={e=>setPMax(e.target.value)} style={{...is(t),height:36,fontSize:12,paddingRight:24}}/>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>€</span>
                </div>
              </div>
            </div>

            {/* Battery slider */}
            <div style={{flex:"1 1 200px",minWidth:180}}>
              <div style={{fontSize:12,fontWeight:600,color:t.tx,marginBottom:8}}>Battery capacity</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,fontWeight:600,color:BC,minWidth:40}}>{batMin} kWh</span>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                  <input type="range" min={20} max={120} step={5} value={batMin} onChange={e=>{const v=+e.target.value;if(v<batMax)setBatMin(v)}} style={{width:"100%",accentColor:BC}}/>
                  <input type="range" min={20} max={120} step={5} value={batMax} onChange={e=>{const v=+e.target.value;if(v>batMin)setBatMax(v)}} style={{width:"100%",accentColor:BC}}/>
                </div>
                <span style={{fontSize:12,fontWeight:600,color:BC,minWidth:46}}>{batMax} kWh</span>
              </div>
            </div>

            {/* Color */}
            <div style={{flex:"1 1 160px",minWidth:140}}>
              <div style={{fontSize:12,fontWeight:600,color:t.tx,marginBottom:8}}>Color</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {COLORS.map(c=>{
                  const hex={Black:"#1a1a1a",White:"#f0f0f0",Silver:"#c0c0c0",Gray:"#808080",Blue:"#3b82f6",Red:"#ef4444",Green:"#22c55e",Yellow:"#eab308",Orange:"#f97316",Brown:"#92400e"}[c];
                  const active=color===c;
                  return(
                    <button key={c} onClick={()=>setColor(active?"":c)} title={c} style={{width:28,height:28,borderRadius:"50%",background:hex,border:active?`3px solid ${BC}`:`2px solid ${t.bd}`,cursor:"pointer",boxShadow:active?`0 0 0 2px ${t.bg}, 0 0 0 4px ${BC}`:"none",transition:"all 0.15s"}}/>
                  );
                })}
              </div>
              {color&&<div style={{fontSize:11,color:BC,fontWeight:500,marginTop:4}}>{color}</div>}
            </div>

            {/* Doors + Drivetrain + Condition */}
            <div style={{flex:"1 1 160px",minWidth:140}}>
              <div style={{fontSize:12,fontWeight:600,color:t.tx,marginBottom:8}}>More filters</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div>
                  <div style={{fontSize:10,fontWeight:600,color:t.tx3,marginBottom:3}}>Doors</div>
                  <div style={{display:"flex",gap:4}}>
                    {["Any","3","4","5"].map(d=>(
                      <button key={d} onClick={()=>setDoors(d==="Any"?"":d)} style={{flex:1,height:30,borderRadius:6,...ab((d==="Any"&&!doors)||(doors===d),t),fontSize:11,fontWeight:(d==="Any"&&!doors)||(doors===d)?600:400}}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:600,color:t.tx3,marginBottom:3}}>Drivetrain</div>
                  <div style={{display:"flex",gap:4}}>
                    {["Any","RWD","AWD","FWD"].map(d=>(
                      <button key={d} onClick={()=>setDr(d==="Any"?"":d)} style={{flex:1,height:30,borderRadius:6,...ab((d==="Any"&&!dr)||(dr===d),t),fontSize:11,fontWeight:(d==="Any"&&!dr)||(dr===d)?600:400}}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:600,color:t.tx3,marginBottom:3}}>Condition</div>
                  <div style={{display:"flex",gap:4}}>
                    {["Any","New","Used"].map(d=>(
                      <button key={d} onClick={()=>setCond(d==="Any"?"":d)} style={{flex:1,height:30,borderRadius:6,...ab((d==="Any"&&!cond)||(cond===d),t),fontSize:11,fontWeight:(d==="Any"&&!cond)||(cond===d)?600:400}}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Min range + clear */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:`1px solid ${t.bd}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Bolt size={13} color={BC}/>
              <span style={{fontSize:11,fontWeight:600,color:t.tx2}}>Min range</span>
              <div style={{position:"relative",width:120}}>
                <input type="number" placeholder="Any" value={rMin} onChange={e=>setRMin(e.target.value)} style={{...is(t),height:32,fontSize:11,paddingRight:28}}/>
                <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.tx3}}>km</span>
              </div>
            </div>
            {activeCount>0&&<button onClick={clear} style={{padding:"6px 14px",borderRadius:8,border:"none",background:t.tg,color:BC,fontSize:11,fontWeight:600,cursor:"pointer"}}>Clear all filters</button>}
          </div>
        </div>
      )}

      {/* Results header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0 12px"}}>
        <span style={{fontSize:13,color:t.tx2}}><strong style={{color:t.tx}}>{filtered.length}</strong> vehicles</span>
        <div style={{position:"relative"}}>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{height:30,borderRadius:7,border:`1px solid ${t.bd}`,background:t.inp,color:t.tx,padding:"0 22px 0 8px",fontSize:11,cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
            <option value="newest">Newest</option><option value="price_asc">Price ↑</option><option value="price_desc">Price ↓</option><option value="range">Range</option>
          </select>
          <div style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><CD size={10} color={t.tx3}/></div>
        </div>
      </div>

      {/* Results */}
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"40px 0"}}><Srch size={32} color={t.tx3}/><div style={{fontSize:14,fontWeight:600,color:t.tx2,marginTop:10}}>No matches</div><button onClick={clear} style={{marginTop:12,padding:"7px 16px",borderRadius:8,border:"none",background:BC,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Reset</button></div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{filtered.map(l=><SC key={l.id} l={l}/>)}</div>
      )}
    </>
  );
}
