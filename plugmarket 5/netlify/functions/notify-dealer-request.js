// netlify/functions/notify-dealer-request.js
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://plugmarket.eu";
const ADMIN_EMAIL = "cipribadic@gmail.com";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  if (!RESEND_API_KEY) return { statusCode: 500, body: "RESEND_API_KEY not configured" };

  try {
    const { dealerName, vatDocUrl } = JSON.parse(event.body || "{}");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PlugMarket.eu <notifications@plugmarket.eu>",
        to: [ADMIN_EMAIL],
        subject: `New dealer verification request — ${dealerName || "Unknown"}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0e0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e14;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

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

        <tr><td style="background:#1a1a24;border-radius:18px;border:1px solid rgba(255,255,255,0.07);padding:32px;">

          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:56px;height:56px;background:rgba(255,117,0,0.12);border-radius:14px;border:1px solid rgba(255,117,0,0.25);display:inline-block;text-align:center;line-height:56px;font-size:24px;">&#128203;</div>
          </div>

          <h1 style="margin:0 0 8px;font-size:19px;font-weight:700;color:#ffffff;text-align:center;">New dealer verification request</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
            <strong style="color:#FF7500;">${dealerName || "A dealer"}</strong> has uploaded their VAT document and is awaiting verification.
          </p>

          ${vatDocUrl ? `<div style="margin-bottom:24px;text-align:center;">
            <img src="${vatDocUrl}" alt="VAT Document" style="max-width:100%;max-height:200px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);object-fit:contain;" />
          </div>` : ""}

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:24px;">
              <a href="${SITE_URL}/admin/dealers" style="display:inline-block;background:linear-gradient(135deg,#FF7500,#FF9533);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:11px;">Review in admin panel</a>
            </td></tr>
          </table>

          <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:16px;">
            <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;">PlugMarket.eu · Admin notification</p>
          </div>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return { statusCode: 500, body: `Email failed: ${err}` };
    }

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("notify-dealer-request error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};
