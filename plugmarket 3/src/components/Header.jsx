import { useLocation, useNavigate } from "react-router-dom";
import { BC, GR } from "../styles/theme";
import { Bolt, Bak } from "./Icons";

export default function Header({ t }) {
  const loc = useLocation();
  const nav = useNavigate();
  const isHome = loc.pathname === "/";
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, borderBottom: `1px solid ${t.bd}` }}>
      <div style={{ position: "absolute", inset: 0, background: t.nav }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "12px 6%", display: "flex", alignItems: "center", gap: 10 }}>
        {!isHome && <button onClick={() => nav(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><Bak size={20} color={t.tx} /></button>}
        <div onClick={() => nav("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: GR, display: "flex", alignItems: "center", justifyContent: "center" }}><Bolt size={16} color="#fff" /></div>
          <span style={{ fontSize: 18, fontWeight: 700, color: t.tx }}>PlugMarket<span style={{ color: BC }}>.eu</span></span>
        </div>
      </div>
    </div>
  );
}
