"use client";
import React, { useState, useEffect, useRef } from "react";

const CITY_LIST = [
  { key: "Taipei", name: "臺北市" },
  { key: "NewTaipei", name: "新北市" },
  { key: "Keelung", name: "基隆市" },
  { key: "YilanCounty", name: "宜蘭縣" },
  { key: "Taoyuan", name: "桃園市" },
  { key: "HsinchuCounty", name: "新竹縣" },
  { key: "Hsinchu", name: "新竹市" },
  { key: "MiaoliCounty", name: "苗栗縣" },
  { key: "Taichung", name: "臺中市" },
  { key: "ChanghuaCounty", name: "彰化縣" },
  { key: "NantouCounty", name: "南投縣" },
  { key: "YunlinCounty", name: "雲林縣" },
  { key: "ChiayiCounty", name: "嘉義縣" },
  { key: "Chiayi", name: "嘉義市" },
  { key: "Tainan", name: "臺南市" },
  { key: "Kaohsiung", name: "高雄市" },
  { key: "PingtungCounty", name: "屏東縣" },
  { key: "TaitungCounty", name: "臺東縣" },
  { key: "HualienCounty", name: "花蓮縣" },
  { key: "PenghuCounty", name: "澎湖縣" },
  { key: "KinmenCounty", name: "金門縣" },
  { key: "LienchiangCounty", name: "連江縣" },
];

const BASE_URL = "https://tdx.transportdata.tw/api/basic/v2";

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

async function fetchWithError(url, config = {}) {
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

export default function BusPage() {
  const [city, setCity] = useState("");
  const [routes, setRoutes] = useState([]);
  const [routesError, setRoutesError] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [stopsError, setStopsError] = useState("");
  const [loadingStops, setLoadingStops] = useState(false);

  const [eta, setEta] = useState([]);
  const [etaError, setEtaError] = useState("");
  const [loadingEta, setLoadingEta] = useState(false);

  const [realTimeBuses, setRealTimeBuses] = useState([]);
  const [realTimeBusesError, setRealTimeBusesError] = useState("");
  const [loadingRealTimeBuses, setLoadingRealTimeBuses] = useState(false);

  const [direction, setDirection] = useState(0);

  const [groupType, setGroupType] = useState("number");
  const [searchText, setSearchText] = useState("");

  // 分組過濾函式
  function getGroupedRoutes(routes, groupType) {
    if (!Array.isArray(routes)) return [];
    switch (groupType) {
      case "number":
        // 純數字或數字+字母
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          return /^[0-9]+([A-Z]|區)?$/.test(name);
        });
      case "color":
        // 名稱含顏色
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          return /^(紅|藍|綠|棕|橘|黃)[0-9]/.test(name);
        });
      case "trunk":
        // 名稱含幹線
        return routes.filter((route) => {
          const name =
            route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
          return /幹線/.test(name);
        });
      case "other":
        // 其他
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

  // 取得有資料的分組
  const baseRoutes = routes.filter((route) => route.Direction === 0);

  const groupDefs = [
    { key: "number", label: "數字" },
    { key: "color", label: "顏色" },
    { key: "trunk", label: "幹線" },
    { key: "other", label: "其他" },
  ];
  const availableGroups = groupDefs.filter(
    (g) => getGroupedRoutes(baseRoutes, g.key).length > 0
  );

  const groupButtons = (
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
  );

  // 切換 tab 時自動切換 selectedRoute 為對應方向
  useEffect(() => {
    if (!selectedRoute || !routes.length) return;
    if (selectedRoute.Direction === direction) return;
    // 找到同 RouteUID、SubRouteName、OperatorID、不同方向的 route
    const match = routes.find(
      (r) =>
        r.RouteUID === selectedRoute.RouteUID &&
        r.SubRouteName?.Zh_tw === selectedRoute.SubRouteName?.Zh_tw &&
        JSON.stringify(r.Operators) ===
          JSON.stringify(selectedRoute.Operators) &&
        r.Direction === direction
    );
    if (match) setSelectedRoute(match);
  }, [direction]);

  // Cache避免重複請求
  const routesCache = useRef({});
  const stopsCache = useRef({});
  const etaCache = useRef({});
  const realTimeBusesCache = useRef({});

  // 取得路線
  useEffect(() => {
    if (!city) return;

    // 先檢查 cache
    const hasCache =
      routesCache.current[city] &&
      stopsCache.current[city] &&
      etaCache.current[city] &&
      realTimeBusesCache.current[city];

    if (hasCache) {
      setRoutes(routesCache.current[city]);
      setStops(stopsCache.current[city]);
      setEta(etaCache.current[city]);
      setRealTimeBuses(realTimeBusesCache.current[city]);
      setRoutesError("");
      setStopsError("");
      setEtaError("");
      setRealTimeBusesError("");
      setLoadingRoutes(false);
      setLoadingStops(false);
      setLoadingEta(false);
      setLoadingRealTimeBuses(false);
      return;
    }

    setLoadingRoutes(true);
    setLoadingStops(true);
    setLoadingEta(true);
    setLoadingRealTimeBuses(true);
    Promise.all([
      fetchWithError(`${BASE_URL}/Bus/Route/City/${city}?$format=JSON`),
      fetchWithError(`${BASE_URL}/Bus/StopOfRoute/City/${city}?$format=JSON`),
      fetchWithError(
        `${BASE_URL}/Bus/EstimatedTimeOfArrival/City/${city}?$format=JSON`
      ),
      fetchWithError(
        `${BASE_URL}/Bus/RealTimeNearStop/City/${city}?$format=JSON`
      ),
    ])
      .then(([routeRes, stopsRes, etaRes, realTimeRes]) => {
        // 處理路線
        if (routeRes.error) {
          setRoutesError(routeRes.error);
          setRoutes([]);
        } else {
          const allSubRoutes = [];
          routeRes.data.forEach((route) => {
            if (route.SubRoutes && route.SubRoutes.length > 0) {
              route.SubRoutes.forEach((sub) => {
                allSubRoutes.push({
                  ...route,
                  SubRouteUID: sub.SubRouteUID,
                  SubRouteID: sub.SubRouteID,
                  SubRouteName: sub.SubRouteName,
                  Direction: sub.Direction,
                  FirstBusTime: sub.FirstBusTime,
                  LastBusTime: sub.LastBusTime,
                  HolidayFirstBusTime: sub.HolidayFirstBusTime,
                  HolidayLastBusTime: sub.HolidayLastBusTime,
                });
              });
            } else {
              allSubRoutes.push(route);
            }
          });
          routesCache.current[city] = allSubRoutes;
          setRoutes(allSubRoutes);
          setRoutesError("");
        }
        // 處理站序
        if (stopsRes.error) {
          setStopsError(stopsRes.error);
        } else {
          stopsCache.current[city] = stopsRes.data;
          setStopsError("");
        }
        // 處理ETA
        if (etaRes.error) {
          setEtaError(etaRes.error);
        } else {
          etaCache.current[city] = etaRes.data;
          setEtaError("");
        }
        // 處理即時車輛
        if (realTimeRes.error) {
          setRealTimeBusesError(realTimeRes.error);
        } else {
          realTimeBusesCache.current[city] = realTimeRes.data;
          setRealTimeBusesError("");
        }
      })
      .finally(() => {
        setLoadingRoutes(false);
        setLoadingStops(false);
        setLoadingEta(false);
        setLoadingRealTimeBuses(false);
      });
  }, [city]);

  // 取得站序
  useEffect(() => {
    if (!selectedRoute) return;
    // 從 stopsCache.current[city] 過濾出符合的站序
    if (stopsCache.current[city]) {
      const filtered = stopsCache.current[city].filter(
        (s) =>
          s.RouteUID === selectedRoute.RouteUID &&
          s.SubRouteUID === selectedRoute.SubRouteUID
      );
      setStops(filtered);
      setStopsError("");
    } else {
      setStops([]);
      setStopsError("");
    }
  }, [selectedRoute, city]);

  // 取得ETA
  useEffect(() => {
    if (!selectedRoute) return;
    // 從 etaCache.current[city] 過濾出符合的 ETA
    if (etaCache.current[city]) {
      const filtered = etaCache.current[city].filter(
        (e) => e.RouteUID === selectedRoute.RouteUID
      );
      setEta(filtered);
      setEtaError("");
    } else {
      setEta([]);
      setEtaError("");
    }
  }, [selectedRoute, city]);

  // 取得即時車輛
  useEffect(() => {
    if (!selectedRoute || !city) return;
    // 從 realTimeBusesCache.current[city] 過濾出符合的即時車輛
    if (realTimeBusesCache.current[city]) {
      const filtered = realTimeBusesCache.current[city].filter(
        (bus) => bus.RouteUID === selectedRoute.RouteUID
      );
      setRealTimeBuses(filtered);
      setRealTimeBusesError("");
    } else {
      setRealTimeBuses([]);
      setRealTimeBusesError("");
    }
  }, [selectedRoute, city]);

  // UI
  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-80px)] bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <img src="/icons/bus.svg" alt="bus" className="w-8 h-8" />
          全台公車即時資訊
        </h1>
        {!city ? (
          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              選擇縣市
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CITY_LIST.map((c) => (
                <button
                  key={c.key}
                  className="bg-blue-100 hover:bg-blue-300 text-blue-800 font-medium py-2 rounded transition"
                  onClick={() => setCity(c.key)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        ) : !selectedRoute ? (
          <div>
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => setCity("")}
            >
              ← 返回縣市選擇
            </button>
            <h2 className="text-lg font-bold mb-2">
              {CITY_LIST.find((c) => c.key === city)?.name}公車
            </h2>
            {/* 分組切換按鈕 */}
            {groupButtons}
            {(loadingRoutes ||
              loadingStops ||
              loadingEta ||
              loadingRealTimeBuses) && (
              <div className="text-gray-500">載入中...</div>
            )}
            {(routesError || stopsError || etaError || realTimeBusesError) && (
              <div className="text-red-600 font-semibold">
                {routesError || stopsError || etaError || realTimeBusesError}
              </div>
            )}
            {!(
              loadingRoutes ||
              loadingStops ||
              loadingEta ||
              loadingRealTimeBuses
            ) &&
              !(
                routesError ||
                stopsError ||
                etaError ||
                realTimeBusesError
              ) && (
                <div className="max-h-none sm:max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getGroupedRoutes(
                    routes.filter((route) => route.Direction === 0),
                    groupType
                  )
                    .filter((route) => {
                      const name =
                        route.SubRouteName?.Zh_tw ||
                        route.RouteName?.Zh_tw ||
                        "";
                      return name.includes(searchText);
                    })
                    .sort((a, b) => {
                      const nameA =
                        a.SubRouteName?.Zh_tw || a.RouteName?.Zh_tw || "";
                      const nameB =
                        b.SubRouteName?.Zh_tw || b.RouteName?.Zh_tw || "";
                      return nameA.localeCompare(nameB, "zh-Hant");
                    })
                    .map((route, idx) => (
                      <button
                        key={
                          route.SubRouteUID +
                          "-" +
                          (route.Operators?.map((op) => op.OperatorID).join(
                            "_"
                          ) || "") +
                          "-" +
                          route.Direction
                        }
                        className="bg-gray-100 hover:bg-blue-200 text-gray-800 py-2 px-3 rounded flex flex-col items-start border border-gray-200"
                        onClick={() => {
                          setSelectedRoute(route);
                          setDirection(0);
                        }}
                      >
                        <span className="font-bold text-blue-700 text-lg">
                          {route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw}
                        </span>
                        <span className="text-sm text-gray-500">
                          {route.DepartureStopNameZh} →{" "}
                          {route.DestinationStopNameZh}
                        </span>
                        <span className="text-xs text-gray-400">
                          {route.Operators?.map(
                            (op) => op.OperatorName.Zh_tw
                          ).join(", ")}
                        </span>
                      </button>
                    ))}
                </div>
              )}
          </div>
        ) : (
          <div>
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => setSelectedRoute(null)}
            >
              ← 返回路線清單
            </button>
            <h2 className="text-lg font-bold mb-2">
              {selectedRoute.SubRouteName?.Zh_tw ||
                selectedRoute.RouteName?.Zh_tw}
              （{selectedRoute.DepartureStopNameZh} →{" "}
              {selectedRoute.DestinationStopNameZh}）
            </h2>
            {/* Tab 切換 */}
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-t ${
                  direction === 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setDirection(0)}
              >
                往
                {routes.find(
                  (r) =>
                    r.RouteUID === selectedRoute.RouteUID &&
                    r.SubRouteName?.Zh_tw ===
                      selectedRoute.SubRouteName?.Zh_tw &&
                    JSON.stringify(r.Operators) ===
                      JSON.stringify(selectedRoute.Operators) &&
                    r.Direction === 0
                )?.DestinationStopNameZh || "去程"}
              </button>
              {/* 只有有回程資料才顯示回程按鈕 */}
              {routes.some(
                (r) =>
                  r.RouteUID === selectedRoute.RouteUID &&
                  r.SubRouteName?.Zh_tw === selectedRoute.SubRouteName?.Zh_tw &&
                  JSON.stringify(r.Operators) ===
                    JSON.stringify(selectedRoute.Operators) &&
                  r.Direction === 1
              ) && (
                <button
                  className={`px-4 py-2 rounded-t ${
                    direction === 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setDirection(1)}
                >
                  往
                  {(() => {
                    const match = routes.find(
                      (r) =>
                        r.RouteUID === selectedRoute.RouteUID &&
                        r.SubRouteName?.Zh_tw ===
                          selectedRoute.SubRouteName?.Zh_tw &&
                        JSON.stringify(r.Operators) ===
                          JSON.stringify(selectedRoute.Operators) &&
                        r.Direction === 1
                    );
                    if (!match) return "回程";
                    // 找 stops 第一站
                    const stopList =
                      stops?.find(
                        (s) =>
                          s.RouteUID === match.RouteUID &&
                          s.SubRouteUID === match.SubRouteUID &&
                          s.Direction === 1
                      ) || null;
                    return (() => {
                      const stopsArr = stopList?.Stops;
                      return (
                        stopsArr?.[stopsArr.length - 1]?.StopName?.Zh_tw ||
                        match.DestinationStopNameZh ||
                        "回程"
                      );
                    })();
                  })()}
                </button>
              )}
            </div>
            <div>
              {(() => {
                return stops
                  .filter((s) => s.Direction === direction)
                  .map((s, idx) => (
                    <div
                      key={
                        s.SubRouteUID +
                        "-" +
                        (s.Operators?.map((op) => op.OperatorID).join("_") ||
                          "") +
                        "-" +
                        s.Direction +
                        "-" +
                        idx
                      }
                    >
                      <div className="font-semibold text-blue-700 mb-2">
                        {s.Operators?.[0]?.OperatorName?.Zh_tw || ""}
                      </div>
                      <ol className="border-l-2 border-blue-300 pl-4">
                        {s.Stops.map((stop) => {
                          const etaObj = eta.find(
                            (e) =>
                              e.StopUID === stop.StopUID &&
                              e.Direction === direction &&
                              e.RouteUID === selectedRoute.RouteUID
                          );
                          let etaText = "—";
                          if (etaObj) {
                            if (
                              etaObj.StopStatus === 0 &&
                              etaObj.EstimateTime != null
                            ) {
                              const min = Math.floor(etaObj.EstimateTime / 60);
                              if (min === 0) {
                                etaText = "進站中";
                              } else if (min === 1) {
                                etaText = "即將進站";
                              } else if (min < 60) {
                                etaText = `${min}分`;
                              } else {
                                const hr = Math.floor(min / 60);
                                etaText = `${hr}時${min % 60}分`;
                              }
                            } else {
                              switch (etaObj.StopStatus) {
                                case 1:
                                  etaText = "尚未發車";
                                  break;
                                case 2:
                                  etaText = "交管不停靠";
                                  break;
                                case 3:
                                  etaText = "末班車已過";
                                  break;
                                case 4:
                                  etaText = "今日未營運";
                                  break;
                                default:
                                  etaText = "—";
                              }
                            }
                          }
                          // 取得即時車輛
                          const busesHere = realTimeBuses.filter((bus) => {
                            const isMatch =
                              bus.RouteUID === selectedRoute.RouteUID &&
                              bus.Direction === direction &&
                              stop.StopSequence === bus.StopSequence &&
                              bus.DutyStatus === 0 &&
                              bus.BusStatus === 0;
                            if (!isMatch) return false;
                            // 取得該方向的最大 StopSequence
                            const stopsOfDir = stops
                              .filter((s) => s.Direction === direction)
                              .flatMap((s) => s.Stops || []);
                            const maxSeq = Math.max(
                              ...stopsOfDir.map((s) => s.StopSequence || 0)
                            );
                            // 若車輛在最後一站，視為停駛（不顯示）
                            if (bus.StopSequence === maxSeq) return false;
                            return true;
                          });
                          const isAnyBus = busesHere.length > 0;
                          return (
                            <li
                              key={stop.StopUID + "-" + stop.StopSequence}
                              className="flex justify-between items-center py-2 border-b border-gray-100 relative"
                            >
                              <span
                                className={`absolute left-[-1.37rem] w-2.5 h-2.5 rounded-full z-10 ${
                                  isAnyBus ? "bg-green-500" : "bg-blue-300"
                                }`}
                              ></span>
                              <span className="min-w-[6.5rem] text-green-700 text-xs font-bold">
                                {isAnyBus &&
                                  busesHere.map((bus) => (
                                    <span key={bus.PlateNumb}>
                                      {bus.PlateNumb}
                                    </span>
                                  ))}
                              </span>
                              <span className="text-gray-800 flex-1 text-center">
                                {stop.StopName.Zh_tw}
                              </span>
                              <span className="w-[6.5rem] text-blue-600 font-mono text-center">
                                {etaText}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
