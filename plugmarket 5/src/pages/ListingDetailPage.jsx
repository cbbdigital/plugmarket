import { useOutletContext, useParams } from "react-router-dom";

export default function ListingDetailPage() {
  const { t } = useOutletContext();
  const { id } = useParams();
  return (
    <div style={{ padding: "20px 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Listing #{id}</h2>
      <p style={{ fontSize: 13, color: t.tx2, marginTop: 8 }}>Full listing detail page will be migrated from ev-listing-detail.jsx.</p>
    </div>
  );
}
