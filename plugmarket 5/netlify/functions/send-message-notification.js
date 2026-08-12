// netlify/functions/send-message-notification.js
// Sends an email notification to the recipient when they receive a new message.

const SB_URL = process.env.SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://plugmarket.eu";

async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}` },
  });
  return r.ok ? r.json() : [];
}

async function getUserEmail(userId) {
  const r = await fetch(`${SB_URL}/auth/v1/admin/users/${userId}`, {
    headers: { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.email || null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  if (!RESEND_API_KEY) return { statusCode: 500, body: "RESEND_API_KEY not configured" };

  try {
    const { conversationId, senderId, messageText } = JSON.parse(event.body || "{}");
    if (!conversationId || !senderId || !messageText) return { statusCode: 400, body: "Missing fields" };

    // Get conversation to find recipient
    const convos = await sbGet(`conversations?id=eq.${conversationId}&select=buyer_id,seller_id,listing_id`);
    const conv = convos?.[0];
    if (!conv) return { statusCode: 404, body: "Conversation not found" };

    const recipientId = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id;

    // Get sender name
    const senderProfiles = await sbGet(`profiles?id=eq.${senderId}&select=full_name`);
    const senderName = senderProfiles?.[0]?.full_name || "Someone";

    // Get listing info
    let carName = "a vehicle";
    if (conv.listing_id) {
      const listings = await sbGet(`listings?id=eq.${conv.listing_id}&select=make,model`);
      if (listings?.[0]) carName = `${listings[0].make} ${listings[0].model}`;
    }

    // Get recipient email
    const recipientEmail = await getUserEmail(recipientId);
    if (!recipientEmail) return { statusCode: 404, body: "Recipient email not found" };

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PlugMarket.eu <notifications@plugmarket.eu>",
        to: [recipientEmail],
        subject: `New message from ${senderName} about ${carName}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0e0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e14;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- LOGO -->
        <tr><td align="center" style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#FF7500;border-radius:10px;width:34px;height:34px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-size:16px;line-height:34px;display:block;">&#9889;</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;">Plug</span><span style="font-size:20px;font-weight:700;color:#FF7500;">Market.eu</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CARD -->
        <tr><td style="background:#1a1a24;border-radius:18px;border:1px solid rgba(255,255,255,0.07);padding:32px;">

          <!-- ICON -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:20px;">
              <div style="width:56px;height:56px;background:rgba(255,117,0,0.12);border-radius:14px;border:1px solid rgba(255,117,0,0.25);display:inline-block;text-align:center;line-height:56px;font-size:24px;">&#128172;</div>
            </td></tr>
          </table>

          <h1 style="margin:0 0 6px;font-size:19px;font-weight:700;color:#ffffff;text-align:center;">You have a new message</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
            <strong style="color:#FF7500;">${senderName}</strong> sent you a message about <strong style="color:#ffffff;">${carName}</strong>
          </p>

          <!-- MESSAGE BUBBLE -->
          <div style="background:#0e0e14;border-radius:12px;border:1px solid rgba(255,255,255,0.07);padding:16px 18px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:600;color:#FF7500;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${senderName}</div>
            <div style="font-size:14px;color:#e5e7eb;line-height:1.6;">${messageText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </div>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:24px;">
              <a href="${SITE_URL}/messages" style="display:inline-block;background:linear-gradient(135deg,#FF7500,#FF9533);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:11px;">Reply to message</a>
            </td></tr>
          </table>

          <!-- DIVIDER -->
          <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:16px;">
            <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;line-height:1.6;">
              You received this because someone messaged you on PlugMarket.eu.<br>
              <a href="${SITE_URL}/account" style="color:#FF7500;">Manage notification settings</a>
            </p>
          </div>

        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding-top:20px;" align="center">
          <p style="margin:0;font-size:11px;color:#4b5563;">
            <a href="${SITE_URL}" style="color:#FF7500;text-decoration:none;">PlugMarket.eu</a> · Europe's EV Marketplace
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
      return { statusCode: 500, body: `Email send failed: ${err}` };
    }

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("send-message-notification error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};
