// netlify/functions/apply-credit.js
// Lets a dealer spend ONE listing credit on a listing they own.
// Credit changes happen server-side (service role) so they can't be faked.

const SB_URL = process.env.SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function getUserId(token) {
  if (!token) return null;
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY || "", Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id || null;
  } catch { return null; }
}

async function sbGet(params, table) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: adminHeaders });
  return r.ok ? r.json() : [];
}
async function sbPatch(table, match, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, { method: "PATCH", headers: adminHeaders, body: JSON.stringify(data) });
  return r.ok;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { listingId, duration } = JSON.parse(event.body || "{}");
    if (!listingId || !["30d", "6m"].includes(duration)) return { statusCode: 400, body: "Bad request" };

    const token = (event.headers.authorization || event.headers.Authorization || "").replace(/^Bearer\s+/i, "");
    const userId = await getUserId(token);
    if (!userId) return { statusCode: 401, body: "Not authenticated" };

    const is6 = duration === "6m";
    const col = is6 ? "listing_credits_6m" : "listing_credits_30d";

    // Verify the listing belongs to this user
    const listings = await sbGet(`id=eq.${listingId}&seller_id=eq.${userId}&select=id,paid_until`, "listings");
    if (!listings.length) return { statusCode: 403, body: "Not your listing" };

    // Check credit balance
    const prof = await sbGet(`id=eq.${userId}&select=${col}`, "profiles");
    const credits = prof?.[0]?.[col] || 0;
    if (credits <= 0) return { statusCode: 400, body: "No credits available" };

    // Extend from the later of now or current paid_until
    const now = new Date();
    const current = listings[0].paid_until ? new Date(listings[0].paid_until) : now;
    const base = current > now ? current : now;
    const newUntil = addDays(base, is6 ? 180 : 30);

    await sbPatch("listings", `id=eq.${listingId}`, {
      paid_until: newUntil.toISOString(),
      plan: is6 ? "6m" : "30d",
      status: "active",
      renewal_notified: false,
    });
    await sbPatch("profiles", `id=eq.${userId}`, { [col]: credits - 1 });

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, creditsLeft: credits - 1 }) };
  } catch (e) {
    console.error("apply-credit error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};
