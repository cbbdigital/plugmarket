import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BC } from "../styles/theme";
import { Home, Srch, Plus, Hrt, Chat, Usr } from "./Icons";

export default function BNav({ t, favCount, msgCount }) {
  const loc = useLocation();
  const nav = useNavigate();

  // Check if logged in
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem("pm_session");
      if (s) { const p = JSON.parse(s); if (p && p.access_token) setLoggedIn(true); else setLoggedIn(false); }
      else setLoggedIn(false);
    } catch { setLoggedIn(false); }
  }, [loc.pathname]);

  const allItems = [
    { id: "/", l: "Home", ic: (a, c) => <Home size={20} color={c} /> },
    { id: "/search", l: "Search", ic: (a, c) => <Srch size={20} color={c} /> },
    { id: "/sell", l: "Sell", ic: (a, c) => <Plus size={22} color={c} /> },
    { id: "/favourites", l: "Favs", ic: (a, c) => <Hrt size={20} color={c} />, badge: favCount },
    { id: "/messages", l: "Messages", ic: (a, c) => <Chat size={20} color={c} />, badge: msgCount, requiresAuth: true },
    { id: "/account", l: "Account", ic: (a, c) => <Usr size={20} color={c} /> },
  ];

  const items = allItems.filter(item => !item.requiresAuth || loggedIn);

  const active = (id) => {
    if (id === "/") return loc.pathname === "/";
    return loc.pathname.startsWith(id);
  };

  const activeIdx = items.findIndex(item => active(item.id));

  // Measure active button for sliding pill
  const btnRefs = useRef([]);
  const containerRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (activeIdx < 0 || !btnRefs.current[activeIdx] || !containerRef.current) return;
      const b = btnRefs.current[activeIdx].getBoundingClientRect();
      const c = containerRef.current.getBoundingClientRect();
      setPill({ left: b.left - c.left, width: b.width });
    };
    measure();
    const t = setTimeout(() => { measure(); setReady(true); }, 60);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, [activeIdx, items.length]);

  const dk = t.bg === "#131319" || t.bg === "#000" || t.bg === "#000000";

  return (
    <div style={{
      position: "fixed", bottom: 14, left: 0, right: 0, zIndex: 9999,
      display: "flex", justifyContent: "center", pointerEvents: "none",
    }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "flex", alignItems: "center",
          padding: "5px 5px",
          borderRadius: 26,
          background: dk ? "rgba(28,28,36,0.7)" : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: dk ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.05)",
          boxShadow: dk
            ? "0 6px 32px rgba(0,0,0,0.55), inset 0 0.5px 0 rgba(255,255,255,0.06)"
            : "0 6px 32px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.7)",
          pointerEvents: "auto",
        }}
      >
        {/* Sliding highlight pill */}
        {activeIdx >= 0 && (
          <div style={{
            position: "absolute", top: 5, left: pill.left, width: pill.width,
            height: "calc(100% - 10px)", borderRadius: 22,
            background: dk ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
            transition: ready ? "left 0.32s cubic-bezier(0.4,0,0.15,1), width 0.32s cubic-bezier(0.4,0,0.15,1)" : "none",
            zIndex: 0, pointerEvents: "none",
          }} />
        )}

        {items.map((item, idx) => {
          const a = activeIdx === idx;
          const ic = a
            ? (dk ? "#fff" : "#1a1a2e")
            : (dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)");
          const lc = a
            ? (dk ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.78)")
            : (dk ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.28)");
          return (
            <button
              key={item.id}
              ref={el => btnRefs.current[idx] = el}
              onClick={() => nav(item.id)}
              style={{
                position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                background: "none", border: "none", cursor: "pointer",
                padding: "7px 13px", borderRadius: 20, minWidth: 48,
                transition: "transform 0.12s ease",
              }}
              onTouchStart={e => { e.currentTarget.style.transform = "scale(0.9)"; }}
              onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.93)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ position: "relative" }}>
                {item.ic(a, ic)}
                {item.badge > 0 && (
                  <div style={{
                    position: "absolute", top: -5, right: -9,
                    minWidth: 16, height: 16, borderRadius: 8,
                    background: "#f43f5e", color: "#fff",
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                    boxShadow: "0 2px 6px rgba(244,63,94,0.45)",
                  }}>{item.badge}</div>
                )}
              </div>
              <span style={{
                fontSize: 9, fontWeight: a ? 600 : 400, color: lc,
                transition: "color 0.25s ease", whiteSpace: "nowrap",
              }}>{item.l}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
