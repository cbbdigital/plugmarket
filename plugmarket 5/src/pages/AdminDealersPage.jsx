import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BC, GR } from "../styles/theme";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZnR4cXdxd2NldWl5ZGxldWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDA2MzEsImV4cCI6MjA5MDI3NjYzMX0.k5TOln3e4M8PxH2tH22-6BsFimH84InVfNOWP8riaCM";
const ADMIN_EMAIL = "cipribadic@gmail.com";

const hdrs = (token) => ({ apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" });

const I = ({ d, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const CheckIcon = p => <I {...p} d={<polyline points="20 6 9 17 4 12"/>}/>;
const XIcon = p => <I {...p} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}/>;
const RefreshIcon = p => <I {...p} d={<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>}/>;
const ShieldIcon = p => <I {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}/>;
const EyeIcon = p => <I {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>;

const TABS = ["pending", "approved", "rejected"];

export default function AdminDealersPage() {
  const ctx = useOutletContext();
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();

  const [tab, setTab] = useState("pending");
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const t = ctx?.t;

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && !isAdmin) navigate("/");
  }, [authLoading, user]);

  const load = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const r = await fetch(`${SB_URL}/rest/v1/profiles?seller_type=eq.dealer&select=id,full_name,phone,city,country,company_name,vat_number,website,vat_doc_url,dealer_verified,created_at&order=created_at.desc`, {
        headers: hdrs(session.access_token),
      });
      const rows = await r.json();
      setDealers(Array.isArray(rows) ? rows : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (session?.access_token && isAdmin) load(); }, [session]);

  const approve = async (id) => {
    setBusy(id + "_approve");
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${id}`, {
      method: "PATCH",
      headers: hdrs(session.access_token),
      body: JSON.stringify({ dealer_verified: true }),
    });
    setDealers(prev => prev.map(d => d.id === id ? { ...d, dealer_verified: true } : d));
    setBusy(null);
  };

  const reject = async (id) => {
    setBusy(id + "_reject");
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${id}`, {
      method: "PATCH",
      headers: hdrs(session.access_token),
      body: JSON.stringify({ dealer_verified: false, seller_type: "dealer_rejected" }),
    });
    setDealers(prev => prev.map(d => d.id === id ? { ...d, dealer_verified: false, seller_type: "dealer_rejected" } : d));
    setBusy(null);
  };

  if (!t || authLoading) return null;
  if (!isAdmin) return null;

  const filtered = dealers.filter(d => {
    if (tab === "pending") return d.dealer_verified == null || d.dealer_verified === false && d.seller_type === "dealer";
    if (tab === "approved") return d.dealer_verified === true;
    if (tab === "rejected") return d.seller_type === "dealer_rejected";
    return true;
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: t.tx, maxWidth: 800, margin: "0 auto", padding: "0 5% 80px" }}>

      {/* HEADER */}
      <div style={{ padding: "24px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ShieldIcon size={20} color={BC} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Dealer Verification</h1>
          </div>
          <p style={{ fontSize: 13, color: t.tx2, margin: 0 }}>{dealers.length} dealer{dealers.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.bd}`, background: t.sec, color: t.tx2, fontSize: 13, cursor: "pointer" }}>
          <RefreshIcon size={14} /> Refresh
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", background: tab === tb ? BC : t.sec, color: tab === tb ? "#fff" : t.tx2, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
            {tb} ({dealers.filter(d => {
              if (tb === "pending") return d.dealer_verified == null || (d.dealer_verified === false && d.seller_type === "dealer");
              if (tb === "approved") return d.dealer_verified === true;
              if (tb === "rejected") return d.seller_type === "dealer_rejected";
              return false;
            }).length})
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.tx3, fontSize: 13 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.tx3, fontSize: 13 }}>No {tab} dealers.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(d => (
            <div key={d.id} style={{ background: t.card, border: `1px solid ${t.bd}`, borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* TOP ROW */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.tx }}>{d.company_name || d.full_name || "—"}</div>
                  <div style={{ fontSize: 12, color: t.tx3, marginTop: 2 }}>{d.city}{d.country ? `, ${d.country}` : ""} · {d.phone || "no phone"}</div>
                  {d.vat_number && <div style={{ fontSize: 11, color: t.tx3, marginTop: 2 }}>VAT: {d.vat_number}</div>}
                  {d.website && <div style={{ fontSize: 11, color: BC, marginTop: 2 }}>{d.website}</div>}
                </div>
                <div style={{ fontSize: 11, color: t.tx3 }}>
                  {new Date(d.created_at).toLocaleDateString("en-GB")}
                </div>
              </div>

              {/* VAT DOCUMENT */}
              {d.vat_doc_url ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.tx3, marginBottom: 6 }}>VAT DOCUMENT</div>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={d.vat_doc_url}
                      alt="VAT doc"
                      style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 10, border: `1px solid ${t.bd}`, objectFit: "contain", background: t.sec, cursor: "pointer" }}
                      onClick={() => setLightbox(d.vat_doc_url)}
                    />
                    <button onClick={() => setLightbox(d.vat_doc_url)} style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.5)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <EyeIcon size={13} color="#fff" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>No VAT document uploaded yet.</div>
              )}

              {/* ACTIONS */}
              {tab === "pending" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => approve(d.id)}
                    disabled={busy === d.id + "_approve"}
                    style={{ flex: 1, height: 40, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: busy === d.id + "_approve" ? 0.7 : 1 }}
                  >
                    <CheckIcon size={14} color="#fff" /> {busy === d.id + "_approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => reject(d.id)}
                    disabled={busy === d.id + "_reject"}
                    style={{ flex: 1, height: 40, borderRadius: 10, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: busy === d.id + "_reject" ? 0.7 : 1 }}
                  >
                    <XIcon size={14} color="#ef4444" /> {busy === d.id + "_reject" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              )}
              {tab === "approved" && <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckIcon size={13} color="#10b981" /> Verified dealer</div>}
              {tab === "rejected" && <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><XIcon size={13} color="#ef4444" /> Rejected</div>}
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XIcon size={18} color="#fff" />
          </button>
        </div>
      )}
    </div>
  );
}
