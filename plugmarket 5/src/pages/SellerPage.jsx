import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";

const SB_URL = "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";

const BC = "#FF7500";
const GR = "linear-gradient(135deg,#FF7500,#FF9533)";

export default function SellerPage() {
  const { t } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const hd = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Accept": "application/json" };

        const pRes = await fetch(SB_URL + "/rest/v1/profiles?id=eq." + id + "&select=*", { headers: hd });
        const pRaw = await pRes.json();
        const profile = Array.isArray(pRaw) ? pRaw[0] : pRaw;

        const lRes = await fetch(SB_URL + "/rest/v1/listings?seller_id=eq." + id + "&status=eq.active&order=created_at.desc&select=*", { headers: hd });
        const lRaw = await lRes.json();
        const rows = Array.isArray(lRaw) ? lRaw : [];

        let photoMap = {};
        if (rows.length > 0) {
          const ids = rows.map(function(r) { return r.id; }).join(",");
          const phRes = await fetch(SB_URL + "/rest/v1/listing_photos?listing_id=in.(" + ids + ")&order=position.asc&select=*", { headers: hd });
          const phRaw = await phRes.json();
          var photos = Array.isArray(phRaw) ? phRaw : [];
          photos.forEach(function(p) { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = []; photoMap[p.listing_id].push(p.url); });
        }

        var name = (profile && profile.full_name) || (rows[0] && rows[0].contact_name) || "Seller";
        var initials = name.split(" ").map(function(w) { return w[0]; }).join("").toUpperCase().slice(0, 2);

        setSeller({
          name: name,
          initials: initials,
          type: (rows[0] && rows[0].seller_type) || "private",
          city: (rows[0] && rows[0].city) || "",
          country: (rows[0] && rows[0].country) || (profile && profile.country) || "",
          phone: (rows[0] && rows[0].contact_phone) || "",
          bio: (profile && profile.bio) || "",
          avatar_url: (profile && profile.avatar_url) || "",
          verified: (profile && profile.is_verified) || false,
          memberSince: (profile && profile.created_at) || "",
          listingCount: rows.length,
        });

        setListings(rows.map(function(r) {
          return {
            id: r.id,
            title: (r.year || "") + " " + (r.make || "") + " " + (r.model || "") + " " + (r.variant || ""),
            price: r.price_eur,
            km: r.mileage_km,
            battery: r.battery_capacity_kwh,
            range: r.range_real_km,
            dc: r.dc_charge_max_kw,
            img: (photoMap[r.id] && photoMap[r.id][0]) || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=480&h=300&fit=crop",
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

  if (loading) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: t.tx2 }}>Loading seller profile...</div>
    </div>
  );

  if (err) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444" }}>Error</div>
      <div style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>{err}</div>
    </div>
  );

  if (!seller) return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>Seller not found</div>
    </div>
  );

  return (
    <div>
      <div style={{ padding: "12px 0" }}>
        <button onClick={function() { navigate(-1); }} style={{ background: "none", border: "none", cursor: "pointer", color: BC, fontSize: 13, fontWeight: 500 }}>← Back</button>
      </div>

      <div style={{ background: t.card, borderRadius: 16, border: "1px solid " + t.bd, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: GR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff" }}>{seller.initials}</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{seller.name}</h1>
            <div style={{ fontSize: 12, color: t.tx2 }}>
              {seller.type === "dealer" ? "Dealer" : "Private seller"}
              {seller.city ? " · " + seller.city : ""}
              {seller.country ? ", " + seller.country : ""}
            </div>
            {seller.memberSince && <div style={{ fontSize: 11, color: t.tx3, marginTop: 4 }}>Member since {new Date(seller.memberSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</div>}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Vehicles for sale ({listings.length})</div>

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.tx3, fontSize: 14 }}>No active listings</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 20 }}>
          {listings.map(function(l) {
            return (
              <div key={l.id} onClick={function() { navigate("/listing/" + l.id); }} style={{ display: "flex", gap: 12, background: t.card, borderRadius: 14, border: "1px solid " + t.bd, overflow: "hidden", cursor: "pointer" }}>
                <img src={l.img} alt="" style={{ width: 140, height: 100, objectFit: "cover", flexShrink: 0 }}/>
                <div style={{ padding: "10px 12px 10px 0", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.tx }}>{l.title}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: BC, marginTop: 4 }}>€{Number(l.price).toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {[l.km ? Number(l.km).toLocaleString() + " km" : null, l.battery ? l.battery + " kWh" : null, l.range ? l.range + " km" : null, l.dc ? l.dc + " kW" : null].filter(Boolean).map(function(tag, i) {
                      return <span key={i} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: t.sec, color: t.tx2 }}>{tag}</span>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
