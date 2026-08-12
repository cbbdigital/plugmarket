import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BNav from "./BNav";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Read the Supabase session from localStorage (token + user id)
function getSession() {
  try {
    const raw = localStorage.getItem("sb-tmftxqwqwceuiydleuag-auth-token");
    if (raw) { const s = JSON.parse(raw); if (s?.access_token) return { token: s.access_token, uid: s.user?.id }; }
  } catch {}
  return {};
}

// Count only real listing favourites (exclude evdb_ recommender hearts)
function countReal(ids) {
  return ids.filter(id => typeof id === "string" && id.length > 10 && !id.startsWith("evdb_")).length;
}

export default function Layout({ t, dark, setDark }) {
  const [favCount, setFavCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    let alive = true;

    const update = async () => {
      const { token, uid } = getSession();

      // Favourites: prefer Supabase (authoritative), fall back to localStorage
      if (token && uid) {
        try {
          const r = await fetch(`${SB_URL}/rest/v1/favourites?user_id=eq.${uid}&select=listing_id`, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const rows = await r.json();
            let ids = Array.isArray(rows) ? rows.map(x => x.listing_id).filter(id => typeof id === "string" && id.length > 10 && !id.startsWith("evdb_")) : [];
            // Drop orphaned favourites — only count listings that still exist
            if (ids.length) {
              try {
                const inList = ids.map(encodeURIComponent).join(",");
                const lr = await fetch(`${SB_URL}/rest/v1/listings?id=in.(${inList})&select=id`, {
                  headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
                });
                if (lr.ok) {
                  const existing = await lr.json();
                  const liveIds = new Set((Array.isArray(existing) ? existing : []).map(x => x.id));
                  ids = ids.filter(id => liveIds.has(id));
                }
              } catch {}
            }
            if (alive) setFavCount(ids.length);
            try { localStorage.setItem("pm_favs", JSON.stringify(ids)); } catch {}
          }
        } catch {
          try { setFavCount(countReal(JSON.parse(localStorage.getItem("pm_favs") || "[]"))); } catch {}
        }
      } else {
        try { setFavCount(countReal(JSON.parse(localStorage.getItem("pm_favs") || "[]"))); } catch { setFavCount(0); }
      }

      // Unread messages — fetch directly from Supabase
      if (token && uid) {
        try {
          const r = await fetch(`${SB_URL}/rest/v1/conversations?or=(buyer_id.eq.${uid},seller_id.eq.${uid})&select=buyer_id,buyer_unread_count,seller_unread_count`, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const rows = await r.json();
            const total = Array.isArray(rows) ? rows.reduce((s, c) => {
              return s + (c.buyer_id === uid ? (c.buyer_unread_count || 0) : (c.seller_unread_count || 0));
            }, 0) : 0;
            if (alive) setMsgCount(total);
          }
        } catch {}
      } else {
        try { setMsgCount(parseInt(localStorage.getItem("pm_unread_msgs") || "0", 10) || 0); } catch { setMsgCount(0); }
      }
    };

    update();
    const onStorage = () => update();
    const onFocus = () => update();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    const interval = setInterval(update, 4000);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", color: t.tx }}>
      <Header t={t} dark={dark} setDark={setDark} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 8% 80px" }}>
        <Outlet context={{ t, dark, setDark }} />
      </div>
      <BNav t={t} favCount={favCount} msgCount={msgCount} />
    </div>
  );
}
