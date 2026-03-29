import { useOutletContext } from "react-router-dom";
import { cs, BC, GR } from "../styles/theme";
import { Bolt, Srch, Car, ChR } from "../components/Icons";

export default function HomePage() {
  const { t } = useOutletContext();
  return (
    <>
      {/* Hero / Search */}
      <div style={{ padding: "24px 0 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>Find your next<br /><span style={{ color: BC }}>electric vehicle</span></h1>
        <p style={{ fontSize: 13, color: t.tx2, marginTop: 6 }}>Search thousands of EVs from sellers across Europe</p>
      </div>
      <div style={{ ...cs(t), padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${t.bd}`, background: t.inp, display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
            <Srch size={16} color={t.tx3} />
            <span style={{ fontSize: 13, color: t.tx3 }}>Search make, model...</span>
          </div>
          <button style={{ height: 42, padding: "0 20px", borderRadius: 10, border: "none", background: GR, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Search</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: t.tx3, textAlign: "center", padding: "40px 0" }}>
        Full homepage content will be integrated from the existing ev-homepage.tsx file.<br />
        This scaffold provides the routing, shared layout, header, and bottom nav.
      </div>
    </>
  );
}
