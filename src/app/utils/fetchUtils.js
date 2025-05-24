// 取得 token 從 API Route
async function getOAuthHeader() {
  if (typeof window === "undefined") return {};
  if (
    !getOAuthHeader.cachedToken ||
    Date.now() > getOAuthHeader.tokenExpireAt
  ) {
    const resp = await fetch("/api/token", { method: "POST" });
    if (!resp.ok) throw new Error("OAuth2 token 取得失敗");
    const data = await resp.json();
    getOAuthHeader.cachedToken = data.access_token;
    getOAuthHeader.tokenExpireAt = Date.now() + (data.expires_in - 60) * 1000;
  }
  return { Authorization: `Bearer ${getOAuthHeader.cachedToken}` };
}

export async function fetchWithError(url, config = {}) {
  try {
    const headers = { ...(config.headers || {}), ...(await getOAuthHeader()) };
    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    if (res.status === 429) {
      return { data: null, error: "請求過於頻繁，請稍後再試" };
    }
    if (!res.ok) {
      return { data: null, error: "資料取得失敗，請稍後再試" };
    }
    const data = await res.json();
    return { data, error: null };
  } catch {
    return { data: null, error: "資料取得失敗，請稍後再試" };
  }
}
