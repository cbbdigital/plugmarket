// netlify/functions/check-expiring.js
// Runs daily. Two jobs:
//  1. Listings expiring within 7 days (not yet notified): create in-app
//     notification + send email, then mark renewal_notified = true.
//  2. Listings past paid_until that are still active: set status = 'expired'.

const SB_URL = process.env.SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE = process.env.SITE_URL || process.env.URL || "https://plugmarket.eu";

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function sbGet(table, params) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers });
  return r.ok ? r.json() : [];
}
async function sbPatch(table, match, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, { method: "PATCH", headers, body: JSON.stringify(data) });
  return r.ok;
}
async function sbInsert(table, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method: "POST", headers, body: JSON.stringify(data) });
  return r.ok;
}

// Look up the owner's email from auth via admin API
async function getEmail(userId) {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users/${userId}`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.email || null;
  } catch { return null; }
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !to) return; // email is optional until a provider key is set
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "PlugMarket <noreply@plugmarket.eu>",
        to, subject, html,
      }),
    });
  } catch (e) { console.error("email error:", e); }
}

exports.handler = async () => {
  const now = new Date();
  const in7 = new Date(now); in7.setDate(in7.getDate() + 7);

  // 1) Expiring within 7 days, not yet notified
  const soon = await sbGet(
    "listings",
    `status=eq.active&renewal_notified=eq.false&paid_until=gte.${now.toISOString()}&paid_until=lte.${in7.toISOString()}&select=id,make,model,seller_id,paid_until`
  );

  for (const l of soon) {
    const title = `${l.make} ${l.model}`;
    const endDate = new Date(l.paid_until).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    const renewLink = `${SITE}/plan?listing=${l.id}&renew=1`;

    // In-app notification
    await sbInsert("notifications", {
      user_id: l.seller_id,
      type: "renewal",
      title: "Keep your listing online?",
      body: `Your ${title} listing goes offline on ${endDate}. Renew to keep it visible.`,
      listing_id: l.id,
      read: false,
    });

    // Email
    const email = await getEmail(l.seller_id);
    await sendEmail(
      email,
      `Keep your ${title} listing online?`,
      `<p>Your <strong>${title}</strong> listing on PlugMarket goes offline on <strong>${endDate}</strong>.</p>
       <p>If you'd like to keep it visible to buyers, renew it here:</p>
       <p><a href="${renewLink}" style="background:#FF7500;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">Keep it online</a></p>
       <p style="color:#888;font-size:12px;">If you no longer want to sell, no action is needed — the listing will simply go offline.</p>`
    );

    await sbPatch("listings", `id=eq.${l.id}`, { renewal_notified: true });
  }

  // 2) Past due -> offline
  const expired = await sbGet("listings", `status=eq.active&paid_until=lt.${now.toISOString()}&select=id`);
  for (const l of expired) {
    await sbPatch("listings", `id=eq.${l.id}`, { status: "expired" });
  }

  return { statusCode: 200, body: JSON.stringify({ notified: soon.length, expired: expired.length }) };
};
