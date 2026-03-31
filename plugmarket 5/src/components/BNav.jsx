import { useLocation, useNavigate } from "react-router-dom";
import { BC } from "../styles/theme";
import { Home, Srch, Plus, Hrt, Chat, Usr } from "./Icons";

export default function BNav({ t, favCount, msgCount }) {
  const loc = useLocation();
  const nav = useNavigate();
  const items = [
    { id: "/", l: "Home", ic: a => <Home size={20} color={a ? BC : t.tx3} /> },
    { id: "/search", l: "Search", ic: a => <Srch size={20} color={a ? BC : t.tx3} /> },
    { id: "/sell", l: "Sell", ic: a => <Plus size={22} color={a ? BC : t.tx3} /> },
    { id: "/favourites", l: "Favs", ic: a => <Hrt size={20} color={a ? BC : t.tx3} />, badge: favCount },
    { id: "/messages", l: "Messages", ic: a => <Chat size={20} color={a ? BC : t.tx3} />, badge: msgCount },
    { id: "/account", l: "Account", ic: a => <Usr size={20} color={a ? BC : t.tx3} /> },
  ];
  const active = (id) => {
    if (id === "/") return loc.pathname === "/";
    return loc.pathname.startsWith(id);
  };
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, borderTop: `1px solid ${t.bd}` }}>
      <div style={{ position: "absolute", inset: 0, background: t.nav }} />
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", width: "100%", maxWidth: 600, justifyContent: "space-around", alignItems: "center", padding: "6px 0 8px" }}>
          {items.map(item => {
            const a = active(item.id);
            return (
              <button key={item.id} onClick={() => nav(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, background: "none", border: "none", cursor: "pointer", padding: "2px 8px", position: "relative" }}>
                <div style={{ position: "relative" }}>
                  {item.ic(a)}
                  {item.badge > 0 && (
                    <div style={{ position: "absolute", top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: "#f43f5e", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{item.badge}</div>
                  )}
                </div>
                <span style={{ fontSize: 9, fontWeight: a ? 600 : 400, color: a ? BC : t.tx3 }}>{item.l}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
