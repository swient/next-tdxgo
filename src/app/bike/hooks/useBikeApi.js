"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { fetchWithError } from "../../utils/fetchUtils";
import { BASE_URL } from "../constants";

export function useBikeApi() {
  /**
   * State 定義區
   */
  // 基本狀態管理
  const [selectedCity, setSelectedCity] = useState("");
  const [stations, setStations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [errors, setErrors] = useState({
    stations: "",
    availability: "",
  });

  /**
   * 快取機制
   * 使用 useRef 保存資料，避免重複請求
   * stationsCache: 儲存各城市的站點基本資料
   * availabilityCache: 儲存各城市的即時可用性資料
   */
  const stationsCache = useRef({});
  const availabilityCache = useRef({});

  /**
   * API 請求處理
   * 同時取得站點資訊和可用性資訊
   * 包含快取檢查和錯誤處理機制
   */
  const fetchBikeData = useCallback(async (city) => {
    if (!city) return;

    setLoading(true);
    setErrors({
      stations: "",
      availability: "",
    });

    // 檢查快取
    const hasCache =
      stationsCache.current[city] && availabilityCache.current[city];

    if (hasCache) {
      setStations(stationsCache.current[city]);
      setAvailability(availabilityCache.current[city]);
      setLastUpdateTime(new Date());
      setLoading(false);
      return;
    }

    // 並行請求站點資訊和可用性資訊
    const [stationsRes, availabilityRes] = await Promise.all([
      fetchWithError(`${BASE_URL}/Bike/Station/City/${city}?$format=JSON`),
      fetchWithError(`${BASE_URL}/Bike/Availability/City/${city}?$format=JSON`),
    ]);

    // 處理站點資訊
    if (stationsRes.error) {
      setStations([]);
      setErrors((prev) => ({ ...prev, stations: stationsRes.error }));
    } else {
      stationsCache.current[city] = stationsRes.data;
      setStations(stationsRes.data);
    }

    // 處理可用性資訊
    if (availabilityRes.error) {
      setAvailability([]);
      setErrors((prev) => ({ ...prev, availability: availabilityRes.error }));
    } else {
      availabilityCache.current[city] = availabilityRes.data;
      setAvailability(availabilityRes.data);
    }

    setLastUpdateTime(new Date());
    setLoading(false);
  }, []);

  /**
   * 更新即時資訊
   * 只更新車輛可用性資料，不重新請求站點基本資料
   * 用於定時更新和手動更新
   */
  const refreshBikeData = useCallback(async () => {
    if (!selectedCity) return;

    try {
      const availabilityRes = await fetchWithError(
        `${BASE_URL}/Bike/Availability/City/${selectedCity}?$format=JSON`
      );

      if (availabilityRes.error) {
        setErrors((prev) => ({ ...prev, availability: availabilityRes.error }));
        return { error: "取得即時資訊失敗" };
      }

      availabilityCache.current[selectedCity] = availabilityRes.data;
      setAvailability(availabilityRes.data);
      setLastUpdateTime(new Date());
      setErrors((prev) => ({ ...prev, availability: "" }));
    } catch (error) {
      console.error("Error refreshing bike data:", error);
      setErrors((prev) => ({ ...prev, availability: "更新資料失敗" }));
      return { error: "更新資料失敗" };
    }
  }, [selectedCity]);

  /**
   * 資料整合處理
   * 將站點基本資料和即時可用性資料整合
   * 回傳完整的站點資訊供顯示使用
   */
  const combinedStations = stations.map((station) => ({
    ...station,
    availability: availability.find((a) => a.StationID === station.StationID),
  }));

  return {
    selectedCity,
    setSelectedCity,
    stations: combinedStations,
    loading,
    errors,
    lastUpdateTime,
    fetchBikeData,
    refreshBikeData,
  };
}
