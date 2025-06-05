"use client";

import { useEffect } from "react";
import { useBikeApi } from "./hooks/useBikeApi";
import { utils } from "./utils";
import { AUTO_UPDATE_INTERVAL } from "./constants";
import CitySelector from "./components/CitySelector";
import StationList from "./components/StationList";

export default function BikeStationPage() {
  const {
    selectedCity,
    setSelectedCity,
    stations,
    loading,
    errors,
    lastUpdateTime,
    fetchBikeData,
    refreshBikeData,
  } = useBikeApi();

  // 初始載入和切換城市時更新資料
  useEffect(() => {
    if (selectedCity) {
      fetchBikeData(selectedCity);
    }
  }, [selectedCity, fetchBikeData]);

  // 每 5 分鐘自動更新資料
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedCity) {
        refreshBikeData();
      }
    }, AUTO_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [selectedCity, refreshBikeData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <img src="/icons/youbike.svg" alt="youbike" className="w-8 h-8" />
          全台共享單車資訊
        </h1>

        {/* 錯誤提示 */}
        {(errors.stations || errors.availability) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{errors.stations || errors.availability}</p>
          </div>
        )}

        {/* 城市選擇器 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <CitySelector
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            disabled={loading}
          />
        </div>

        {/* 載入中顯示 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">載入資料中，請稍候...</div>
          </div>
        ) : stations.length > 0 ? (
          <StationList
            stations={stations}
            lastUpdateTime={utils.formatUpdateTime(lastUpdateTime)}
            onRefresh={refreshBikeData}
            loading={loading}
          />
        ) : (
          <div className="text-center text-gray-600 py-12">
            {errors.stations || errors.availability
              ? "無法顯示資料"
              : "找不到站點資料"}
          </div>
        )}
      </main>
    </div>
  );
}
