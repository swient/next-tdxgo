// Next.js API Route：取得 TDX token
export async function POST() {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;

  const resp = await fetch(
    "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    }
  );
  if (!resp.ok) {
    return new Response(JSON.stringify({ error: "OAuth2 token 取得失敗" }), {
      status: 500,
    });
  }
  const data = await resp.json();
  return new Response(
    JSON.stringify({
      access_token: data.access_token,
      expires_in: data.expires_in,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
