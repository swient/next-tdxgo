import { useRef, useState, useEffect } from "react";
const BASE_URL = "https://tdx.transportdata.tw/api/basic/v2";

import { fetchWithError } from "../../utils/fetchUtils";

// 依 RouteUID 過濾站序並保留去/回兩方向，若同一 RouteUID 存在多個子路線名稱，再依名稱精準過濾
function filterStopsByRoute(allStops, route) {
  const byRoute = (allStops || []).filter((s) => s.RouteUID === route.RouteUID);
  const names = new Set(
    byRoute.map((s) => s.SubRouteName?.Zh_tw || s.RouteName?.Zh_tw || "")
  );
  if (names.size <= 1) return byRoute;
  const name = route.SubRouteName?.Zh_tw || route.RouteName?.Zh_tw || "";
  const byName = byRoute.filter(
    (s) => (s.SubRouteName?.Zh_tw || s.RouteName?.Zh_tw || "") === name
  );
  return byName.length > 0 ? byName : byRoute;
}

// 封裝所有 bus API 狀態與邏輯
export function useBusApi() {
  const [city, setCity] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [eta, setEta] = useState([]);
  const [realTimeBuses, setRealTimeBuses] = useState([]);
  const [direction, setDirection] = useState(0);
  const [showFavorite, setShowFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    routes: "",
    stops: "",
    eta: "",
    realTimeBuses: "",
  });

  // Cache避免重複請求
  const routesCache = useRef({});
  const stopsCache = useRef({});
  const etaCache = useRef({});
  const realTimeBusesCache = useRef({});

  // 取得路線
  useEffect(() => {
    if (!city) return;

    const hasCache =
      routesCache.current[city.key] &&
      stopsCache.current[city.key] &&
      etaCache.current[city.key] &&
      realTimeBusesCache.current[city.key];

    if (hasCache) {
      setRoutes(routesCache.current[city.key]);
      setStops(stopsCache.current[city.key]);
      setEta(etaCache.current[city.key]);
      setRealTimeBuses(realTimeBusesCache.current[city.key]);
      setErrors({
        routes: "",
        stops: "",
        eta: "",
        realTimeBuses: "",
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetchWithError(`${BASE_URL}/Bus/Route/City/${city.key}?$format=JSON`),
      fetchWithError(
        `${BASE_URL}/Bus/StopOfRoute/City/${city.key}?$format=JSON`
      ),
      fetchWithError(
        `${BASE_URL}/Bus/EstimatedTimeOfArrival/City/${city.key}?$format=JSON`
      ),
      fetchWithError(
        `${BASE_URL}/Bus/RealTimeNearStop/City/${city.key}?$format=JSON`
      ),
    ])
      .then(([routeRes, stopsRes, etaRes, realTimeRes]) => {
        // 處理路線
        if (routeRes.error) {
          setRoutes([]);
          setErrors((prev) => ({ ...prev, routes: routeRes.error }));
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
                  DepartureStopNameZh: sub.DepartureStopNameZh
                    ? sub.DepartureStopNameZh
                    : sub.Direction === 0
                    ? route.DepartureStopNameZh
                    : route.DestinationStopNameZh,
                  DestinationStopNameZh: sub.DestinationStopNameZh
                    ? sub.DestinationStopNameZh
                    : sub.Direction === 0
                    ? route.DestinationStopNameZh
                    : route.DepartureStopNameZh,
                });
              });
            } else {
              allSubRoutes.push(route);
            }
          });
          routesCache.current[city.key] = allSubRoutes;
          setRoutes(allSubRoutes);
          setErrors((prev) => ({ ...prev, routes: "" }));
        }
        // 處理站序
        if (stopsRes.error) {
          setStops([]);
          setErrors((prev) => ({ ...prev, stops: stopsRes.error }));
        } else {
          stopsCache.current[city.key] = stopsRes.data;
          setErrors((prev) => ({ ...prev, stops: "" }));
        }
        // 處理ETA
        if (etaRes.error) {
          setEta([]);
          setErrors((prev) => ({ ...prev, eta: etaRes.error }));
        } else {
          etaCache.current[city.key] = etaRes.data;
          setErrors((prev) => ({ ...prev, eta: "" }));
        }
        // 處理即時車輛
        if (realTimeRes.error) {
          setRealTimeBuses([]);
          setErrors((prev) => ({ ...prev, realTimeBuses: realTimeRes.error }));
        } else {
          realTimeBusesCache.current[city.key] = realTimeRes.data;
          setErrors((prev) => ({ ...prev, realTimeBuses: "" }));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [city]);

  // 取得站序、ETA、即時車輛
  useEffect(() => {
    if (!selectedRoute) return;
    // 我的收藏模式且有選擇路線時直接請求
    if (showFavorite && selectedRoute.City && selectedRoute.RouteName?.Zh_tw) {
      const routeUID = selectedRoute.RouteUID;
      const routeName = encodeURIComponent(selectedRoute.RouteName.Zh_tw);
      setLoading(true);
      setErrors((prev) => ({
        ...prev,
        stops: "",
        eta: "",
        realTimeBuses: "",
      }));
      Promise.all([
        fetchWithError(
          `${BASE_URL}/Bus/StopOfRoute/City/${selectedRoute.City}/${routeName}?$format=JSON`
        ),
        fetchWithError(
          `${BASE_URL}/Bus/EstimatedTimeOfArrival/City/${selectedRoute.City}?$filter=RouteUID eq '${routeUID}'&$format=JSON`
        ),
        fetchWithError(
          `${BASE_URL}/Bus/RealTimeNearStop/City/${selectedRoute.City}?$filter=RouteUID eq '${routeUID}'&$format=JSON`
        ),
      ])
        .then(([stopsRes, etaRes, realTimeRes]) => {
          if (stopsRes.error) {
            setStops([]);
            setErrors((prev) => ({ ...prev, stops: stopsRes.error }));
          } else {
            setStops(filterStopsByRoute(stopsRes.data, selectedRoute));
            setErrors((prev) => ({ ...prev, stops: "" }));
          }
          if (etaRes.error) {
            setEta([]);
            setErrors((prev) => ({ ...prev, eta: etaRes.error }));
          } else {
            setEta(
              (etaRes.data || []).filter((e) => e.RouteUID === routeUID)
            );
            setErrors((prev) => ({ ...prev, eta: "" }));
          }
          if (realTimeRes.error) {
            setRealTimeBuses([]);
            setErrors((prev) => ({
              ...prev,
              realTimeBuses: realTimeRes.error,
            }));
          } else {
            setRealTimeBuses(
              (realTimeRes.data || []).filter(
                (bus) => bus.RouteUID === routeUID
              )
            );
            setErrors((prev) => ({ ...prev, realTimeBuses: "" }));
          }
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    // 其餘情境使用原本快取
    if (!city) return;
    // 取得站序
    if (stopsCache.current[city.key]) {
      const filtered = filterStopsByRoute(
        stopsCache.current[city.key],
        selectedRoute
      );
      setStops(filtered);
      setErrors((prev) => ({ ...prev, stops: "" }));
    } else {
      setStops([]);
      setErrors((prev) => ({ ...prev, stops: "" }));
    }
    // 取得ETA
    if (etaCache.current[city.key]) {
      const filtered = etaCache.current[city.key].filter(
        (e) => e.RouteUID === selectedRoute.RouteUID
      );
      setEta(filtered);
      setErrors((prev) => ({ ...prev, eta: "" }));
    } else {
      setEta([]);
      setErrors((prev) => ({ ...prev, eta: "" }));
    }
    // 取得即時車輛
    if (realTimeBusesCache.current[city.key]) {
      const filtered = realTimeBusesCache.current[city.key].filter(
        (bus) => bus.RouteUID === selectedRoute.RouteUID
      );
      setRealTimeBuses(filtered);
      setErrors((prev) => ({ ...prev, realTimeBuses: "" }));
    } else {
      setRealTimeBuses([]);
      setErrors((prev) => ({ ...prev, realTimeBuses: "" }));
    }
  }, [selectedRoute, city, showFavorite]);

  // 更新 ETA 與即時車輛
  async function refreshLiveBusStatus() {
    const targetCity = city
      ? city.key
      : showFavorite && selectedRoute
      ? selectedRoute.City
      : null;
    if (!targetCity) return;

    const isFavoriteMode = !city && showFavorite && selectedRoute;
    const query = isFavoriteMode
      ? `?$filter=RouteUID eq '${selectedRoute.RouteUID}'&$format=JSON`
      : `?$format=JSON`;
    const [etaRes, realTimeRes] = await Promise.all([
      fetchWithError(
        `${BASE_URL}/Bus/EstimatedTimeOfArrival/City/${targetCity}${query}`
      ),
      fetchWithError(
        `${BASE_URL}/Bus/RealTimeNearStop/City/${targetCity}${query}`
      ),
    ]);
    if (etaRes.error) {
      return { error: "取得 ETA 失敗" };
    } else {
      if (city) etaCache.current[city.key] = etaRes.data;
      setEta(etaRes.data);
      setErrors((prev) => ({ ...prev, eta: "" }));
    }
    if (realTimeRes.error) {
      return { error: "取得即時車輛失敗" };
    } else {
      if (city) realTimeBusesCache.current[city.key] = realTimeRes.data;
      setRealTimeBuses(realTimeRes.data);
      setErrors((prev) => ({ ...prev, realTimeBuses: "" }));
    }
  }

  return {
    city,
    setCity,
    routes,
    selectedRoute,
    setSelectedRoute,
    stops,
    eta,
    realTimeBuses,
    direction,
    setDirection,
    showFavorite,
    setShowFavorite,
    loading,
    errors,
    refreshLiveBusStatus,
  };
}
