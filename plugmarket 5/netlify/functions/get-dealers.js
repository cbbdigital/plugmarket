// netlify/functions/get-dealers.js
const SB_URL = process.env.SUPABASE_URL || "https://tmftxqwqwceuiydleuag.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAIL = "cipribadic@gmail.com";

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return { statusCode: 405, body: "Method not allowed" };

  // Verify caller is admin
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { statusCode: 401, body: "Not authenticated" };

  const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });
  const userData = await userRes.json();
  if (userData?.email !== ADMIN_EMAIL) return { statusCode: 403, body: "Forbidden" };

  // Fetch all dealer profiles with service role key
  const r = await fetch(`${SB_URL}/rest/v1/profiles?seller_type=eq.dealer&select=id,full_name,phone,city,country,company_name,vat_number,website,vat_doc_url,dealer_verified,created_at&order=created_at.desc`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });

  const data = await r.json();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};
