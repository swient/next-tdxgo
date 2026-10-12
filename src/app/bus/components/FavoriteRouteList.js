import { favoriteKey } from "../favorites";

export default function FavoriteRouteList({
  setSelectedRoute,
  setDirection,
  favorites,
  removeFavorite,
}) {
  const sorted = favorites.slice().sort((a, b) => {
    const nameA = a.SubRouteName?.Zh_tw || a.RouteName?.Zh_tw || "";
    const nameB = b.SubRouteName?.Zh_tw || b.RouteName?.Zh_tw || "";
    return nameA.localeCompare(nameB, "zh-Hant");
  });

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">收藏路線</h2>
      <div className="max-h-none sm:max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sorted.length === 0 && (
          <div className="text-gray-400">尚未收藏任何路線</div>
        )}
        {sorted.map((route) => (
          <div
            key={favoriteKey(route)}
            className="bg-gray-100 hover:bg-blue-200 text-gray-800 py-2 px-3 rounded flex flex-row items-center border border-gray-200"
          >
            <button
              className="flex-1 text-left flex flex-col items-start outline-none"
              onClick={() => {
                setSelectedRoute(route);
                setDirection(route.Direction || 0);
              }}
              style={{ background: "none", border: "none", padding: 0 }}
              tabIndex={-1}
            >
              <span className="font-bold text-blue-700 text-lg">
                {route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw}
              </span>
              <span className="text-sm text-gray-500">
                {route.DepartureStopNameZh} – {route.DestinationStopNameZh}
              </span>
              <span className="text-xs text-gray-400">
                {route.Operators?.map((op) => op.OperatorName.Zh_tw).join(
                  ", "
                )}
              </span>
            </button>
            <button
              className="ml-2 text-yellow-400 hover:text-yellow-500 text-xl"
              title="移除收藏"
              onClick={() => removeFavorite(favoriteKey(route))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
