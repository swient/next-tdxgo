import { useCallback, useEffect, useState } from "react";
import { favoriteKey, getFavorites, saveFavorites } from "../favorites";

// 統一管理收藏狀態，並與 localStorage 同步
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());

    function onStorage(e) {
      if (e.key === "busFavorites") setFavorites(getFavorites());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback(
    (route) => {
      const key = favoriteKey(route);
      return favorites.some((f) => favoriteKey(f) === key);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((route) => {
    setFavorites((prev) => {
      const key = favoriteKey(route);
      const exists = prev.some((f) => favoriteKey(f) === key);
      const next = exists
        ? prev.filter((f) => favoriteKey(f) !== key)
        : [...prev, route];
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((key) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => favoriteKey(f) !== key);
      saveFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
