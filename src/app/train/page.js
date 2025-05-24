"use client";
import React, { useState, useEffect, useRef } from "react";

import { fetchWithError } from "../utils/fetchUtils";

// 台鐵車站資訊頁面
// 功能：
// 1. 提供縣市下拉選單
// 2. 根據選擇的縣市顯示該縣市的車站下拉選單
// 3. 顯示選擇車站的詳細資訊

const BASE_URL = "https://tdx.transportdata.tw/api/basic";

// 縣市清單
const CITY_LIST = [
  "基隆市",
  "臺北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
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
  "臺東縣",
  "花蓮縣",
];

export default function TrainPage() {
  // 儲存所有車站資料
  const [stations, setStations] = useState([]);
  // 儲存取得車站資料時的錯誤訊息
  const [stationsError, setStationsError] = useState("");
  // 標示是否正在載入車站資料
  const [loadingStations, setLoadingStations] = useState(false);
  // 標示是否正在載入時刻表資料
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  // 儲存選擇的起始站縣市
  const [selectedOriginCity, setSelectedOriginCity] = useState("");
  // 儲存選擇的終點站縣市
  const [selectedDestCity, setSelectedDestCity] = useState("");
  // 儲存選擇的起始站
  const [selectedOriginStation, setSelectedOriginStation] = useState(null);
  // 儲存選擇的終點站
  const [selectedDestStation, setSelectedDestStation] = useState(null);
  // 儲存選擇的日期
  const [selectedDate, setSelectedDate] = useState("");
  // 儲存時刻表資料
  const [timetableData, setTimetableData] = useState(null);
  // 儲存時刻表錯誤訊息
  const [timetableError, setTimetableError] = useState("");

  // 在元件載入時取得車站資料
  useEffect(() => {
    setLoadingStations(true);
    fetchWithError(`${BASE_URL}/v3/Rail/TRA/Station?$format=JSON`)
      .then((res) => {
        if (res.error) {
          setStationsError(res.error);
          setStations([]);
        } else {
          setStations(res.data.Stations);
          setStationsError("");
        }
      })
      .finally(() => {
        setLoadingStations(false);
      });
  }, []);

  // 根據選擇的縣市過濾起始站
  const filteredOriginStations = stations.filter((station) =>
    station.StationAddress?.includes(selectedOriginCity)
  );

  // 根據選擇的縣市過濾終點站
  const filteredDestStations = stations.filter((station) =>
    station.StationAddress?.includes(selectedDestCity)
  );

  // 當切換起始站縣市時，清除已選擇的起始站
  useEffect(() => {
    setSelectedOriginStation(null);
    setTimetableData([]);
    setTimetableError("");
  }, [selectedOriginCity]);

  // 當切換終點站縣市時，清除已選擇的終點站
  useEffect(() => {
    setSelectedDestStation(null);
    setTimetableData([]);
    setTimetableError("");
  }, [selectedDestCity]);

  // 取得時刻表資料
  const fetchTimetable = async () => {
    if (!selectedOriginStation || !selectedDestStation || !selectedDate) return;

    setLoadingTimetable(true);
    setTimetableError("");
    setTimetableData([]);
    // 保持原始的 YYYY-MM-DD 格式
    const formattedDate = selectedDate;
    const url = `${BASE_URL}/v3/Rail/TRA/DailyTrainTimetable/OD/${selectedOriginStation.StationID}/to/${selectedDestStation.StationID}/${formattedDate}`;
    console.log("請求 URL:", url);
    console.log(url);
    const response = await fetchWithError(url);
    setLoadingTimetable(false);

    if (response.error) {
      setTimetableError(response.error);
    } else {
      console.log("時刻表資料:", response.data);
      setTimetableData(response.data);
    }
  };

  // 當起始站、終點站或日期改變時，重新取得時刻表
  useEffect(() => {
    fetchTimetable();
  }, [selectedOriginStation, selectedDestStation, selectedDate]);

  // UI 渲染
  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-80px)] bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* 頁面標題 */}
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <img src="/icons/train.svg" alt="train" className="w-8 h-8" />
          台鐵車站資訊
        </h1>

        {/* 載入中提示 */}
        {loadingStations && <div className="text-gray-500">載入中...</div>}

        {/* 錯誤提示 */}
        {stationsError && (
          <div className="text-red-600 font-semibold">{stationsError}</div>
        )}

        {/* 選擇區域 */}
        {!loadingStations && !stationsError && (
          <div className="space-y-4">
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
                        selectedOriginStation
                          ? selectedOriginStation.StationID
                          : ""
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
                          <option
                            key={station.StationID}
                            value={station.StationID}
                          >
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
                      value={
                        selectedDestStation ? selectedDestStation.StationID : ""
                      }
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
                          <option
                            key={station.StationID}
                            value={station.StationID}
                          >
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
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* 時刻表顯示區域 */}
            {loadingTimetable && (
              <div className="mt-6 text-center text-gray-500">
                載入時刻表中...
              </div>
            )}

            {timetableError && (
              <div className="mt-6 text-red-600 font-semibold">
                {timetableError}
              </div>
            )}

            {timetableData?.TrainTimetables?.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2">車次</th>
                      <th className="border px-4 py-2">車種</th>
                      <th className="border px-4 py-2">出發時間</th>
                      <th className="border px-4 py-2">抵達時間</th>
                      <th className="border px-4 py-2">行駛時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData.TrainTimetables.map((train) => {
                      const originStop = train.StopTimes.find(
                        (stop) =>
                          stop.StationID === selectedOriginStation.StationID
                      );
                      const destStop = train.StopTimes.find(
                        (stop) =>
                          stop.StationID === selectedDestStation.StationID
                      );
                      if (!originStop || !destStop) return null;

                      return (
                        <tr
                          key={train.TrainInfo.TrainNo}
                          className="hover:bg-gray-50"
                        >
                          <td className="border px-4 py-2 text-center">
                            {train.TrainInfo.TrainNo}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {train.TrainInfo.TrainTypeName.Zh_tw}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {originStop.DepartureTime}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {destStop.ArrivalTime}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {(() => {
                              const depTime = originStop.DepartureTime;
                              const arrTime = destStop.ArrivalTime;
                              if (!depTime || !arrTime) return "-";

                              const [depHour, depMin] = depTime
                                .split(":")
                                .map(Number);
                              const [arrHour, arrMin] = arrTime
                                .split(":")
                                .map(Number);

                              let diffMin =
                                arrHour * 60 + arrMin - (depHour * 60 + depMin);
                              if (diffMin < 0) diffMin += 24 * 60;

                              const hours = Math.floor(diffMin / 60);
                              const mins = diffMin % 60;
                              return `${hours}小時${mins}分鐘`;
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
