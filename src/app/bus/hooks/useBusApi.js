import { useRef, useState, useEffect } from "react";
const BASE_URL = "https://tdx.transportdata.tw/api/basic/v2";

import { fetchWithError } from "../../utils/fetchUtils";

// 封裝所有 bus API 狀態與邏輯
export function useBusApi() {
  const [city, setCity] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [eta, setEta] = useState([]);
  const [realTimeBuses, setRealTimeBuses] = useState([]);
  const [direction, setDirection] = useState(0);
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

  // 切換 tab 時自動切換 selectedRoute 為對應方向
  useEffect(() => {
    if (!selectedRoute || !routes.length) return;
    if (selectedRoute.Direction === direction) return;
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

  // 取得站序
  useEffect(() => {
    if (!selectedRoute) return;
    if (stopsCache.current[city.key]) {
      const filtered = stopsCache.current[city.key].filter(
        (s) =>
          s.RouteUID === selectedRoute.RouteUID &&
          s.SubRouteUID === selectedRoute.SubRouteUID
      );
      setStops(filtered);
      setErrors((prev) => ({ ...prev, stops: "" }));
    } else {
      setStops([]);
      setErrors((prev) => ({ ...prev, stops: "" }));
    }
  }, [selectedRoute, city]);

  // 取得ETA
  useEffect(() => {
    if (!selectedRoute) return;
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
  }, [selectedRoute, city]);

  // 取得即時車輛
  useEffect(() => {
    if (!selectedRoute || !city) return;
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
  }, [selectedRoute, city]);

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
    loading,
    errors,
  };
}
