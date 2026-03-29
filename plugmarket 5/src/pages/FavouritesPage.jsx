import { useState, useRef, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

/* ── Supabase REST client (no SDK needed) ── */
const SB_URL = "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";

const sb = {
  headers: (token) => ({
    "apikey": SB_KEY,
    "Authorization": `Bearer ${token || SB_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  }),
  async query(table, params = "", token) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: this.headers(token) });
      if (!r.ok) return [];
      return await r.json();
    } catch { return []; }
  },
  async insert(table, data, token) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: "POST", headers: this.headers(token), body: JSON.stringify(data),
      });
      if (!r.ok) return null;
      const res = await r.json();
      return res?.[0] || res;
    } catch { return null; }
  },
  async update(table, match, data, token) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, {
        method: "PATCH", headers: this.headers(token), body: JSON.stringify(data),
      });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },
  async remove(table, match, token) {
    try {
      await fetch(`${SB_URL}/rest/v1/${table}?${match}`, {
        method: "DELETE", headers: this.headers(token),
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
function FavCard({l,toggleFav,t,onPress}){
  return(
    <div onClick={()=>onPress&&onPress(l.id)} style={{...cs(t),borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
      <ImgSlider imgs={l.imgs} height={160}>
        <button onClick={e=>{e.stopPropagation();toggleFav(l.id)}} style={{position:"absolute",top:8,right:8,width:32,height:32,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.35)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Hrt size={14} filled color="#f43f5e"/></button>
      </ImgSlider>
      <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:4}}>
        <div style={{fontSize:14,fontWeight:600,color:t.tx}}>{l.mk} {l.md}</div>
        <div style={{fontSize:11,color:t.tx2}}>{l.vr} · {l.yr}</div>
        <div style={{fontSize:18,fontWeight:700,color:t.tx,marginTop:2}}>€{l.pr.toLocaleString()}</div>
        <div style={{display:"flex",gap:5}}>{[`${l.rng}km`,`${l.dc}kW`].map((v,i)=><span key={i} style={tg(t)}>{v}</span>)}</div>
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:`1px solid ${t.bd}`,fontSize:11,color:t.tx3}}>
          <span>{l.ct} {gf(l.co)}</span><span>{l.km.toLocaleString()}km</span>
        </div>
      </div>
    </div>
  );
}

export default function FavouritesPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [favIds, setFavIds] = useState(()=>{try{return JSON.parse(localStorage.getItem("pm_favs")||"[]")}catch{return[]}});
  useEffect(()=>{try{localStorage.setItem("pm_favs",JSON.stringify(favIds))}catch{}},[favIds]);
  const auth = useAuth();

  useEffect(() => {
    if (!auth.token) return;
    (async () => {
      const favs = await sb.query("favourites", `user_id=eq.${auth.user?.id}&select=listing_id`, auth.token);
      if (favs.length > 0) setFavIds(favs.map(f => f.listing_id));
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

  const all=[...PRO,...REC,...SLS];
  const seen=new Set();
  const deduped=all.filter(l=>{if(seen.has(l.id))return false;seen.add(l.id);return true;});
  const favs=deduped.filter(l=>favIds.includes(l.id));

  return(
    <>
      <div style={{padding:"20px 0 10px",display:"flex",alignItems:"center",gap:8}}>
        <Hrt size={20} filled color="#f43f5e"/>
        <h2 style={{fontSize:20,fontWeight:700,margin:0}}>Favourites</h2>
        {favIds.length>0&&<span style={{minWidth:22,height:22,borderRadius:11,background:"#f43f5e",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{favIds.length}</span>}
      </div>
      {favs.length===0?(
        <div style={{textAlign:"center",padding:"50px 0"}}>
          <Hrt size={40} color={t.tx3}/>
          <div style={{fontSize:15,fontWeight:600,color:t.tx2,marginTop:12}}>No favourites yet</div>
          <p style={{fontSize:12,color:t.tx3}}>Tap the heart icon on any vehicle to save it here.</p>
          <button onClick={()=>navigate("/search")} style={{marginTop:16,padding:"8px 18px",borderRadius:10,border:"none",background:BC,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Browse vehicles</button>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14,padding:"8px 0"}}>
          {favs.map(l=><FavCard key={l.id} l={l} toggleFav={toggleFav} t={t} onPress={(id)=>navigate(`/listing/${id}`)}/>)}
        </div>
      )}
    </>
  );
}
