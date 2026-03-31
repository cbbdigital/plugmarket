import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";

const SB_URL = "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";

const BC = "#FF7500";
const GR = "linear-gradient(135deg,#FF7500,#FF9533)";

/* ─── Icons ─── */
const Ic = function(props) {
  return <svg width={props.size||16} height={props.size||16} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{props.d}</svg>;
};
const MapPin = function(p) { return <Ic {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}/>; };
const Shield = function(p) { return <Ic {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}/>; };
const Mail = function(p) { return <Ic {...p} d={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></>}/>; };
const Phone = function(p) { return <Ic {...p} d={<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.35 1.9.66 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.31 1.85.54 2.81.66A2 2 0 0122 16.92z"/>}/>; };
const Globe = function(p) { return <Ic {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>}/>; };
const Cal = function(p) { return <Ic {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}/>; };
const Car = function(p) { return <Ic {...p} d={<path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v1a1 1 0 001 1h1a1 1 0 001-1v-1m10 0v1a1 1 0 001 1h1a1 1 0 001-1v-1"/>}/>; };
const ChevL = function(p) { return <Ic {...p} d={<polyline points="15 18 9 12 15 6"/>}/>; };
const Star = function(p) { return <Ic {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={p.filled ? (p.color || "#f59e0b") : "none"}/>}/>; };
const Link2 = function(p) { return <Ic {...p} d={<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>}/>; };

export default function SellerPage() {
  var ctx = useOutletContext();
  var t = ctx.t;
  var dark = ctx.dark;
  var d = dark;
  var params = useParams();
  var id = params.id;
  var navigate = useNavigate();
  var [seller, setSeller] = useState(null);
  var [listings, setListings] = useState([]);
  var [loading, setLoading] = useState(true);
  var [err, setErr] = useState(null);
  var [showPhone, setShowPhone] = useState(false);
  var [tab, setTab] = useState("listings");
  var [narrow, setNarrow] = useState(typeof window !== "undefined" ? window.innerWidth < 600 : false);

  useEffect(function() {
    var h = function() { setNarrow(window.innerWidth < 600); };
    window.addEventListener("resize", h);
    return function() { window.removeEventListener("resize", h); };
  }, []);

  // Check if logged in and get current user ID
  var [loggedIn, setLoggedIn] = useState(false);
  var [myId, setMyId] = useState(null);
  useEffect(function() {
    try {
      // Check pm_session (PlugMarket auth)
      var pmRaw = localStorage.getItem("pm_session");
      if (pmRaw) {
        var p = JSON.parse(pmRaw);
        // Handle both shapes: { user: { id } } and { user: { user: { id } } }
        var uid = (p && p.user && p.user.id) || (p && p.user && p.user.user && p.user.user.id);
        if (uid) { setLoggedIn(true); setMyId(uid); return; }
        // Also check if access_token exists (means logged in even if user shape is weird)
        if (p && p.access_token) { setLoggedIn(true); }
      }
    } catch(e) { console.warn("Auth check error:", e); }
  }, []);

  var isOwn = loggedIn && myId === id;

  // Editing states
  var [editing, setEditing] = useState(false);
  var [editBio, setEditBio] = useState("");
  var [editWebsite, setEditWebsite] = useState("");
  var [saving, setSaving] = useState(false);
  var coverInputRef = useRef(null);
  var avatarInputRef = useRef(null);

  useEffect(function() {
    if (!id) return;
    (async function() {
      try {
        setLoading(true);
        var hd = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Accept": "application/json" };

        var pRes = await fetch(SB_URL + "/rest/v1/profiles?id=eq." + id + "&select=*", { headers: hd });
        var pRaw = await pRes.json();
        var profile = Array.isArray(pRaw) ? pRaw[0] : pRaw;

        var lRes = await fetch(SB_URL + "/rest/v1/listings?seller_id=eq." + id + "&status=eq.active&order=created_at.desc&select=*", { headers: hd });
        var lRaw = await lRes.json();
        var rows = Array.isArray(lRaw) ? lRaw : [];

        var photoMap = {};
        if (rows.length > 0) {
          var ids = rows.map(function(r) { return r.id; }).join(",");
          var phRes = await fetch(SB_URL + "/rest/v1/listing_photos?listing_id=in.(" + ids + ")&order=position.asc&select=*", { headers: hd });
          var phRaw = await phRes.json();
          var photos = Array.isArray(phRaw) ? phRaw : [];
          photos.forEach(function(p) { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = []; photoMap[p.listing_id].push(p.url); });
        }

        // Get reviews count
        var rvRes = await fetch(SB_URL + "/rest/v1/reviews?seller_id=eq." + id + "&select=rating", { headers: hd });
        var rvRaw = await rvRes.json();
        var reviews = Array.isArray(rvRaw) ? rvRaw : [];
        var avgRating = reviews.length > 0 ? (reviews.reduce(function(s,r) { return s + r.rating; }, 0) / reviews.length).toFixed(1) : 0;

        var name = (profile && profile.full_name) || (rows[0] && rows[0].contact_name) || "Seller";
        var initials = name.split(" ").map(function(w) { return w[0]; }).join("").toUpperCase().slice(0, 2);

        setSeller({
          name: name,
          initials: initials,
          type: (profile && profile.seller_type) || (rows[0] && rows[0].seller_type) || "private",
          city: (rows[0] && rows[0].city) || (profile && profile.city) || "",
          country: (rows[0] && rows[0].country) || (profile && profile.country) || "",
          phone: (rows[0] && rows[0].contact_phone) || (profile && profile.phone) || "",
          email: (rows[0] && rows[0].contact_email) || "",
          bio: (profile && profile.bio) || "",
          avatar_url: (profile && profile.avatar_url) || "",
          cover_url: (profile && profile.cover_url) || "",
          website: (profile && profile.website) || "",
          verified: (profile && profile.is_verified) || false,
          memberSince: (profile && profile.created_at) || "",
          listingCount: rows.length,
          reviewCount: reviews.length,
          rating: avgRating,
        });

        var FALLBACK = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=480&h=300&fit=crop";
        setListings(rows.map(function(r) {
          return {
            id: r.id,
            make: r.make || "",
            model: r.model || "",
            variant: r.variant || "",
            year: r.year,
            price: r.price_eur,
            km: r.mileage_km,
            battery: r.battery_capacity_kwh,
            range: r.range_real_km,
            dc: r.dc_charge_max_kw,
            condition: r.condition,
            imgs: photoMap[r.id] || [FALLBACK],
          };
        }));

        setLoading(false);
      } catch (e) {
        console.error("SellerPage crash:", e);
        setErr(e.message);
        setLoading(false);
      }
    })();
  }, [id]);

  // Get auth token from localStorage
  var getToken = function() {
    try {
      var pmRaw = localStorage.getItem("pm_session");
      if (pmRaw) {
        var p = JSON.parse(pmRaw);
        if (p && p.access_token) return p.access_token;
      }
      return null;
    } catch(e) { return null; }
  };

  var startEditing = function() {
    setEditBio(seller.bio || "");
    setEditWebsite(seller.website || "");
    setEditing(true);
  };

  var saveProfile = async function() {
    var token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await fetch(SB_URL + "/rest/v1/profiles?id=eq." + id, {
        method: "PATCH",
        headers: { "apikey": SB_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json", "Prefer": "return=representation" },
        body: JSON.stringify({ bio: editBio || null, website: editWebsite || null }),
      });
      setSeller(Object.assign({}, seller, { bio: editBio, website: editWebsite }));
      setEditing(false);
    } catch(e) { console.error("Save failed:", e); }
    setSaving(false);
  };

  var uploadImage = async function(file, field) {
    var token = getToken();
    if (!token || !file) return;
    // Compress
    var dataUrl = await new Promise(function(resolve) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement("canvas");
          var maxW = field === "cover" ? 1400 : 400;
          var maxH = field === "cover" ? 400 : 400;
          var w = img.width, h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
    // Upload to storage
    var blob = await (await fetch(dataUrl)).blob();
    var path = id + "/" + field + ".jpg";
    await fetch(SB_URL + "/storage/v1/object/listing-photos/" + path, {
      method: "POST",
      headers: { "apikey": SB_KEY, "Authorization": "Bearer " + token, "Content-Type": "image/jpeg", "x-upsert": "true" },
      body: blob,
    });
    var url = SB_URL + "/storage/v1/object/public/listing-photos/" + path + "?t=" + Date.now();
    // Update profile
    var update = {};
    update[field === "cover" ? "cover_url" : "avatar_url"] = url;
    await fetch(SB_URL + "/rest/v1/profiles?id=eq." + id, {
      method: "PATCH",
      headers: { "apikey": SB_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    var newSeller = Object.assign({}, seller);
    if (field === "cover") newSeller.cover_url = url;
    else newSeller.avatar_url = url;
    setSeller(newSeller);
  };

  if (loading) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid " + BC, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{ fontSize: 13, color: t.tx2, marginTop: 14 }}>Loading seller profile...</div>
    </div>
  );

  if (err) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444" }}>Error loading profile</div>
      <div style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>{err}</div>
    </div>
  );

  if (!seller) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>Seller not found</div>
      <button onClick={function() { navigate("/search"); }} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none", background: GR, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse listings</button>
    </div>
  );

  var memberDate = seller.memberSince ? new Date(seller.memberSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";
  var cols = narrow ? 3 : 4;
  var condLabel = function(c) {
    if (!c) return "";
    var m = { "new": "New", "used": "Used", "certified_pre_owned": "CPO" };
    return m[c] || c;
  };

  return (
    <div style={{ marginTop: -20 }}>
      {/* ─── COVER + AVATAR ─── */}
      <div style={{ position: "relative", marginBottom: 60 }}>
        {/* Hidden file inputs */}
        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={function(e) { if (e.target.files[0]) uploadImage(e.target.files[0], "cover"); }}/>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={function(e) { if (e.target.files[0]) uploadImage(e.target.files[0], "avatar"); }}/>

        {/* Cover photo */}
        <div onClick={isOwn ? function() { coverInputRef.current.click(); } : undefined} style={{
          width: "100%", height: narrow ? 160 : 220, borderRadius: "0 0 20px 20px", overflow: "hidden",
          background: seller.cover_url ? "none" : (d ? "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" : "linear-gradient(135deg,#FFF3EB 0%,#FFE0CC 50%,#FF7500 100%)"),
          cursor: isOwn ? "pointer" : "default",
        }}>
          {seller.cover_url && <img src={seller.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
          {!seller.cover_url && (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15 }}>
              <Car size={80} color={d ? "#fff" : BC}/>
            </div>
          )}
          {isOwn && (
            <div style={{ position: "absolute", bottom: 60, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 6, cursor: "pointer", backdropFilter: "blur(4px)" }}>
              {seller.cover_url ? "Change cover" : "Add cover photo"}
            </div>
          )}
        </div>

        {/* Back button overlaid on cover */}
        <button onClick={function() { if (window.history.length > 2) navigate(-1); else navigate("/"); }} style={{
          position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 10,
          background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>
          <ChevL size={18} color="#fff"/>
        </button>

        {/* Avatar — centered, overlapping cover bottom */}
        <div style={{
          position: "absolute", bottom: -50, left: "50%", transform: "translateX(-50%)",
        }}>
          <div onClick={isOwn ? function() { avatarInputRef.current.click(); } : undefined} style={{
            width: 100, height: 100, borderRadius: "50%",
            border: "4px solid " + t.card,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            overflow: "hidden", background: GR,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: isOwn ? "pointer" : "default",
          }}>
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            ) : (
              <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{seller.initials}</span>
            )}
          </div>
          {seller.verified && (
            <div style={{
              position: "absolute", bottom: 2, right: 2,
              width: 24, height: 24, borderRadius: "50%", background: "#10b981",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid " + t.card,
            }}>
              <Shield size={11} color="#fff"/>
            </div>
          )}
        </div>
      </div>

      {/* ─── NAME & INFO ─── */}
      <div style={{ textAlign: "center", padding: "0 16px", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{seller.name}</h1>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: t.tx2 }}>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 600,
            background: seller.type === "dealer" ? "rgba(99,102,241,0.1)" : (d ? "rgba(255,117,0,0.1)" : "rgba(255,117,0,0.06)"),
            color: seller.type === "dealer" ? "#6366f1" : BC,
          }}>
            {seller.type === "dealer" ? "Dealer" : "Private seller"}
          </span>
          {seller.city && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} color={t.tx3}/> {seller.city}{seller.country ? ", " + seller.country : ""}</span>}
        </div>

        {/* Bio */}
        {seller.bio && <p style={{ fontSize: 13, color: t.tx2, marginTop: 10, lineHeight: 1.6, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>{seller.bio}</p>}

        {/* Website link */}
        {seller.website && (
          <a href={seller.website.startsWith("http") ? seller.website : "https://" + seller.website} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
            fontSize: 12, color: BC, textDecoration: "none", fontWeight: 600,
          }}>
            <Link2 size={13} color={BC}/> {seller.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      {/* ─── STATS ROW ─── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 0,
        margin: "0 auto 16px", maxWidth: 360,
        background: t.card, borderRadius: 14, border: "1px solid " + t.bd,
        overflow: "hidden",
      }}>
        {[
          { n: seller.listingCount, l: "Listings" },
          { n: seller.rating || "—", l: "Rating" },
          { n: seller.reviewCount, l: "Reviews" },
        ].map(function(s, i) {
          return (
            <div key={i} style={{
              flex: 1, padding: "14px 0", textAlign: "center",
              borderRight: i < 2 ? "1px solid " + t.bd : "none",
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: t.tx }}>{s.n}</div>
              <div style={{ fontSize: 10, color: t.tx3, marginTop: 2 }}>{s.l}</div>
            </div>
          );
        })}
      </div>

      {/* ─── ACTION BUTTONS ─── */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, padding: "0 16px" }}>
        {isOwn ? (
          <>
            {!editing ? (
              <button onClick={startEditing} style={{
                flex: 1, maxWidth: 220, height: 40, borderRadius: 12,
                border: "1px solid " + t.bd, background: t.card, color: t.tx,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                Edit profile
              </button>
            ) : (
              <>
                <button onClick={saveProfile} disabled={saving} style={{
                  flex: 1, maxWidth: 160, height: 40, borderRadius: 12, border: "none",
                  background: GR, color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button onClick={function() { setEditing(false); }} style={{
                  flex: 1, maxWidth: 120, height: 40, borderRadius: 12,
                  border: "1px solid " + t.bd, background: t.card, color: t.tx2,
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                  Cancel
                </button>
              </>
            )}
            <button onClick={function() { navigate("/search?seller=" + id); }} style={{
              flex: 1, maxWidth: 160, height: 40, borderRadius: 12,
              border: "1px solid " + t.bd, background: t.card, color: t.tx,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
              View all listings
            </button>
          </>
        ) : (
          <>
            <button onClick={function() { loggedIn ? navigate("/messages?seller=" + id) : navigate("/login"); }} style={{
              flex: 1, maxWidth: 170, height: 40, borderRadius: 12, border: "none",
              background: GR, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Mail size={15} color="#fff"/> {loggedIn ? "Message" : "Log in to message"}
            </button>
            <button onClick={function() { loggedIn ? setShowPhone(!showPhone) : navigate("/login"); }} style={{
              flex: 1, maxWidth: 170, height: 40, borderRadius: 12,
              border: "1px solid " + t.bd, background: t.card, color: t.tx,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Phone size={15} color={t.tx2}/> {!loggedIn ? "Log in for phone" : (showPhone && seller.phone ? seller.phone : "Show phone")}
            </button>
          </>
        )}
      </div>

      {/* ─── EDIT FORM (inline) ─── */}
      {editing && (
        <div style={{ padding: "0 16px", marginBottom: 20 }}>
          <div style={{ background: t.card, borderRadius: 14, border: "1px solid " + t.bd, padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.tx2, display: "block", marginBottom: 4 }}>Bio / Description</label>
              <textarea value={editBio} onChange={function(e) { setEditBio(e.target.value); }} placeholder="Tell buyers about yourself or your dealership..." rows={4} style={{
                width: "100%", borderRadius: 10, border: "1px solid " + t.bd, background: t.inp || t.sec,
                color: t.tx, padding: "10px 14px", fontSize: 13, boxSizing: "border-box",
                resize: "vertical", fontFamily: "inherit", lineHeight: 1.6,
              }}/>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.tx2, display: "block", marginBottom: 4 }}>Website / Dealer page link</label>
              <input value={editWebsite} onChange={function(e) { setEditWebsite(e.target.value); }} placeholder="https://your-dealership.com" style={{
                width: "100%", height: 40, borderRadius: 10, border: "1px solid " + t.bd,
                background: t.inp || t.sec, color: t.tx, padding: "0 14px", fontSize: 13, boxSizing: "border-box",
              }}/>
            </div>
          </div>
        </div>
      )}

      {/* ─── Member since + location ─── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {memberDate && <span style={{ fontSize: 11, color: t.tx3, display: "flex", alignItems: "center", gap: 4 }}><Cal size={12} color={t.tx3}/> Member since {memberDate}</span>}
        {seller.verified && <span style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><Shield size={12} color="#10b981"/> Verified seller</span>}
      </div>

      {/* ─── DIVIDER ─── */}
      <div style={{ height: 1, background: t.bd, margin: "0 0 16px" }}/>

      {/* ─── TABS ─── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
        {["listings", "about"].map(function(tb) {
          var active = tab === tb;
          return (
            <button key={tb} onClick={function() { setTab(tb); }} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              borderBottom: active ? "2px solid " + BC : "2px solid transparent",
              color: active ? BC : t.tx2, fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: "pointer", textTransform: "capitalize",
            }}>
              {tb === "listings" ? "Vehicles (" + listings.length + ")" : "About"}
            </button>
          );
        })}
      </div>

      {/* ─── LISTINGS TAB — Instagram grid ─── */}
      {tab === "listings" && (
        listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: t.tx3 }}>
            <Car size={40} color={t.tx3}/>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 10 }}>No active listings</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(" + cols + ", 1fr)",
            gap: 3,
            paddingBottom: 20,
          }}>
            {listings.map(function(l) {
              return (
                <div key={l.id} onClick={function() { navigate("/listing/" + l.id); }} style={{
                  position: "relative", aspectRatio: "1", overflow: "hidden", cursor: "pointer",
                  background: d ? "#1a1a22" : "#f0f0f0",
                }}>
                  <img src={l.imgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={function(e) { e.target.style.display = "none"; }}/>
                  {/* Hover overlay with info */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(transparent 40%, rgba(0,0,0,0.75) 100%)",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    padding: narrow ? 6 : 10,
                  }}>
                    <div style={{ fontSize: narrow ? 11 : 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                      {l.make} {l.model}
                    </div>
                    <div style={{ fontSize: narrow ? 12 : 15, fontWeight: 800, color: BC, marginTop: 2 }}>
                      €{Number(l.price).toLocaleString()}
                    </div>
                    {!narrow && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        {[l.year, l.km ? Number(l.km).toLocaleString() + " km" : null, condLabel(l.condition)].filter(Boolean).map(function(tag, i) {
                          return <span key={i} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>{tag}</span>;
                        })}
                      </div>
                    )}
                  </div>
                  {/* Photo count badge */}
                  {l.imgs.length > 1 && (
                    <div style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(0,0,0,0.5)", color: "#fff",
                      fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                    }}>
                      {l.imgs.length} photos
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ─── ABOUT TAB ─── */}
      {tab === "about" && (
        <div style={{ padding: "0 4px 30px" }}>
          <div style={{ background: t.card, borderRadius: 16, border: "1px solid " + t.bd, padding: 20 }}>
            {/* Bio section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>About {seller.name}</div>
              {seller.bio ? (
                <p style={{ fontSize: 13, color: t.tx2, lineHeight: 1.7, margin: 0 }}>{seller.bio}</p>
              ) : (
                <p style={{ fontSize: 13, color: t.tx3, fontStyle: "italic", margin: 0 }}>No description yet.</p>
              )}
            </div>

            {/* Details */}
            <div style={{ borderTop: "1px solid " + t.bd, paddingTop: 16 }}>
              {[
                seller.city && { icon: <MapPin size={15} color={BC}/>, label: "Location", value: seller.city + (seller.country ? ", " + seller.country : "") },
                seller.type && { icon: <Car size={15} color={BC}/>, label: "Seller type", value: seller.type === "dealer" ? "Dealer" : "Private seller" },
                memberDate && { icon: <Cal size={15} color={BC}/>, label: "Member since", value: memberDate },
                seller.website && { icon: <Globe size={15} color={BC}/>, label: "Website", value: seller.website.replace(/^https?:\/\//, ""), link: seller.website.startsWith("http") ? seller.website : "https://" + seller.website },
                seller.verified && { icon: <Shield size={15} color="#10b981"/>, label: "Status", value: "Verified seller" },
                seller.reviewCount > 0 && { icon: <Star size={15} color="#f59e0b" filled/>, label: "Rating", value: seller.rating + " avg from " + seller.reviewCount + " review" + (seller.reviewCount !== 1 ? "s" : "") },
              ].filter(Boolean).map(function(row, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + t.bd }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: d ? "rgba(255,117,0,0.08)" : "rgba(255,117,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {row.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: t.tx3 }}>{row.label}</div>
                      {row.link ? (
                        <a href={row.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: BC, textDecoration: "none" }}>{row.value}</a>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.tx }}>{row.value}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Maps link */}
          {seller.city && (
            <a href={"https://www.google.com/maps/search/" + encodeURIComponent(seller.city + " " + seller.country)} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 16, padding: "12px 0",
              background: t.card, borderRadius: 12, border: "1px solid " + t.bd,
              fontSize: 12, color: BC, textDecoration: "none", fontWeight: 600,
            }}>
              <MapPin size={14} color={BC}/> View on Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
