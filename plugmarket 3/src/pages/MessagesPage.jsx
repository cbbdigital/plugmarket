import { useOutletContext } from "react-router-dom";

export default function MessagesPage() {
  const { t } = useOutletContext();
  return (
    <div style={{ padding: "20px 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Messages</h2>
      <p style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>Full messages page with conversation list and chat view will be migrated from ev-messages.jsx.</p>
    </div>
  );
}
