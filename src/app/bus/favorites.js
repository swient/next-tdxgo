const STORAGE_KEY = "busFavorites";

// 以「路線 UID + 子路線名稱」作為收藏的唯一鍵（跨縣市、跨業者不會互撞）
export function favoriteKey(route) {
  return (
    (route?.RouteUID || "") +
    "|" +
    (route?.SubRouteName?.Zh_tw || route?.RouteName?.Zh_tw || "")
  );
}

export function getFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage 寫入失敗（如容量已滿）時忽略
  }
}
