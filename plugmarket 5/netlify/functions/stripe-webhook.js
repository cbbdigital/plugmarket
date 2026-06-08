// netlify/functions/stripe-webhook.js
// Receives Stripe events. On a completed payment, extends the listing's
// paid_until (30d / 6m) or applies a boost (daily / weekly).

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const SB_URL = process.env.SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbPatch(table, match, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) console.error("sbPatch error:", await r.text());
  return r.ok ? r.json() : null;
}

async function sbGet(table, params) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  return r.ok ? r.json() : [];
}

function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    stripeEvent = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const s = stripeEvent.data.object;
    const { listing_id, plan } = s.metadata || {};
    if (!listing_id || !plan) return { statusCode: 200, body: "no metadata" };

    try {
      if (plan === "list_30d" || plan === "list_6m") {
        // Extend from the later of now or current paid_until
        const rows = await sbGet("listings", `id=eq.${listing_id}&select=paid_until`);
        const now = new Date();
        const current = rows?.[0]?.paid_until ? new Date(rows[0].paid_until) : now;
        const base = current > now ? current : now;
        const newUntil = addDays(base, plan === "list_6m" ? 180 : 30);
        await sbPatch("listings", `id=eq.${listing_id}`, {
          paid_until: newUntil.toISOString(),
          plan: plan === "list_6m" ? "6m" : "30d",
          status: "active",
          renewal_notified: false,
        });
      } else if (plan === "boost_daily" || plan === "boost_weekly") {
        const days = plan === "boost_weekly" ? 7 : 1;
        await sbPatch("listings", `id=eq.${listing_id}`, {
          is_boosted: true,
          boost_until: addDays(new Date(), days).toISOString(),
        });
      }
    } catch (e) {
      console.error("Webhook handling error:", e);
      return { statusCode: 500, body: "handling error" };
    }
  }

  return { statusCode: 200, body: "ok" };
};
