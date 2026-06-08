import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BC, GR } from "../styles/theme";

// ── Supabase REST ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
function getSession() {
  try {
    const raw = localStorage.getItem("sb-tmftxqwqwceuiydleuag-auth-token");
    if (!raw) return {};
    const s = JSON.parse(raw);
    return { token: s.access_token, uid: s.user?.id };
  } catch { return {}; }
}

const Ic = ({ d, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const CheckIcon = (p) => <Ic {...p} d={<polyline points="20 6 9 17 4 12" />} />;
const ShieldIcon = (p) => <Ic {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />;
const CardIcon = (p) => <Ic {...p} d={<><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>} />;
const ChevL = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6" />} />;

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "€9.99",
    per: "/month",
    priceLabel: "€9.99/month",
    badge: null,
    note: null,
    features: ["Unlimited photo uploads", "Appear in search results", "Message notifications", "Edit listing anytime"],
  },
  {
    id: "sixmonth",
    name: "6 Months",
    price: "€49.99",
    per: "/6 mo",
    priceLabel: "€49.99 for 6 months",
    badge: "SAVE 17%",
    note: "≈ €8.33/month",
    features: ["Everything in Monthly", "Priority placement", "Featured badge", "Dedicated support"],
  },
];

export default function PlanPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("monthly");
  const [firstListing, setFirstListing] = useState(null); // null = loading
  const [busy, setBusy] = useState(false);

  const listingId = new URLSearchParams(window.location.search).get("listing");

  // Determine if this is the user's first listing.
  // The just-published listing is already inserted, so count <= 1 means first.
  useEffect(() => {
    const { token, uid } = getSession();
    if (!uid || !token) { setFirstListing(true); return; }
    (async () => {
      try {
        const r = await fetch(
          `${SB_URL}/rest/v1/listings?seller_id=eq.${uid}&select=id`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, Prefer: "count=exact" } }
        );
        const rows = await r.json();
        setFirstListing(Array.isArray(rows) ? rows.length <= 1 : true);
      } catch {
        setFirstListing(true);
      }
    })();
  }, []);

  const selected = PLANS.find((p) => p.id === plan);
  const goBack = () => navigate(-1);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    const { token } = getSession();

    if (isFirst) {
      // Free 30-day trial — set paid_until, no payment.
      if (listingId && token) {
        const until = new Date(); until.setDate(until.getDate() + 30);
        await fetch(`${SB_URL}/rest/v1/listings?id=eq.${listingId}`, {
          method: "PATCH",
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ paid_until: until.toISOString(), plan: "trial", status: "active", renewal_notified: false }),
        });
      }
      setBusy(false);
      navigate("/account?page=listings");
      return;
    }

    // Paid — open Stripe Checkout
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan === "sixmonth" ? "list_6m" : "list_30d", listingId }),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}
      if (data.url) { window.location.href = data.url; return; }
      alert(`Checkout error (${res.status}): ${text || "no response"}`);
    } catch (e) {
      alert(`Checkout failed: ${e.message}`);
    }
    setBusy(false);
  };

  const isFirst = firstListing !== false; // treat loading as "first" optimistically

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: t.tx, maxWidth: 720, margin: "0 auto", padding: "0 6% 80px" }}>

      {/* HEADER */}
      <div style={{ padding: "20px 0 8px" }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: t.tx2, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0, marginBottom: 18 }}>
          <ChevL size={14} /> Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Choose your plan</h1>
        <p style={{ fontSize: 14, color: t.tx2, margin: "6px 0 0", lineHeight: 1.6 }}>
          {isFirst
            ? "Your listing is live. Pick a plan to keep it active after your free trial."
            : "Pick a plan to keep your listing active."}
        </p>
      </div>

      {/* FREE TRIAL BANNER — first listing only */}
      {isFirst && (
        <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.08))", border: "1.5px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckIcon size={19} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#059669" }}>30 days free — no card needed</div>
            <div style={{ fontSize: 12.5, color: t.tx2, marginTop: 2 }}>You won't be charged until your trial ends.</div>
          </div>
        </div>
      )}

      {/* PLAN CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22 }}>
        {PLANS.map((pl) => {
          const sel = plan === pl.id;
          return (
            <div
              key={pl.id}
              onClick={() => setPlan(pl.id)}
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
              {pl.badge && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{pl.badge}</div>
              )}
              {sel && (
                <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: BC, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon size={12} color="#fff" /></div>
              )}

              <div style={{ fontSize: 12.5, fontWeight: 600, color: t.tx2, marginBottom: 10 }}>{pl.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: t.tx }}>{pl.price}</span>
                <span style={{ fontSize: 12.5, color: t.tx2 }}>{pl.per}</span>
              </div>
              {pl.note && <div style={{ fontSize: 11.5, color: "#d97706", fontWeight: 700, marginTop: 3 }}>{pl.note}</div>}

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                {pl.features.map((f, i) => (
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
        {isFirst
          ? <>The first <strong>30 days are free</strong>. After that, you'll be charged <strong style={{ color: BC }}>{selected.priceLabel}</strong>.</>
          : <>Your listing will be charged <strong style={{ color: BC }}>{selected.priceLabel}</strong>, starting today.</>}
      </div>

      {/* CTA */}
      <button
        onClick={confirm}
        disabled={busy}
        style={{ width: "100%", marginTop: 16, padding: "15px 0", borderRadius: 14, border: "none", background: GR, color: "#fff", fontSize: 15.5, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: "0 4px 16px rgba(255,117,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {busy ? "Please wait…" : isFirst ? "Start 30-day free trial" : `Continue to payment — ${selected.price}${selected.per}`}
      </button>

      {/* TRUST LINE */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <ShieldIcon size={13} color={t.tx3} />
          <span style={{ fontSize: 11.5, color: t.tx2 }}>Secured by Stripe</span>
        </div>
        <div style={{ width: 1, height: 12, background: t.brd }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <CardIcon size={13} color={t.tx3} />
          <span style={{ fontSize: 11.5, color: t.tx2 }}>{isFirst ? "Card added after trial" : "Secure card payment"}</span>
        </div>
      </div>
    </div>
  );
}
