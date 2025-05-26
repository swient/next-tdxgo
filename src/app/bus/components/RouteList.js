import React, { useState } from "react";

export default function RouteList({ routes, setSelectedRoute, setDirection }) {
  const [groupType, setGroupType] = useState("all");
  const [searchText, setSearchText] = useState("");

  function getGroupedRoutes(routes, groupType) {
    if (!Array.isArray(routes)) return [];
    switch (groupType) {
      case "all":
        return routes;
      case "number":
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          return /^[0-9]+([A-Z]|區)?$/.test(name);
        });
      case "color":
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          return /^(紅|藍|綠|棕|橘|黃)[0-9]/.test(name);
        });
      case "trunk":
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          return /幹線/.test(name);
        });
      case "other":
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          const isNumber = /^[0-9]+([A-Z]|區)?$/.test(name);
          const isColor = /^(紅|藍|綠|棕|橘|黃)[0-9]/.test(name);
          const isTrunk = /幹線/.test(name);
          return !isNumber && !isColor && !isTrunk;
        });
      default:
        return routes;
    }
  }

  const groupDefs = [
    { key: "all", label: "全部" },
    { key: "number", label: "數字" },
    { key: "color", label: "顏色" },
    { key: "trunk", label: "幹線" },
    { key: "other", label: "其他" },
  ];

  const baseRoutes = routes.filter((route) => route.Direction === 0);
  const availableGroups = groupDefs.filter(
    (g) => getGroupedRoutes(baseRoutes, g.key).length > 0
  );

  // 分組，優先 direction=0，否則 direction=1
  const grouped = {};
  routes.forEach((route) => {
    const key =
      (route.RouteUID || "") +
      "_" +
      (route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "");
    if (!(key in grouped)) {
      grouped[key] = route;
    } else if (grouped[key].Direction !== 0 && route.Direction === 0) {
      grouped[key] = route;
    }
  });
  const displayRoutes = Object.values(grouped);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {routes.length > 100 && (
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {availableGroups.map((g) => (
              <button
                key={g.key}
                className={`px-3 py-1 rounded ${
                  groupType === g.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setGroupType(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜尋路線"
          className="px-2 py-1 border rounded text-sm"
          style={{ minWidth: 100 }}
        />
      </div>
      <div className="max-h-none sm:max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
        {getGroupedRoutes(displayRoutes, groupType)
          .filter((route) => {
            const name =
              route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
            return name.includes(searchText);
          })
          .sort((a, b) => {
            const nameA = a.SubRouteName?.Zh_tw || a.RouteName?.Zh_tw || "";
            const nameB = b.SubRouteName?.Zh_tw || b.RouteName?.Zh_tw || "";
            return nameA.localeCompare(nameB, "zh-Hant");
          })
          .map((route) => (
            <button
              key={
                route.SubRouteUID +
                "-" +
                (route.Operators?.map((op) => op.OperatorID).join("_") || "") +
                "-" +
                route.Direction
              }
              className="bg-gray-100 hover:bg-blue-200 text-gray-800 py-2 px-3 rounded flex flex-col items-start border border-gray-200"
              onClick={() => {
                setSelectedRoute(route);
                setDirection(route.Direction);
              }}
            >
              <span className="font-bold text-blue-700 text-lg">
                {route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw}
              </span>
              <span className="text-sm text-gray-500">
                {route.DepartureStopNameZh} → {route.DestinationStopNameZh}
              </span>
              <span className="text-xs text-gray-400">
                {route.Operators?.map((op) => op.OperatorName.Zh_tw).join(", ")}
              </span>
            </button>
          ))}
      </div>
    </>
  );
}
