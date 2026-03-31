import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BNav from "./BNav";

export default function Layout({ t, dark, setDark }) {
  const [favCount, setFavCount] = useState(0);

  // Poll localStorage for fav count (updates when other pages change it)
  useEffect(() => {
    const update = () => {
      try {
        const favs = JSON.parse(localStorage.getItem("pm_favs") || "[]");
        // Only count real listing IDs (UUIDs), not evdb_ prefixed ones
        const real = favs.filter(id => typeof id === "string" && id.length > 10 && !id.startsWith("evdb_"));
        setFavCount(real.length);
      } catch { setFavCount(0); }
    };
    update();
    // Listen for storage changes + poll every 2s
    window.addEventListener("storage", update);
    const interval = setInterval(update, 2000);
    return () => { window.removeEventListener("storage", update); clearInterval(interval); };
  }, []);

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", color: t.tx }}>
      <Header t={t} dark={dark} setDark={setDark} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 8% 80px" }}>
        <Outlet context={{ t, dark, setDark }} />
      </div>
      <BNav t={t} favCount={favCount} />
    </div>
  );
}
