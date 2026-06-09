import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BC, GR } from "../styles/theme";

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
const LayersIcon = (p) => <Ic {...p} d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} />;
const ChevL = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6" />} />;

const DURATIONS = [
  { id: "30d", name: "30 days", single: "€9.99", singleNum: 9.99, packTotal: "€69.99", packEach: "€7.00", plan: "list_30d", pack: "pack10_30d" },
  { id: "6m",  name: "6 months", single: "€49.99", singleNum: 49.99, packTotal: "€349.99", packEach: "€35.00", plan: "list_6m", pack: "pack10_6m" },
];

export default function PlanPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [dur, setDur] = useState("30d");
  const [firstListing, setFirstListing] = useState(null);
  const [isDealer, setIsDealer] = useState(false);
  const [credits, setCredits] = useState({ "30d": 0, "6m": 0 });
  const [busy, setBusy] = useState(false);

  const listingId = new URLSearchParams(window.location.search).get("listing");
  const D = DURATIONS.find((d) => d.id === dur);

  useEffect(() => {
    const { token, uid } = getSession();
    if (!uid || !token) { setFirstListing(true); return; }
    (async () => {
      try {
        const lr = await fetch(`${SB_URL}/rest/v1/listings?seller_id=eq.${uid}&select=id`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } });
        const rows = await lr.json();
        setFirstListing(Array.isArray(rows) ? rows.length <= 1 : true);
        const pr = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${uid}&select=seller_type,listing_credits_30d,listing_credits_6m`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } });
        const prof = (await pr.json())?.[0];
        if (prof) {
          setIsDealer(prof.seller_type === "dealer");
          setCredits({ "30d": prof.listing_credits_30d || 0, "6m": prof.listing_credits_6m || 0 });
        }
      } catch { setFirstListing(true); }
    })();
  }, []);

  const isFirst = firstListing !== false;
  const goBack = () => navigate(-1);

  async function checkout(plan) {
    const { token } = getSession();
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan, listingId }),
    });
    const text = await res.text();
    let data = {}; try { data = JSON.parse(text); } catch {}
    if (data.url) { window.location.href = data.url; return; }
    alert(`Checkout error (${res.status}): ${text || "no response"}`);
  }

  const startTrial = async () => {
    if (busy) return; setBusy(true);
    const { token } = getSession();
    if (listingId && token) {
      const until = new Date(); until.setDate(until.getDate() + 30);
      await fetch(`${SB_URL}/rest/v1/listings?id=eq.${listingId}`, {
        method: "PATCH",
        headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paid_until: until.toISOString(), plan: "trial", status: "active", renewal_notified: false }),
      });
    }
    navigate("/account?page=listings");
  };

  const useCredit = async () => {
    if (busy) return; setBusy(true);
    const { token } = getSession();
    try {
      const res = await fetch("/.netlify/functions/apply-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId, duration: dur }),
      });
      if (res.ok) { navigate("/account?page=listings"); return; }
      const txt = await res.text();
      alert(`Could not use credit: ${txt}`);
    } catch (e) { alert(`Error: ${e.message}`); }
    setBusy(false);
  };

  const paySingle = async () => { if (busy) return; setBusy(true); try { await checkout(D.plan); } catch (e) { alert(e.message); } setBusy(false); };
  const buyPack   = async () => { if (busy) return; setBusy(true); try { await checkout(D.pack); } catch (e) { alert(e.message); } setBusy(false); };

  const lbl = { fontSize: 12.5, fontWeight: 600, color: t.tx2 };

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: t.tx, maxWidth: 720, margin: "0 auto", padding: "0 6% 80px" }}>
      <div style={{ padding: "20px 0 8px" }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: t.tx2, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0, marginBottom: 18 }}>
          <ChevL size={14} /> Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{isFirst ? "Choose your plan" : "Keep your listing online"}</h1>
        <p style={{ fontSize: 14, color: t.tx2, margin: "6px 0 0", lineHeight: 1.6 }}>
          {isFirst ? "Your listing is live. Pick a plan to keep it active after your free trial." : "Pick how long to keep your listing visible."}
        </p>
      </div>

      {/* FREE TRIAL — first listing only */}
      {isFirst && (
        <>
          <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.08))", border: "1.5px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckIcon size={19} color="#fff" /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#059669" }}>30 days free — no card needed</div>
              <div style={{ fontSize: 12.5, color: t.tx2, marginTop: 2 }}>You won't be charged until your trial ends.</div>
            </div>
          </div>
          <button onClick={startTrial} disabled={busy} style={{ width: "100%", marginTop: 22, padding: "15px 0", borderRadius: 14, border: "none", background: GR, color: "#fff", fontSize: 15.5, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: "0 4px 16px rgba(255,117,0,0.32)" }}>
            {busy ? "Please wait…" : "Start 30-day free trial"}
          </button>
        </>
      )}

      {/* PAID OPTIONS */}
      {!isFirst && (
        <>
          {/* Duration toggle */}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {DURATIONS.map((d) => {
              const sel = dur === d.id;
              return (
                <button key={d.id} onClick={() => setDur(d.id)} style={{ flex: 1, padding: "14px 12px", borderRadius: 14, border: sel ? `2px solid ${BC}` : `1.5px solid ${t.brd}`, background: sel ? "rgba(255,117,0,0.05)" : t.card2, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ ...lbl }}>{d.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.tx, marginTop: 4 }}>{d.single}</div>
                  <div style={{ fontSize: 11, color: t.tx2 }}>per listing</div>
                </button>
              );
            })}
          </div>

          {/* Dealer: use a credit */}
          {isDealer && credits[dur] > 0 && (
            <button onClick={useCredit} disabled={busy} style={{ width: "100%", marginTop: 18, padding: "15px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(16,185,129,0.28)" }}>
              <LayersIcon size={17} color="#fff" /> Use 1 credit ({credits[dur]} {D.name} left)
            </button>
          )}

          {/* Pay for this listing */}
          <button onClick={paySingle} disabled={busy} style={{ width: "100%", marginTop: 14, padding: "15px 0", borderRadius: 14, border: "none", background: GR, color: "#fff", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(255,117,0,0.28)" }}>
            <CardIcon size={17} color="#fff" /> {busy ? "Please wait…" : `Pay for this listing — ${D.single}`}
          </button>

          {/* Dealer: buy a 10-pack */}
          {isDealer && (
            <div style={{ marginTop: 18, borderRadius: 16, border: `1.5px solid ${t.brd}`, background: t.card2, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <LayersIcon size={16} color={BC} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: t.tx }}>Dealer pack — 10 listings</span>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)", padding: "3px 9px", borderRadius: 20, marginLeft: "auto" }}>SAVE 30%</span>
              </div>
              <div style={{ fontSize: 12.5, color: t.tx2, lineHeight: 1.5, marginBottom: 12 }}>
                10 listing credits at <strong style={{ color: t.tx }}>{D.packEach}</strong> each ({D.name}). Use them whenever you publish or renew. Total <strong style={{ color: BC }}>{D.packTotal}</strong>.
              </div>
              <button onClick={buyPack} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: `2px solid ${BC}`, background: "rgba(255,117,0,0.04)", color: BC, fontSize: 14, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
                {busy ? "Please wait…" : `Buy 10-pack — ${D.packTotal}`}
              </button>
            </div>
          )}
        </>
      )}

      {/* TRUST LINE */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <ShieldIcon size={13} color={t.tx3} />
          <span style={{ fontSize: 11.5, color: t.tx2 }}>Secured by Stripe</span>
        </div>
      </div>
    </div>
  );
}
