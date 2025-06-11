"use client";

import { useEffect } from "react";
import { useBikeApi } from "./hooks/useBikeApi";
import { utils } from "./utils";
import { AUTO_UPDATE_INTERVAL, CITIES } from "./constants";
import CitySelector from "./components/CitySelector";
import StationList from "./components/StationList";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
});

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
    <div className="min-h-screen sm:min-h-[calc(100vh-70px)] bg-gray-50 py-8 px-4">
      <main className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg sm:px-4 px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <img src="/icons/youbike.svg" alt="youbike" className="w-8 h-8" />
          全台共享單車資訊
        </h1>

        {/* 城市選擇器 */}
        {!selectedCity ? (
          <CitySelector onCityChange={setSelectedCity} disabled={loading} />
        ) : (
          <div>
            <button
              className="text-blue-600 hover:underline mb-4"
              onClick={() => setSelectedCity("")}
            >
              ← 返回縣市選擇
            </button>
            <h2 className="text-lg font-bold mb-2">
              <div>
                {CITIES.find((city) => city.id === selectedCity)?.name ||
                  "選擇的城市"}
                共享單車站點
              </div>
            </h2>
            {/* 載入中顯示 */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">載入資料中，請稍候...</div>
              </div>
            )}
            {/* 錯誤提示 */}
            {!loading && (errors.stations || errors.availability) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p>{errors.stations || errors.availability}</p>
              </div>
            )}
            {!loading && !errors.stations && !errors.availability && (
              <div className="mb-6 z-0">
                <MapView stations={stations} />
                <StationList
                  stations={stations}
                  lastUpdateTime={utils.formatUpdateTime(lastUpdateTime)}
                  onRefresh={refreshBikeData}
                  loading={loading}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
