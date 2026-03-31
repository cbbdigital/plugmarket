import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

// ── Supabase REST ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
async function sbGet(table, params) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Accept": "application/json" }
    });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [data];
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
const MapIcon = (p) => <Ic {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}/>;
const CarIcon = (p) => <Ic {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>;
const MailIcon = (p) => <Ic {...p} d={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></>}/>;
const PhoneIcon = (p) => <Ic {...p} d={<><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.35 1.9.66 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.31 1.85.54 2.81.66A2 2 0 0122 16.92z"/></>}/>;
const CalIcon = (p) => <Ic {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}/>;
const ShldIcon = (p) => <Ic {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}/>;
const StarIcon = ({filled,...p}) => <Ic {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={filled?(p.color||"#f59e0b"):"none"}/>}/>;
const ChevL = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6"/>}/>;

// ── Image Slider ──
function ImgSlider({imgs,height,children,borderRadius=0}){
  const[idx,setIdx]=useState(0);
  const ref=useRef(null);
  const touch=useRef({x:0,t:0});
  const n=imgs?.length||0;
  const go=useCallback(d=>{setIdx(p=>{const nx=p+d;return nx<0?n-1:nx>=n?0:nx})},[n]);
  const onTS=useCallback(e=>{const tc=e.touches[0];touch.current={x:tc.clientX,t:Date.now()}},[]);
  const onTE=useCallback(e=>{const dx=e.changedTouches[0].clientX-touch.current.x;const dt=Date.now()-touch.current.t;if(Math.abs(dx)>30&&dt<400){go(dx<0?1:-1)}},[go]);
  if(!imgs||n===0) return <div style={{height,background:"#16213e",borderRadius,display:"flex",alignItems:"center",justifyContent:"center"}}><CarIcon size={36} color="#4b5563"/></div>;
  return(
    <div style={{height,position:"relative",overflow:"hidden",borderRadius,background:"#16213e",touchAction:"pan-y"}} ref={ref} onTouchStart={onTS} onTouchEnd={onTE}>
      <div style={{display:"flex",width:`${n*100}%`,height:"100%",transform:`translateX(-${idx*(100/n)}%)`,transition:"transform 0.3s ease"}}>
        {imgs.map((src,i)=><img key={i} src={src} alt="" style={{width:`${100/n}%`,height:"100%",objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>)}
      </div>
      {n>1&&<>
        <button onClick={e=>{e.stopPropagation();go(-1)}} style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={e=>{e.stopPropagation();go(1)}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </>}
      {n>1&&<div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
        {imgs.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i)}} style={{width:i===idx?14:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,0.5)",cursor:"pointer",transition:"all 0.2s"}}/>)}
      </div>}
      {children}
    </div>
  );
}

// ── Card style ──
function cs(t) {
  return {
    background: t.card,
    borderRadius: 16,
    border: `1px solid ${t.bd}`,
    boxShadow: `0 2px 8px ${t.sh}`,
  };
}

const FALLBACK = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=480&h=300&fit=crop";

export default function SellerPage() {
  const { t, dark } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  const d = dark;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      // Get profile
      const profiles = await sbGet("profiles", `id=eq.${id}&select=*`);
      // Get all active listings by this seller
      const rows = await sbGet("listings", `seller_id=eq.${id}&status=eq.active&order=created_at.desc`);
      // Get photos
      let photoMap = {};
      if (rows.length > 0) {
        const ids = rows.map(r => r.id);
        const photos = await sbGet("listing_photos", `listing_id=in.(${ids.join(",")})&order=position.asc`);
        photos.forEach(p => { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = []; photoMap[p.listing_id].push(p.url); });
      }
      // Build seller info from profile or first listing
      const profile = profiles?.[0];
      const firstListing = rows[0];
      setSeller({
        name: profile?.full_name || firstListing?.contact_name || "Seller",
        type: firstListing?.seller_type || "private",
        city: firstListing?.city || "",
        country: firstListing?.country || "",
        phone: firstListing?.contact_phone || "",
        email: firstListing?.contact_email || "",
        bio: profile?.bio || "",
        avatar_url: profile?.avatar_url || "",
        verified: profile?.is_verified || false,
        memberSince: profile?.created_at || firstListing?.created_at || "",
        listingCount: rows.length,
      });
      setListings(rows.map(r => ({
        id: r.id,
        make: r.make,
        model: r.model,
        variant: r.variant || "",
        year: r.year,
        km: r.mileage_km,
        price: r.price_eur,
        battery: r.battery_capacity_kwh,
        range: r.range_real_km,
        dc: r.dc_charge_max_kw,
        city: r.city,
        country: r.country,
        condition: r.condition,
        imgs: photoMap[r.id] || [FALLBACK],
        boosted: r.is_boosted,
      })));
      setLoading(false);
    })();
  }, [id]);

  const fmtCond = (c) => {
    if (!c) return "";
    const m = { new: "New", used: "Used", certified_pre_owned: "Certified Pre-Owned" };
    return m[c] || c;
  };

  const memberDate = seller?.memberSince ? new Date(seller.memberSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";

  if (loading) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BC}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ marginTop: 16, fontSize: 13, color: t.tx2 }}>Loading seller profile...</p>
    </div>
  );

  if (!seller) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Seller not found</h2>
      <button onClick={() => navigate("/search")} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none", background: GR, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse listings</button>
    </div>
  );

  const initials = seller.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {/* Back */}
      <div style={{ padding: "12px 0" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: BC, fontSize: 13, fontWeight: 500, padding: 0 }}>
          <ChevL size={15} color={BC}/> Back
        </button>
      </div>

      {/* Profile header */}
      <div style={{ ...cs(t), padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover" }}/>
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: GR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff" }}>{initials}</div>
            )}
            {seller.verified && (
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${t.card}` }}>
                <ShldIcon size={12} color="#fff"/>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{seller.name}</h1>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: seller.type === "dealer" ? "rgba(99,102,241,0.1)" : (d ? "rgba(255,117,0,0.1)" : "rgba(255,117,0,0.06)"), color: seller.type === "dealer" ? "#6366f1" : BC, fontWeight: 600 }}>
                {seller.type === "dealer" ? "Dealer" : "Private seller"}
              </span>
            </div>

            {seller.bio && <p style={{ fontSize: 13, color: t.tx2, margin: "6px 0 12px", lineHeight: 1.6 }}>{seller.bio}</p>}

            {/* Stats row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.tx2 }}>
                <CarIcon size={14} color={BC}/> <strong style={{ color: t.tx }}>{seller.listingCount}</strong> active listing{seller.listingCount !== 1 ? "s" : ""}
              </div>
              {seller.city && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.tx2 }}>
                  <MapIcon size={14} color={t.tx3}/> {seller.city}{seller.country ? `, ${seller.country}` : ""}
                </div>
              )}
              {memberDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.tx2 }}>
                  <CalIcon size={14} color={t.tx3}/> Member since {memberDate}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => user ? navigate(`/messages?seller=${id}`) : navigate("/login")} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: GR, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <MailIcon size={14} color="#fff"/> {user ? "Message" : "Log in to message"}
              </button>
              <button onClick={() => user ? setShowPhone(!showPhone) : navigate("/login")} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${t.bd}`, background: t.card, color: t.tx, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <PhoneIcon size={14} color={t.tx2}/> {!user ? "Log in to see phone" : showPhone && seller.phone ? seller.phone : "Show phone"}
              </button>
            </div>

            {/* Google Maps link */}
            {seller.city && (
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(seller.city + " " + seller.country)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontSize: 11, color: BC, textDecoration: "none", fontWeight: 500 }}>
                <MapIcon size={12} color={BC}/> View on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Listings header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Vehicles for sale</div>
        <span style={{ fontSize: 12, color: t.tx3 }}>{listings.length} listing{listings.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Listings grid */}
      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.tx3 }}>
          <CarIcon size={40} color={t.tx3}/>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 10 }}>No active listings</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, paddingBottom: 20 }}>
          {listings.map(l => (
            <div key={l.id} onClick={() => navigate(`/listing/${l.id}`)} style={{ ...cs(t), borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
              <ImgSlider imgs={l.imgs} height={180} borderRadius={0}>
                {l.boosted && <div style={{ position: "absolute", top: 8, left: 8, background: GR, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 5, textTransform: "uppercase" }}>Featured</div>}
              </ImgSlider>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.tx }}>{l.year} {l.make} {l.model}</div>
                {l.variant && <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>{l.variant}</div>}
                <div style={{ fontSize: 20, fontWeight: 800, color: BC, marginTop: 6 }}>€{Number(l.price).toLocaleString()}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                  {[
                    l.km && `${Number(l.km).toLocaleString()} km`,
                    fmtCond(l.condition),
                    l.battery && `${l.battery} kWh`,
                    l.range && `${l.range} km range`,
                    l.dc && `${l.dc} kW DC`,
                  ].filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: d ? "rgba(255,117,0,0.08)" : "rgba(255,117,0,0.05)", color: t.tx2, border: `1px solid ${d ? "rgba(255,117,0,0.12)" : "rgba(255,117,0,0.08)"}` }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${t.bd}`, padding: "20px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: GR, display: "flex", alignItems: "center", justifyContent: "center" }}><BoltIcon size={11} color="#fff"/></div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>PlugMarket<span style={{ color: BC }}>.eu</span></span>
        </div>
        <span style={{ fontSize: 11, color: t.tx3 }}>© 2026 PlugMarket.eu</span>
      </div>
    </>
  );
}
