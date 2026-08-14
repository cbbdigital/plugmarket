import { useState } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BC, GR, cs } from "../styles/theme";
import { Mail, Lock, Usr, Eye, EyeOff, Chk } from "../components/Icons";

// Top-level so it isn't recreated on every render (which was stealing input focus after one keystroke)
function Field({ label, value, onChange, placeholder, type = "text", optional, t }) {
  const inpPlain = {
    width: "100%", height: 46, borderRadius: 12, border: `1px solid ${t.bd}`,
    background: t.inp, color: t.tx, padding: "0 14px", fontSize: 14,
    boxSizing: "border-box", outline: "none",
  };
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: t.tx2, marginBottom: 5, display: "block" }}>
        {label}{optional && <span style={{ color: t.tx3, fontWeight: 400 }}> (optional)</span>}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={inpPlain} />
    </div>
  );
}

export default function AuthPage() {
  const { t } = useOutletContext();
  const { signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const isSignup = loc.pathname === "/signup";

  const [mode, setMode] = useState(isSignup ? "signup" : "login"); // login | signup | forgot
  const [accountType, setAccountType] = useState("private"); // private | dealer — locked after signup

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Private
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Dealer
  const [vatNumber, setVatNumber] = useState("");
  const [dealerLegalName, setDealerLegalName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [dealerAddress, setDealerAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  const inp = {
    width: "100%", height: 46, borderRadius: 12, border: `1px solid ${t.bd}`,
    background: t.inp, color: t.tx, padding: "0 44px 0 44px", fontSize: 14,
    boxSizing: "border-box", outline: "none",
  };
  const inpPlain = { ...inp, padding: "0 14px" };

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "forgot") {
      const { error: err } = await resetPassword(email);
      setLoading(false);
      if (err) setError(err.message);
      else setSuccess("Check your email for a reset link.");
      return;
    }

    if (mode === "signup") {
      // Validation by account type
      if (accountType === "private") {
        if (!name.trim()) { setError("Please enter your name"); setLoading(false); return; }
      } else {
        if (!dealerLegalName.trim()) { setError("Please enter the dealer's official name"); setLoading(false); return; }
        if (!firmName.trim()) { setError("Please enter your firm name"); setLoading(false); return; }
        if (!vatNumber.trim()) { setError("Please enter your VAT number"); setLoading(false); return; }
        if (!dealerAddress.trim()) { setError("Please enter your dealer address"); setLoading(false); return; }
      }
      if (!email.trim()) { setError("Please enter your email"); setLoading(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }

      const profileData = accountType === "private"
        ? { fullName: name, phone, address }
        : {
            fullName: dealerLegalName,
            vatNumber, dealerLegalName, firmName,
            address: dealerAddress, mapsUrl, website,
          };

      const { error: err } = await signUp({ email, password, sellerType: accountType, ...profileData });
      setLoading(false);
      if (err) setError(err.message);
      else { setSignedUp(true); setSuccess(
        accountType === "dealer"
          ? "Check your email to confirm. After your first login you'll upload your VAT document to finish setup."
          : "Check your email to confirm your account."
      ); }
      return;
    }

    // Login
    const { error: err } = await signIn({ email, password });
    setLoading(false);
    if (err) setError(/confirm/i.test(err.message) ? "Please confirm your email first — check your inbox for the link." : err.message);
    else nav("/account");
  }

  async function handleGoogle() {
    setError("");
    const { error: err } = await signInWithOAuth("google");
    if (err) setError(err.message);
  }


  if (signedUp) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 0", textAlign: "center" }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Mail size={28} color="#10b981" />
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>Check your email</h1>
        <p style={{ fontSize: 14, color: t.tx2, margin: "10px 0 0", lineHeight: 1.6 }}>
          We sent a confirmation link to<br/><strong style={{ color: t.tx }}>{email}</strong>
        </p>
        <p style={{ fontSize: 13, color: t.tx3, margin: "18px 0 0", lineHeight: 1.6 }}>
          You need to confirm your email before you can sign in.
          {accountType === "dealer" && " After your first login you'll upload your VAT document to finish verification."}
        </p>
        <button onClick={() => { setSignedUp(false); setMode("login"); setSuccess(""); setPassword(""); nav("/login"); }} style={{ marginTop: 26, padding: "12px 26px", borderRadius: 12, border: `1px solid ${t.bd}`, background: t.card, color: t.tx, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>
          {mode === "forgot" ? "Reset password" : mode === "signup" ? "Create account" : "Welcome back"}
        </h1>
        <p style={{ fontSize: 13, color: t.tx2, marginTop: 6 }}>
          {mode === "forgot" ? "We'll send you a reset link" : mode === "signup" ? "Join thousands of EV buyers and sellers across Europe" : "Sign in to manage your listings and messages"}
        </p>
      </div>

      {/* Account type — first thing on signup */}
      {mode === "signup" && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.tx2, marginBottom: 6, display: "block" }}>Account type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ v: "private", l: "Private" }, { v: "dealer", l: "Dealer" }].map(tp => (
              <button
                key={tp.v}
                type="button"
                onClick={() => { setAccountType(tp.v); setError(""); }}
                style={{ flex: 1, height: 46, borderRadius: 12, border: accountType === tp.v ? `2px solid ${BC}` : `1px solid ${t.bd}`, background: accountType === tp.v ? "rgba(255,117,0,0.06)" : t.inp, color: accountType === tp.v ? BC : t.tx, fontSize: 14, fontWeight: accountType === tp.v ? 600 : 400, cursor: "pointer" }}
              >
                {tp.l}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: t.tx3, margin: "6px 2px 0" }}>This can't be changed later.</p>
        </div>
      )}

      {/* Google OAuth — login + private signup only */}
      {mode !== "forgot" && !(mode === "signup" && accountType === "dealer") && (
        <>
          <button onClick={handleGoogle} style={{ width: "100%", height: 46, borderRadius: 12, border: `1px solid ${t.bd}`, background: t.card, color: t.tx, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>


          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: t.bd }} />
            <span style={{ fontSize: 12, color: t.tx3 }}>or</span>
            <div style={{ flex: 1, height: 1, background: t.bd }} />
          </div>
        </>
      )}

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* PRIVATE signup fields */}
        {mode === "signup" && accountType === "private" && (
          <>
            <div style={{ position: "relative" }}>
              <Usr size={18} color={t.tx3} style={{ position: "absolute", left: 14, top: 14 }} />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inp} />
            </div>
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="+40 ..." optional  t={t} />
            <Field label="Address" value={address} onChange={setAddress} placeholder="Street, city, country" optional  t={t} />
          </>
        )}

        {/* DEALER signup fields */}
        {mode === "signup" && accountType === "dealer" && (
          <>
            <Field label="Dealer official name" value={dealerLegalName} onChange={setDealerLegalName} placeholder="Registered legal name"  t={t} />
            <Field label="Firm name" value={firmName} onChange={setFirmName} placeholder="Trading / brand name"  t={t} />
            <Field label="VAT number" value={vatNumber} onChange={setVatNumber} placeholder="e.g. RO12345678"  t={t} />
            <Field label="Dealer address" value={dealerAddress} onChange={setDealerAddress} placeholder="Street, city, country"  t={t} />
            <Field label="Google Maps link" value={mapsUrl} onChange={setMapsUrl} placeholder="https://maps.google.com/..." optional  t={t} />
            <Field label="Website" value={website} onChange={setWebsite} placeholder="https://..." optional  t={t} />
            <div style={{ fontSize: 11, color: t.tx3, background: t.sec, borderRadius: 8, padding: "8px 12px", lineHeight: 1.5 }}>
              You'll upload a photo of your VAT document after your first login to finish verification.
            </div>
          </>
        )}

        {/* Email */}
        <div style={{ position: "relative" }}>
          <Mail size={18} color={t.tx3} style={{ position: "absolute", left: 14, top: 14 }} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inp} />
        </div>

        {/* Password */}
        {mode !== "forgot" && (
          <div style={{ position: "relative" }}>
            <Lock size={18} color={t.tx3} style={{ position: "absolute", left: 14, top: 14 }} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type={showPw ? "text" : "password"} style={inp} />
            <div onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: 14, cursor: "pointer" }}>
              {showPw ? <EyeOff size={18} color={t.tx3} /> : <Eye size={18} color={t.tx3} />}
            </div>
          </div>
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right" }}>
            <span onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} style={{ fontSize: 12, color: BC, cursor: "pointer", fontWeight: 500 }}>Forgot password?</span>
          </div>
        )}

        {error && <div style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
        {success && <div style={{ fontSize: 12, color: "#10b981", background: "rgba(16,185,129,0.08)", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}><Chk size={14} color="#10b981" />{success}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", height: 46, borderRadius: 12, border: "none", background: GR, color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 2px 10px rgba(255,117,0,0.3)" }}>
          {loading ? "..." : mode === "forgot" ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </div>

      {/* Toggle mode */}
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: t.tx2 }}>
        {mode === "forgot" ? (
          <span>Back to <span onClick={() => setMode("login")} style={{ color: BC, cursor: "pointer", fontWeight: 600 }}>sign in</span></span>
        ) : mode === "signup" ? (
          <span>Already have an account? <span onClick={() => { setMode("login"); nav("/login"); }} style={{ color: BC, cursor: "pointer", fontWeight: 600 }}>Sign in</span></span>
        ) : (
          <span>Don't have an account? <span onClick={() => { setMode("signup"); nav("/signup"); }} style={{ color: BC, cursor: "pointer", fontWeight: 600 }}>Create one</span></span>
        )}
      </div>
    </div>
  );
}
