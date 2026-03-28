import { useOutletContext } from "react-router-dom";

export default function SearchPage() {
  const { t } = useOutletContext();
  return (
    <div style={{ padding: "20px 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Search</h2>
      <p style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>Full search/filter page will be migrated from ev-homepage.tsx SearchPage component.</p>
    </div>
  );
}
