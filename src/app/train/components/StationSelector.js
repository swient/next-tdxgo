"use client";
import React from "react";

// 縣市清單
const CITY_LIST = [
  "基隆市",
  "臺北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "宜蘭縣",
  "苗栗縣",
  "臺中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "臺南市",
  "高雄市",
  "屏東縣",
  "花蓮縣",
  "臺東縣",
];

export default function StationSelector({
  stations,
  stationLines,
  selectedOriginCity,
  setSelectedOriginCity,
  selectedDestCity,
  setSelectedDestCity,
  selectedOriginStation,
  setSelectedOriginStation,
  selectedDestStation,
  setSelectedDestStation,
  selectedDate,
  setSelectedDate,
}) {
  // 取得某站屬於哪些路線
  const getStationLineIDs = (stationID) => {
    if (!stationID || !stationLines.length) return [];
    return stationLines
      .filter((line) => line.Stations.some((s) => s.StationID === stationID))
      .map((line) => line.LineID);
  };

  // 取得兩站是否有共同路線
  const isConnected = (originID, destID) => {
    if (!originID || !destID) return true;
    const originLines = getStationLineIDs(originID);
    const destLines = getStationLineIDs(destID);
    return originLines.some((id) => destLines.includes(id));
  };

  // 根據選擇的縣市與路線過濾起始站
  const filteredOriginStations = stations.filter((station) => {
    if (!station.StationAddress?.includes(selectedOriginCity)) return false;
    // 若已選擇終點站，僅顯示有共同路線且不是同一站的起點站
    if (selectedDestStation && selectedDestStation.StationID) {
      if (station.StationID === selectedDestStation.StationID) return false;
      return isConnected(station.StationID, selectedDestStation.StationID);
    }
    return true;
  });

  // 根據選擇的縣市與路線過濾終點站
  const filteredDestStations = stations.filter((station) => {
    if (!station.StationAddress?.includes(selectedDestCity)) return false;
    // 若已選擇起始站，僅顯示有共同路線且不是同一站的終點站
    if (selectedOriginStation && selectedOriginStation.StationID) {
      if (station.StationID === selectedOriginStation.StationID) return false;
      return isConnected(selectedOriginStation.StationID, station.StationID);
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 起始站區域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            起始站縣市
          </label>
          <select
            value={selectedOriginCity}
            onChange={(e) => setSelectedOriginCity(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">請選擇縣市</option>
            {CITY_LIST.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {selectedOriginCity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              起始站
            </label>
            <select
              value={
                selectedOriginStation ? selectedOriginStation.StationID : ""
              }
              onChange={(e) => {
                const station = stations.find(
                  (s) => s.StationID === e.target.value
                );
                setSelectedOriginStation(station);
              }}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">請選擇起始站</option>
              {filteredOriginStations
                .sort((a, b) => a.StationID.localeCompare(b.StationID))
                .map((station) => (
                  <option key={station.StationID} value={station.StationID}>
                    {station.StationName?.Zh_tw} ({station.StationID})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* 終點站區域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終點站縣市
          </label>
          <select
            value={selectedDestCity}
            onChange={(e) => setSelectedDestCity(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">請選擇縣市</option>
            {CITY_LIST.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {selectedDestCity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終點站
            </label>
            <select
              value={selectedDestStation ? selectedDestStation.StationID : ""}
              onChange={(e) => {
                const station = stations.find(
                  (s) => s.StationID === e.target.value
                );
                setSelectedDestStation(station);
              }}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">請選擇終點站</option>
              {filteredDestStations
                .sort((a, b) => a.StationID.localeCompare(b.StationID))
                .map((station) => (
                  <option key={station.StationID} value={station.StationID}>
                    {station.StationName?.Zh_tw} ({station.StationID})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* 日期選擇 */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          選擇日期
        </label>
        {(() => {
          // 計算兩天前的日期字串
          const today = new Date();
          const minDate = new Date(today);
          minDate.setDate(today.getDate() - 1);
          const minDateStr = minDate.toISOString().split("T")[0];
          return (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="YYYY-MM-DD"
              min={minDateStr}
            />
          );
        })()}
      </div>
    </div>
  );
}
