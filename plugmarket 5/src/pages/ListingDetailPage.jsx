import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
async function sbGet(table, params) { try { const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` } }); if (!r.ok) return []; return await r.json(); } catch { return []; } }

const BC = "#FF7500";
const GR = "linear-gradient(135deg,#FF7500,#FF9533)";

function Ic({ d, size, color }) {
  return (
    <svg
      width={size || 16}
      height={size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d}
    </svg>
  );
}

function BoltIcon(p) { return <Ic {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />} />; }
function MapIcon(p) { return <Ic {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>} />; }
function HeartIcon({ filled, ...p }) { return <Ic {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={filled ? (p.color || "currentColor") : "none"} />} />; }
function ShareIcon(p) { return <Ic {...p} d={<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>} />; }
function PhoneIcon(p) { return <Ic {...p} d={<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />} />; }
function ChatIcon(p) { return <Ic {...p} d={<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />} />; }
function ShieldIcon(p) { return <Ic {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />; }
function StarIcon(p) { return <Ic {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={p.fill || "none"} />} />; }
function ChevL(p) { return <Ic {...p} d={<polyline points="15 18 9 12 15 6" />} />; }
function ChevR(p) { return <Ic {...p} d={<polyline points="9 18 15 12 9 6" />} />; }
function ChevUp(p) { return <Ic {...p} d={<polyline points="18 15 12 9 6 15" />} />; }
function BackIcon(p) { return <Ic {...p} d={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />; }
function CalendarIcon(p) { return <Ic {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />; }
function GaugeIcon(p) { return <Ic {...p} d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v2" /><path d="M16.24 7.76l-1.41 1.41" /><path d="M18 12h-2" /><path d="M7.76 7.76l4.17 4.17" /></>} />; }
function BatteryIcon(p) { return <Ic {...p} d={<><rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="10" x2="23" y2="14" /></>} />; }
function SpeedIcon(p) { return <Ic {...p} d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} />; }
function CarIcon(p) { return <Ic {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1" />} />; }
function ZapIcon(p) { return <Ic {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />} />; }
function CheckIcon(p) { return <Ic {...p} d={<polyline points="20 6 9 17 4 12" />} />; }
function MaxIcon(p) { return <Ic {...p} d={<><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>} />; }
function GridIcon(p) { return <Ic {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>} />; }
function XIcon(p) { return <Ic {...p} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />; }
function HomeIcon(p) { return <Ic {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />; }
function SearchIcon(p) { return <Ic {...p} d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />; }
function PlusCircle(p) { return <Ic {...p} d={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>} />; }
function UserIcon(p) { return <Ic {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />; }
function SunIcon(p) { return <Ic {...p} d={<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>} />; }
const MKT_PRICES = [33500, 36200, 41500, 39800, 43200, 46900, 34800, 35900, 40200, 31200, 44100, 38400];

function getMkt(price) {
  var sorted = [...MKT_PRICES].sort(function(a, b) { return a - b; });
  var avg = Math.round(sorted.reduce(function(a, b) { return a + b; }, 0) / sorted.length);
  var lo = sorted[0];
  var hi = sorted[sorted.length - 1];
  var pct = Math.max(0, Math.min(100, ((price - lo) / (hi - lo)) * 100));
  var aboveCount = sorted.filter(function(x) { return x > price; }).length;
  var ratio = aboveCount / sorted.length;
  var good = ratio >= 0.6;
  var bad = ratio <= 0.25;
  return {
    avg: avg, lo: lo, hi: hi, pct: pct, n: sorted.length,
    lbl: good ? "Good price" : bad ? "Above market" : "Average price",
    clr: good ? "#059669" : bad ? "#dc2626" : "#d97706",
  };
}

function HealthRing({ pct, size, dark }) {
  var sz = size || 64;
  var r = sz / 2 - 4;
  var circ = 2 * Math.PI * r;
  var offset = circ - (pct / 100) * circ;
  var c = pct >= 97 ? "#10b981" : pct >= 93 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: sz, height: sz }}>
      <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(128,128,128,0.1)"} strokeWidth={3} />
        <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={c} strokeWidth={3} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: c }}>{pct}%</div>
    </div>
  );
}

function DetailRow({ label, value, icon, t }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + t.dv }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: t.tx2, fontSize: 13 }}>{icon}{label}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: t.tx }}>{value}</span>
    </div>
  );
}

export default function ListingDetailPage() {
  const { t, dark } = useOutletContext();
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [fav, setFav] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [tab, setTab] = useState("overview");
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isDesk = winW >= 860;

  useEffect(() => { const h = () => setWinW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);

  useEffect(() => {
    (async () => {
      const rows = await sbGet("listings", `id=eq.${id}&select=*`);
      if (rows.length > 0) {
        const r = rows[0];
        setCar({
          make: r.make, model: r.model, variant: r.variant || "", year: r.year,
          price: r.price_eur, km: r.mileage_km, power_kw: r.power_kw || 0,
          battery_kwh: r.battery_capacity_kwh || 0, usable_kwh: r.usable_capacity_kwh || 0,
          soh: r.state_of_health_pct || 100,
          range_real: r.range_real_km || 0, range_winter: r.range_winter_km || 0,
          dc_charge: r.dc_charge_max_kw || 0, ac_charge: r.ac_charge_kw || 0,
          port: r.charge_port || "—", drivetrain: (r.drivetrain || "").toUpperCase(),
          color_ext: r.exterior_color || "—", color_int: r.interior_color || "—",
          vin: r.vin || "—", reg_date: r.first_registration || "—",
          prev_owners: r.previous_owners || 0, service: r.service_history || "—",
          accident_free: r.accident_free !== false, condition: r.condition || "used",
          vat: r.vat_deductible || false, negotiable: r.negotiable !== false,
          city: r.city || "—", country: r.country || "—",
          description: r.description || "",
          contact_name: r.contact_name || "Seller", contact_phone: r.contact_phone || "",
          contact_email: r.contact_email || "", seller_type: r.seller_type || "private",
          maps_url: `https://www.google.com/maps/place/${encodeURIComponent((r.city||"")+" "+(r.country||""))}`,
        });
        const p = await sbGet("listing_photos", `listing_id=eq.${id}&order=position.asc`);
        setPhotos(p.map(x => x.url));
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div style={{textAlign:"center",padding:"80px 0",color:t.tx3}}>Loading listing...</div>;
  if (!car) return <div style={{textAlign:"center",padding:"80px 0",color:t.tx3}}>Listing not found</div>;

  const mktData = getMkt(car.price);
  const cardStyle = { background: t.card, borderRadius: 16, boxShadow: `0 2px 8px ${t.sh}`, border: `1px solid ${t.bd}` };
  const allPhotos = photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop"];

  return (
    <>
      {/* Photo gallery */}
      <div style={{position:"relative",borderRadius:16,overflow:"hidden",marginBottom:20}}>
        <img src={allPhotos[photoIdx]} alt="" style={{width:"100%",height:isDesk?420:260,objectFit:"cover",display:"block"}} onError={e=>{e.target.src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop"}}/>
        {allPhotos.length>1&&<>
          <button onClick={()=>setPhotoIdx(p=>p>0?p-1:allPhotos.length-1)} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:36,height:36,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",fontSize:18}}>‹</button>
          <button onClick={()=>setPhotoIdx(p=>p<allPhotos.length-1?p+1:0)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:36,height:36,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",fontSize:18}}>›</button>
          <div style={{position:"absolute",bottom:10,right:14,background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6}}>{photoIdx+1}/{allPhotos.length}</div>
        </>}
      </div>
      {allPhotos.length>1&&<div style={{display:"flex",gap:6,marginBottom:20,overflowX:"auto"}}>{allPhotos.map((p,i)=><img key={i} src={p} onClick={()=>setPhotoIdx(i)} style={{width:64,height:44,objectFit:"cover",borderRadius:8,cursor:"pointer",border:i===photoIdx?`2px solid ${BC}`:"2px solid transparent",opacity:i===photoIdx?1:0.6}} alt=""/>)}</div>}

      <h1 style={{fontSize:isDesk?26:22,fontWeight:800,margin:"0 0 4px"}}>{car.year} {car.make} {car.model} {car.variant}</h1>
      <div style={{fontSize:13,color:t.tx2,marginBottom:16}}>{car.km.toLocaleString()} km · {car.condition} · {car.city}, {car.country}</div>

      <div style={{display:isDesk?"flex":"block",gap:20}}>
        <div style={{flex:1}}>
          <div style={{...cardStyle,padding:20,marginBottom:16}}>
            <div style={{fontSize:28,fontWeight:800}}>€{car.price.toLocaleString()}</div>
            {car.negotiable&&<span style={{fontSize:11,color:BC,fontWeight:500}}>Negotiable</span>}
            {car.vat&&<span style={{fontSize:11,color:"#10b981",fontWeight:500,marginLeft:8}}>VAT deductible</span>}
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600,color:mktData.clr}}>{mktData.lbl}</span><span style={{fontSize:11,color:t.tx3}}>Avg. €{mktData.avg.toLocaleString()}</span></div>
              <div style={{position:"relative",height:8,borderRadius:4,background:"linear-gradient(90deg,#10b981 0%,#10b981 30%,#f59e0b 45%,#f59e0b 55%,#ef4444 70%,#ef4444 100%)"}}><div style={{position:"absolute",top:-3,left:`${mktData.pct}%`,transform:"translateX(-50%)",width:14,height:14,borderRadius:"50%",background:t.card,border:`3px solid ${mktData.clr}`,boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div>
            </div>
          </div>

          <div style={{...cardStyle,padding:20,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:700}}>EV Specs</span>
              <HealthRing pct={car.soh} size={52} dark={dark}/>
            </div>
            {[["Battery",`${car.battery_kwh} kWh (${car.usable_kwh} usable)`],["Range (summer)",`${car.range_real} km`],["Range (winter)",`${car.range_winter} km`],["DC fast charge",`${car.dc_charge} kW`],["AC charge",`${car.ac_charge} kW`],["Charge port",car.port],["Drivetrain",car.drivetrain],["Power",car.power_kw?`${car.power_kw} kW`:"—"]].map(([l,v],i)=><DetailRow key={i} label={l} value={v} t={t}/>)}
          </div>

          <div style={{...cardStyle,padding:20,marginBottom:16}}>
            <span style={{fontSize:15,fontWeight:700,display:"block",marginBottom:14}}>Vehicle Details</span>
            {[["Exterior",car.color_ext],["Interior",car.color_int],["Registration",car.reg_date],["VIN",car.vin],["Previous owners",car.prev_owners],["Service history",car.service],["Accident free",car.accident_free?"Yes":"No"],["Condition",car.condition]].map(([l,v],i)=><DetailRow key={i} label={l} value={String(v)} t={t}/>)}
          </div>

          {car.description&&<div style={{...cardStyle,padding:20,marginBottom:16}}>
            <span style={{fontSize:15,fontWeight:700,display:"block",marginBottom:10}}>Description</span>
            <p style={{fontSize:13,color:t.tx2,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{car.description}</p>
          </div>}
        </div>

        <div style={{width:isDesk?320:"auto",flexShrink:0}}>
          <div style={{...cardStyle,padding:20,marginBottom:16,...(isDesk?{position:"sticky",top:70}:{})}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,117,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:BC}}>{(car.contact_name||"S").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
              <div><div style={{fontSize:14,fontWeight:600}}>{car.contact_name}</div><div style={{fontSize:11,color:t.tx3}}>{car.seller_type==="dealer"?"Dealer":"Private seller"} · {car.city}</div></div>
            </div>
            <button style={{width:"100%",height:44,borderRadius:12,border:"none",background:GR,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:8}}>Message seller</button>
            <button onClick={()=>setShowPhone(!showPhone)} style={{width:"100%",height:42,borderRadius:12,border:`1px solid ${t.bd}`,background:t.card,color:t.tx,fontSize:13,cursor:"pointer"}}>{showPhone&&car.contact_phone?car.contact_phone:"Show phone number"}</button>
          </div>

          <div style={{...cardStyle,padding:20}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Location</div>
            <a href={car.maps_url} target="_blank" rel="noopener noreferrer" style={{display:"block",background:t.sec,borderRadius:10,height:100,marginBottom:10,textDecoration:"none"}}>
              <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}><MapIcon size={24} color={BC}/><span style={{fontSize:11,fontWeight:500,color:BC}}>Open in Google Maps</span></div>
            </a>
            <div style={{fontSize:13,fontWeight:500}}>{car.city}, {car.country}</div>
          </div>
        </div>
      </div>
    </>
  );
}
