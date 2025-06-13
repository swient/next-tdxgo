"use client";
import React from "react";
import StationSelector from "./components/StationSelector";
import TimetableDetail from "./components/TimetableDetail";
import { useTrainApi } from "./hooks/useTrainApi";

export default function TrainPage() {
  const {
    stations,
    stationLines,
    liveBoard,
    timetableData,
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
    loadingBaseData,
    loadingTimetable,
    errors,
  } = useTrainApi();

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
        {loadingBaseData && (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">載入資料中，請稍候...</div>
          </div>
        )}

        {/* 錯誤提示 */}
        {!loadingBaseData &&
          (errors.stations || errors.lines || errors.liveBoard) && (
            <div className="text-red-600 font-semibold">
              {errors.stations || errors.lines || errors.liveBoard}
            </div>
          )}

        {/* 選擇區域 */}
        {!loadingBaseData &&
          !errors.stations &&
          !errors.lines &&
          !errors.liveBoard && (
            <div className="space-y-4">
              <StationSelector
                stations={stations}
                stationLines={stationLines}
                selectedOriginCity={selectedOriginCity}
                setSelectedOriginCity={setSelectedOriginCity}
                selectedDestCity={selectedDestCity}
                setSelectedDestCity={setSelectedDestCity}
                selectedOriginStation={selectedOriginStation}
                setSelectedOriginStation={setSelectedOriginStation}
                selectedDestStation={selectedDestStation}
                setSelectedDestStation={setSelectedDestStation}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />

              {/* 時刻表顯示區域 */}
              {loadingTimetable && (
                <div className="mt-6 text-center text-gray-500">
                  載入時刻表中...
                </div>
              )}

              {!loadingTimetable && errors.timetable && (
                <div className="mt-6 text-red-600 font-semibold">
                  {errors.timetable}
                </div>
              )}

              {selectedOriginStation && selectedDestStation && selectedDate && (
                <TimetableDetail
                  timetableData={timetableData}
                  selectedOriginStation={selectedOriginStation}
                  selectedDestStation={selectedDestStation}
                  selectedDate={selectedDate}
                  liveBoard={liveBoard}
                />
              )}
            </div>
          )}
      </div>
    </div>
  );
}
