import { useLocation, useNavigate } from "react-router-dom";
import { BC, GR } from "../styles/theme";
import { Bolt, Bak, Sun, Moon } from "./Icons";

export default function Header({ t, dark, setDark }) {
  const loc = useLocation();
  const nav = useNavigate();
  const isHome = loc.pathname === "/";
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, borderBottom: `1px solid ${t.bd}` }}>
      <div style={{ position: "absolute", inset: 0, background: t.nav }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "10px 8%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isHome && <button onClick={() => { if (window.history.length > 2) nav(-1); else nav("/"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><Bak size={20} color={t.tx} /></button>}
          <div onClick={() => nav("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: GR, display: "flex", alignItems: "center", justifyContent: "center" }}><Bolt size={14} color="#fff" /></div>
            <span style={{ fontSize: 16, fontWeight: 700, color: t.tx }}>PlugMarket<span style={{ color: BC }}>.eu</span></span>
          </div>
        </div>
        <button onClick={() => setDark(!dark)} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${t.bd}`, background: t.inp, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {dark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color={t.tx3} />}
        </button>
      </div>
    </div>
  );
}
