import { Outlet } from "react-router-dom";
import Header from "./Header";
import BNav from "./BNav";

export default function Layout({ t, dark, setDark }) {
  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", color: t.tx }}>
      <Header t={t} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "66px 6% 80px" }}>
        <Outlet context={{ t, dark, setDark }} />
      </div>
      <BNav t={t} />
    </div>
  );
}
