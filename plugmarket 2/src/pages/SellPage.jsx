import { useOutletContext } from "react-router-dom";

export default function SellPage() {
  const { t } = useOutletContext();
  return (
    <div style={{ padding: "20px 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Sell Your EV</h2>
      <p style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>Full 6-step sell wizard will be migrated from ev-sell-page.jsx.</p>
    </div>
  );
}
