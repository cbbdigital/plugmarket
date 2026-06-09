// netlify/functions/create-checkout-session.js
// Creates a one-time Stripe Checkout session for a listing payment or boost.
// All plans are ONE-TIME payments that add online time / boost to a listing.

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const SB_URL = process.env.SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";

// Map a plan code -> { priceId, kind }
function planConfig(plan) {
  switch (plan) {
    case "list_30d":      return { priceId: process.env.STRIPE_PRICE_30D,           kind: "listing" };
    case "list_6m":       return { priceId: process.env.STRIPE_PRICE_6M,            kind: "listing" };
    case "boost_daily":   return { priceId: process.env.STRIPE_PRICE_BOOST_DAILY,   kind: "boost" };
    case "boost_weekly":  return { priceId: process.env.STRIPE_PRICE_BOOST_WEEKLY,  kind: "boost" };
    case "pack10_30d":    return { priceId: process.env.STRIPE_PRICE_PACK10_30D,    kind: "pack" };
    case "pack10_6m":     return { priceId: process.env.STRIPE_PRICE_PACK10_6M,     kind: "pack" };
    default: return null;
  }
}

// Verify the Supabase access token and return the user id.
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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  try {
    const { plan, listingId } = JSON.parse(event.body || "{}");
    const cfg = planConfig(plan);
    if (!cfg || !cfg.priceId) return { statusCode: 400, body: "Unknown or unconfigured plan" };
    // Packs are account-level; a listingId is optional (applies 1 credit to it on success)
    if (cfg.kind !== "pack" && !listingId) return { statusCode: 400, body: "Missing listingId" };

    const authHeader = event.headers.authorization || event.headers.Authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const userId = await getUserId(token);
    if (!userId) return { statusCode: 401, body: "Not authenticated" };

    const site = process.env.SITE_URL || process.env.URL || "https://plugmarket.eu";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: cfg.priceId, quantity: 1 }],
      // Save the card for convenience on future manual renewals
      payment_intent_data: { setup_future_usage: "off_session" },
      metadata: { user_id: userId, listing_id: listingId ? String(listingId) : "none", plan },
      success_url: `${site}/account?page=listings&paid=1`,
      cancel_url: cfg.kind === "boost"
        ? `${site}/boost?listing=${listingId}`
        : (listingId ? `${site}/plan?listing=${listingId}` : `${site}/account?page=listings`),
    });

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};
