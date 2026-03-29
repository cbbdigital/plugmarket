import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";

// ── Supabase REST ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
async function sbGet(table, params) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
    });
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

// ── Brand ──
const BC = "#FF7500";
const GR = "linear-gradient(135deg,#FF7500,#FF9533)";

// ── Icons ──
const Ic = ({d,size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const BoltIcon = (p) => <Ic {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
const BatteryIcon = (p) => <Ic {...p} d={<><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></>}/>;
const MapIcon = (p) => <Ic {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}/>;
const ChevL = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6"/>}/>;
const ChevR = (p) => <Ic {...p} d={<polyline points="9 18 15 12 9 6"/>}/>;
const HeartIcon = ({size=16,color="currentColor",filled}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?color:"none"} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
);
const ShareIcon = (p) => <Ic {...p} d={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>}/>;
const CarIcon = (p) => <Ic {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const SpeedIcon = (p) => <Ic {...p} d={<><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></>}/>;
const MailIcon = (p) => <Ic {...p} d={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></>}/>;
const PhoneIcon = (p) => <Ic {...p} d={<><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.35 1.9.66 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.31 1.85.54 2.81.66A2 2 0 0122 16.92z"/></>}/>;
const UserIcon = (p) => <Ic {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const CheckIcon = (p) => <Ic {...p} d={<polyline points="20 6 9 17 4 12"/>}/>;
const MaxIcon = (p) => <Ic {...p} d={<><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>}/>;
const InfoIcon = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>}/>;

// ── Health Ring ──
function HealthRing({ pct, size = 72, d }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const c = pct >= 90 ? "#10b981" : pct >= 80 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={d?"rgba(255,255,255,0.08)":"rgba(128,128,128,0.1)"} strokeWidth={3}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={3} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:c }}>{pct}%</div>
    </div>
  );
}

// ── Detail Row ──
function DetailRow({ label, value, icon, t }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${t.divider||"rgba(128,128,128,0.08)"}` }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,color:t.tx2,fontSize:13 }}>{icon}{label}</div>
      <span style={{ fontSize:13,fontWeight:600,color:t.tx }}>{value}</span>
    </div>
  );
}

// ── Card Style ──
function cs(t) {
  return {
    background: t.card,
    borderRadius: 16,
    boxShadow: t.d ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
    border: `1px solid ${t.d ? "rgba(255,255,255,0.06)" : "rgba(128,128,128,0.08)"}`,
  };
}

// ── Price Analysis ──
function fmtCond(c) {
  if (!c) return "";
  const m = { new: "New", used: "Used", certified_pre_owned: "Certified Pre-Owned" };
  return m[c] || c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}
function getMkt(make, price) {
  const avgs = { Tesla:44900, BMW:52800, Volkswagen:38200, Mercedes:56700, Audi:51200, Hyundai:41500, Kia:39800, BYD:33200, Porsche:89500, Renault:34100, Skoda:37600, Volvo:46300, MG:29800, Polestar:47200, Cupra:39100, Ford:44800, NIO:46500, Fiat:28900 };
  const avg = avgs[make] || 42200;
  const low = avg * 0.75, high = avg * 1.25, range = high - low;
  const pct = Math.max(0, Math.min(100, ((price - low) / range) * 100));
  const label = pct < 35 ? "Great price" : pct > 65 ? "Above average" : "Fair price";
  const color = pct < 35 ? "#10b981" : pct > 65 ? "#ef4444" : "#f59e0b";
  return { avg, low, high, pct, label, color };
}

export default function ListingDetailPage() {
  const { t, dark } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [fav, setFav] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [tab, setTab] = useState("overview");
  const [fullscreen, setFullscreen] = useState(false);
  const [galleryMode, setGalleryMode] = useState("single");
  const [copied, setCopied] = useState(false);
  const [imgErr, setImgErr] = useState({});
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isDesk = winW >= 860;

  // Theme helpers
  const th = {
    ...t,
    d: dark,
    divider: dark ? "rgba(255,255,255,0.06)" : "rgba(128,128,128,0.1)",
    card: dark ? "#212128" : "#ffffff",
    tx: t.tx || (dark ? "#F3F3F5" : "#1a1a2e"),
    tx2: t.tx2 || (dark ? "#9A9AAE" : "#6b7280"),
    tx3: t.tx3 || (dark ? "#5E5E72" : "#9ca3af"),
    sec: dark ? "#1A1A22" : "#f5f5f7",
    bd: dark ? "rgba(255,255,255,0.08)" : "rgba(128,128,128,0.18)",
  };

  // Load listing
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const rows = await sbGet("listings", `id=eq.${id}&select=*`);
      if (rows.length > 0) {
        setCar(rows[0]);
        const ph = await sbGet("listing_photos", `listing_id=eq.${id}&order=position.asc`);
        setPhotos(ph.map(p => p.url));
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BC}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ marginTop: 16, fontSize: 13, color: th.tx2 }}>Loading listing...</p>
    </div>
  );

  if (!car) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Listing not found</h2>
      <p style={{ fontSize: 13, color: th.tx2, marginTop: 8 }}>This listing may have been removed or doesn't exist.</p>
      <button onClick={() => navigate("/search")} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none", background: GR, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse listings</button>
    </div>
  );

  const allPhotos = photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop"];
  const prevPhoto = () => setPhotoIdx(i => i === 0 ? allPhotos.length - 1 : i - 1);
  const nextPhoto = () => setPhotoIdx(i => i === allPhotos.length - 1 ? 0 : i + 1);
  const mkt = getMkt(car.make, Number(car.price_eur));
  const cardStyle = { ...cs(th), padding: "4px 18px", marginBottom: 0 };

  // ── Equipment list ──
  const dbFeatures = Array.isArray(car.features) ? car.features : [];
  const equipment = [
    car.drivetrain && `${car.drivetrain} drivetrain`,
    car.charge_port && `${car.charge_port} port`,
    car.ac_charge_kw && `${car.ac_charge_kw} kW AC charging`,
    car.accident_free && "Accident-free",
    car.service_history && car.service_history !== "No service history" && car.service_history,
    car.interior_material && `${car.interior_material} interior`,
    ...dbFeatures,
  ].filter(Boolean);

  // ── LEFT CONTENT ──
  const leftContent = (
    <>
      {/* Photo gallery */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        <img
          src={allPhotos[photoIdx]}
          alt=""
          style={{ width: "100%", height: isDesk ? 420 : 260, objectFit: "cover", display: "block", cursor: "pointer" }}
          onClick={() => setFullscreen(true)}
        />
        {allPhotos.length > 1 && <>
          <button onClick={prevPhoto} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevL size={16} color="#fff"/></button>
          <button onClick={nextPhoto} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevR size={16} color="#fff"/></button>
          <div style={{ position: "absolute", bottom: 10, right: 14, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{photoIdx + 1}/{allPhotos.length}</div>
        </>}
        <button onClick={() => setFullscreen(true)} style={{ position: "absolute", top: 10, right: 14, width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(0,0,0,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><MaxIcon size={14} color="#fff"/></button>
      </div>

      {/* Thumbnails */}
      {allPhotos.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
          {allPhotos.map((p, i) => (
            <img key={i} src={p} onClick={() => setPhotoIdx(i)} alt="" style={{ width: 64, height: 44, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: i === photoIdx ? `2px solid ${BC}` : "2px solid transparent", opacity: i === photoIdx ? 1 : 0.6, flexShrink: 0 }}/>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setFav(!fav)} style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${th.bd}`, background: th.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: fav ? "#ef4444" : th.tx2, fontSize: 13 }}>
          <HeartIcon size={16} filled={fav} color={fav ? "#ef4444" : th.tx2}/> {fav ? "Saved" : "Save"}
        </button>
        <button onClick={()=>{navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${th.bd}`, background: th.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: copied ? "#10b981" : th.tx2, fontSize: 13 }}>
          {copied ? <><CheckIcon size={16} color="#10b981"/> Link copied!</> : <><ShareIcon size={16} color={th.tx2}/> Share</>}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${th.divider}`, marginBottom: 16 }}>
        {["overview", "specs", "history"].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === tb ? `2px solid ${BC}` : "2px solid transparent", color: tab === tb ? BC : th.tx2, fontSize: 13, fontWeight: tab === tb ? 600 : 400, cursor: "pointer", textTransform: "capitalize" }}>{tb}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Battery health */}
          {car.state_of_health_pct && (
            <div style={{ ...cardStyle, padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <HealthRing pct={Number(car.state_of_health_pct)} d={dark}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Battery Health</div>
                <div style={{ fontSize: 12, color: th.tx2, lineHeight: 1.5 }}>
                  {car.battery_capacity_kwh && `${car.battery_capacity_kwh} kWh gross`}
                  {car.usable_capacity_kwh && ` · ${car.usable_capacity_kwh} kWh usable`}
                </div>
                <div style={{ fontSize: 12, color: th.tx2 }}>
                  {car.range_real_km && `~${car.range_real_km} km summer`}
                  {car.range_winter_km && ` · ~${car.range_winter_km} km winter`}
                </div>
              </div>
            </div>
          )}

          {/* Key specs grid */}
          <div style={{ ...cardStyle, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><BoltIcon size={16} color={BC}/> Key specs</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                ["Mileage", car.mileage_km ? `${Number(car.mileage_km).toLocaleString()} km` : "—"],
                ["Year", car.year || "—"],
                ["Power", car.power_kw ? `${car.power_kw} kW` : "—"],
                ["DC charge", car.dc_charge_max_kw ? `${car.dc_charge_max_kw} kW` : "—"],
                ["Drivetrain", car.drivetrain || "—"],
                ["Colour", car.exterior_color || "—"],
                ["Condition", fmtCond(car.condition) || "—"],
                ["Doors", car.doors || "—"],
              ].map(([label, val], i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${th.divider}`, fontSize: 13 }}>
                  <div style={{ color: th.tx2, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div style={{ ...cardStyle, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 13, color: th.tx2, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{car.description}</p>
            </div>
          )}

          {/* Equipment */}
          {equipment.length > 0 && (
            <div style={{ ...cardStyle, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><CheckIcon size={16} color={BC}/> Features</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {equipment.map((eq, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "5px 10px", borderRadius: 8, background: dark ? "rgba(255,117,0,0.08)" : "rgba(255,117,0,0.06)", color: th.tx, border: `1px solid ${dark ? "rgba(255,117,0,0.15)" : "rgba(255,117,0,0.1)"}` }}>
                    <CheckIcon size={12} color={BC}/> {eq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "specs" && (
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Full specifications</div>
          {[
            { icon: <BatteryIcon size={14} color={BC}/>, label: "Battery (gross)", value: car.battery_capacity_kwh ? `${car.battery_capacity_kwh} kWh` : "—" },
            { icon: <BatteryIcon size={14} color={BC}/>, label: "Battery (usable)", value: car.usable_capacity_kwh ? `${car.usable_capacity_kwh} kWh` : "—" },
            { icon: <BoltIcon size={14} color={BC}/>, label: "State of Health", value: car.state_of_health_pct ? `${car.state_of_health_pct}%` : "—" },
            { icon: <BoltIcon size={14} color={BC}/>, label: "Max DC charge", value: car.dc_charge_max_kw ? `${car.dc_charge_max_kw} kW` : "—" },
            { icon: <BoltIcon size={14} color={BC}/>, label: "AC charge", value: car.ac_charge_kw ? `${car.ac_charge_kw} kW` : "—" },
            { icon: <SpeedIcon size={14} color={BC}/>, label: "Power", value: car.power_kw ? `${car.power_kw} kW` : "—" },
            { icon: <CarIcon size={14} color={BC}/>, label: "Drivetrain", value: car.drivetrain || "—" },
            { icon: <CarIcon size={14} color={BC}/>, label: "Charge port", value: car.charge_port || "—" },
            { icon: <MapIcon size={14} color={BC}/>, label: "Range (summer)", value: car.range_real_km ? `${car.range_real_km} km` : "—" },
            { icon: <MapIcon size={14} color={BC}/>, label: "Range (winter)", value: car.range_winter_km ? `${car.range_winter_km} km` : "—" },
            { icon: <CarIcon size={14} color={BC}/>, label: "Exterior colour", value: car.exterior_color || "—" },
            { icon: <CarIcon size={14} color={BC}/>, label: "Interior colour", value: car.interior_color || "—" },
            { icon: <CarIcon size={14} color={BC}/>, label: "Interior material", value: car.interior_material || "—" },
            { icon: <InfoIcon size={14} color={BC}/>, label: "VIN", value: car.vin || "—" },
            { icon: <InfoIcon size={14} color={BC}/>, label: "First registration", value: car.first_registration || "—" },
            { icon: <UserIcon size={14} color={BC}/>, label: "Previous owners", value: car.previous_owners || "—" },
          ].map((row, i) => <DetailRow key={i} {...row} t={th}/>)}
        </div>
      )}

      {tab === "history" && (
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Vehicle history</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${th.divider}` }}>
              <span style={{ color: th.tx2 }}>Accident-free</span>
              <span style={{ fontWeight: 600, color: car.accident_free ? "#10b981" : "#ef4444" }}>{car.accident_free ? "Yes" : "No / Unknown"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${th.divider}` }}>
              <span style={{ color: th.tx2 }}>Service history</span>
              <span style={{ fontWeight: 600 }}>{car.service_history || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0" }}>
              <span style={{ color: th.tx2 }}>Previous owners</span>
              <span style={{ fontWeight: 600 }}>{car.previous_owners || "—"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── SIDEBAR CONTENT ──
  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Price card */}
      <div style={{ ...cs(th), padding: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>€{Number(car.price_eur).toLocaleString()}</div>
        <div style={{ display: "flex", gap: 8, fontSize: 12, color: th.tx2, marginBottom: 16 }}>
          {car.negotiable && <span style={{ background: dark ? "rgba(255,117,0,0.1)" : "rgba(255,117,0,0.06)", color: BC, padding: "2px 8px", borderRadius: 5, fontWeight: 500 }}>Negotiable</span>}
          {car.vat_deductible && <span style={{ background: dark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)", color: "#10b981", padding: "2px 8px", borderRadius: 5, fontWeight: 500 }}>VAT deductible</span>}
        </div>
        {/* Price analysis bar */}
        <div style={{ background: th.sec, borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: mkt.color }}>{mkt.label}</span>
            <span style={{ fontSize: 11, color: th.tx3 }}>Avg. €{mkt.avg.toLocaleString()}</span>
          </div>
          <div style={{ position: "relative", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#10b981 0%,#10b981 30%,#f59e0b 50%,#ef4444 70%,#ef4444 100%)" }}>
            <div style={{ position: "absolute", top: -4, left: `${mkt.pct}%`, transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: th.card, border: `3px solid ${mkt.color}`, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: th.tx3 }}>
            <span>€{Math.round(mkt.low).toLocaleString()}</span>
            <span>€{Math.round(mkt.high).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Seller card */}
      <div style={{ ...cs(th), padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Seller</div>
        <div onClick={() => navigate(`/search?seller=${car.seller_id}`)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: GR, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
            {(car.contact_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: BC }}>{car.contact_name || "Seller"}</div>
            <div style={{ fontSize: 12, color: th.tx2 }}>{car.seller_type === "dealer" ? "Dealer" : "Private seller"} · {car.city}</div>
          </div>
        </div>
        <button onClick={() => navigate(`/messages?listing=${id}&seller=${car.seller_id}`)} style={{ width: "100%", height: 44, borderRadius: 12, border: "none", background: GR, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <MailIcon size={16} color="#fff"/> Message seller
        </button>
        <button onClick={() => setShowPhone(!showPhone)} style={{ width: "100%", height: 42, borderRadius: 12, border: `1px solid ${th.bd}`, background: th.card, color: th.tx, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <PhoneIcon size={14} color={th.tx2}/> {showPhone && car.contact_phone ? car.contact_phone : "Show phone number"}
        </button>
      </div>

      {/* Location card */}
      <div style={{ ...cs(th), padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Location</div>
        <a href={car.maps_url || `https://www.google.com/maps/search/${encodeURIComponent((car.city||"")+" "+(car.country||""))}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: th.sec, borderRadius: 10, height: 100, marginBottom: 10, textDecoration: "none" }}>
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <MapIcon size={24} color={BC}/>
            <span style={{ fontSize: 11, fontWeight: 500, color: BC }}>Open in Google Maps</span>
          </div>
        </a>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{car.city}{car.country ? `, ${car.country}` : ""}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* FULLSCREEN GALLERY */}
      {fullscreen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={() => setFullscreen(false)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setGalleryMode("single")} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: galleryMode === "single" ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Single</button>
              <button onClick={() => setGalleryMode("grid")} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: galleryMode === "grid" ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Grid</button>
            </div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{photoIdx + 1} / {allPhotos.length}</div>
            <button onClick={() => setFullscreen(false)} style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", cursor: "pointer", color: "#fff", fontSize: 18 }}>×</button>
          </div>
          {galleryMode === "single" ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "0 60px" }} onClick={e => e.stopPropagation()}>
              <button onClick={prevPhoto} style={{ position: "absolute", left: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevL size={22} color="#fff"/></button>
              <img src={allPhotos[photoIdx]} alt="" style={{ maxWidth: "100%", maxHeight: "calc(100vh - 120px)", objectFit: "contain", borderRadius: 8 }}/>
              <button onClick={nextPhoto} style={{ position: "absolute", right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevR size={22} color="#fff"/></button>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 20px" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
                {allPhotos.map((ph, i) => (
                  <div key={i} onClick={() => { setPhotoIdx(i); setGalleryMode("single"); }} style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", aspectRatio: "16/10", border: photoIdx === i ? `2px solid ${BC}` : "2px solid transparent" }}>
                    <img src={ph} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          {galleryMode === "single" && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "12px 20px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {allPhotos.map((ph, i) => (
                <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: 64, height: 42, borderRadius: 6, overflow: "hidden", cursor: "pointer", border: photoIdx === i ? `2px solid ${BC}` : "2px solid transparent", opacity: photoIdx === i ? 1 : 0.5 }}>
                  <img src={ph} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BACK LINK */}
      <div style={{ padding: "12px 0" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: BC, fontSize: 13, fontWeight: 500, padding: 0 }}>
          <ChevL size={15} color={BC}/> Back to results
        </button>
      </div>

      {/* TITLE */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: isDesk ? 26 : 22, fontWeight: 800, margin: "0 0 4px" }}>{car.year} {car.make} {car.model} {car.variant || ""}</h1>
        <div style={{ fontSize: 13, color: th.tx2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <MapIcon size={14} color={th.tx2}/> {car.city}{car.country ? `, ${car.country}` : ""}
          <span>·</span> {car.mileage_km ? `${Number(car.mileage_km).toLocaleString()} km` : ""}
          <span>·</span> {fmtCond(car.condition) || ""}
        </div>
      </div>

      {/* TWO-COLUMN DESKTOP / SINGLE-COLUMN MOBILE */}
      {isDesk ? (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingBottom: 32 }}>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>{leftContent}</div>
          <div style={{ flex: "0 0 340px", position: "sticky", top: 16 }}>{sidebarContent}</div>
        </div>
      ) : (
        <>
          {leftContent}
          <div style={{ marginTop: 20, paddingBottom: 16 }}>{sidebarContent}</div>
        </>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${th.divider}`, padding: "24px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: GR, display: "flex", alignItems: "center", justifyContent: "center" }}><BoltIcon size={12} color="#fff"/></div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>PlugMarket<span style={{ color: BC }}>.eu</span></span>
        </div>
        <div style={{ fontSize: 11, color: th.tx3 }}>© 2026 PlugMarket.eu</div>
      </div>
    </>
  );
}
