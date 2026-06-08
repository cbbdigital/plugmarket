import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BC, GR } from "../styles/theme";

const Ic = ({ d, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const CheckIcon = (p) => <Ic {...p} d={<polyline points="20 6 9 17 4 12" />} />;
const BoltIcon = (p) => <Ic {...p} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />} />;
const TrendIcon = (p) => <Ic {...p} d={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>} />;
const ShieldIcon = (p) => <Ic {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />;
const ChevL = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6" />} />;

const BOOSTS = [
  {
    id: "daily",
    name: "Daily Boost",
    price: "€2.99",
    per: "/ 24 hours",
    sub: "Top of search results for 24 hours.",
    badge: null,
    features: ["Pinned to top of search", "Highlighted card border", "“Boosted” label"],
  },
  {
    id: "weekly",
    name: "Weekly Boost",
    price: "€5.99",
    per: "/ 7 days",
    sub: "Top placement for a full week.",
    badge: "BEST VALUE",
    features: ["Everything in Daily", "7 full days of visibility", "≈ €0.86/day"],
  },
];

export default function BoostPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [boost, setBoost] = useState("weekly");
  const [busy, setBusy] = useState(false);

  const listingId = new URLSearchParams(window.location.search).get("listing");

  function getToken() {
    try {
      const raw = localStorage.getItem("sb-tmftxqwqwceuiydleuag-auth-token");
      return raw ? JSON.parse(raw).access_token : null;
    } catch { return null; }
  }

  const selected = BOOSTS.find((b) => b.id === boost);
  const goBack = () => navigate(-1);
  const confirm = async () => {
    if (busy) return;
    if (!listingId) { alert("No listing selected to boost."); return; }
    setBusy(true);
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ plan: boost === "daily" ? "boost_daily" : "boost_weekly", listingId }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      alert("Could not start checkout. Please try again.");
    } catch {
      alert("Could not start checkout. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: t.tx, maxWidth: 720, margin: "0 auto", padding: "0 6% 80px" }}>

      {/* HEADER */}
      <div style={{ padding: "20px 0 8px" }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: t.tx2, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0, marginBottom: 18 }}>
          <ChevL size={14} /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: GR, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendIcon size={20} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Boost your listing</h1>
        </div>
        <p style={{ fontSize: 14, color: t.tx2, margin: "10px 0 0", lineHeight: 1.6 }}>
          Push your car to the top of search results and get seen first.
        </p>
      </div>

      {/* BOOST CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>
        {BOOSTS.map((b) => {
          const sel = boost === b.id;
          return (
            <div
              key={b.id}
              onClick={() => setBoost(b.id)}
              style={{
                borderRadius: 16,
                border: sel ? `2px solid ${BC}` : `1.5px solid ${t.brd}`,
                background: sel ? "rgba(255,117,0,0.05)" : t.card2,
                padding: 20,
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              {b.badge && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: GR, color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{b.badge}</div>
              )}
              {sel && (
                <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: BC, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon size={12} color="#fff" /></div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <BoltIcon size={14} color={BC} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: t.tx2 }}>{b.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: t.tx }}>{b.price}</span>
                <span style={{ fontSize: 12.5, color: t.tx2 }}>{b.per}</span>
              </div>
              <div style={{ fontSize: 11.5, color: t.tx2, marginTop: 5, lineHeight: 1.5 }}>{b.sub}</div>

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                {b.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <CheckIcon size={13} color="#10b981" />
                    <span style={{ fontSize: 12, color: t.tx2 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY LINE */}
      <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: t.card2, border: `1px solid ${t.brd}`, fontSize: 13, color: t.tx, lineHeight: 1.6 }}>
        You'll be charged a one-time <strong style={{ color: BC }}>{selected.price}</strong> for the {selected.id === "daily" ? "24-hour" : "7-day"} boost.
      </div>

      {/* CTA */}
      <button
        onClick={confirm}
        disabled={busy}
        style={{ width: "100%", marginTop: 16, padding: "15px 0", borderRadius: 14, border: "none", background: GR, color: "#fff", fontSize: 15.5, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: "0 4px 16px rgba(255,117,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <BoltIcon size={17} color="#fff" /> {busy ? "Please wait…" : `Boost now — ${selected.price}`}
      </button>

      {/* TRUST LINE */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
        <ShieldIcon size={13} color={t.tx3} />
        <span style={{ fontSize: 11.5, color: t.tx2 }}>One-time payment · Secured by Stripe</span>
      </div>
    </div>
  );
}
