"use client";

/**
 * StationList 組件
 * 負責顯示自行車站點列表和相關操作介面
 * 功能：
 * - 站點資訊顯示
 * - 搜尋和篩選
 * - 排序功能
 * - 即時更新
 */

import React, { useState, useEffect } from "react";
import { utils } from "../utils";
import { itemsPerPage, SERVICE_TYPE } from "../constants";

export default function StationList({
  stations,
  lastUpdateTime,
  onRefresh,
  loading,
}) {
  /**
   * 狀態管理
   * searchText: 搜尋文字
   * isDropdownOpen: 控制站點選擇下拉選單
   * sortType: 排序方式
   * filterType: 篩選條件
   */
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("name");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 站點分類函數
  function getFilteredStations(stations, filterType) {
    switch (filterType) {
      case "available":
        return stations.filter(
          (station) => (station.availability?.AvailableRentBikes || 0) > 0
        );
      case "empty":
        return stations.filter(
          (station) => (station.availability?.AvailableRentBikes || 0) === 0
        );
      case "space":
        return stations.filter(
          (station) => (station.availability?.AvailableReturnBikes || 0) > 5
        );
      case "full":
        return stations.filter(
          (station) => (station.availability?.AvailableReturnBikes || 0) === 0
        );
      default:
        return stations;
    }
  }

  // 站點排序函數
  function getSortedStations(stations, sortType) {
    return [...stations].sort((a, b) => {
      switch (sortType) {
        case "bikes":
          return (
            (b.availability?.AvailableRentBikes || 0) -
            (a.availability?.AvailableRentBikes || 0)
          );
        case "spaces":
          return (
            (b.availability?.AvailableReturnBikes || 0) -
            (a.availability?.AvailableReturnBikes || 0)
          );
        default:
          return a.StationName.Zh_tw.localeCompare(
            b.StationName.Zh_tw,
            "zh-Hant"
          );
      }
    });
  }

  /**
   * 介面定義
   */
  // 篩選選項定義
  const filterDefs = [
    { key: "all", label: "全部" },
    { key: "available", label: "可租借" },
    { key: "space", label: "可停放" },
  ];

  // 排序選項定義
  const sortDefs = [
    { key: "name", label: "依站名" },
    { key: "bikes", label: "依可借數" },
    { key: "spaces", label: "依可停數" },
  ];

  /**
   * 資料處理
   * 1. 依據篩選條件過濾站點
   * 2. 依據搜尋文字過濾站點
   * 3. 依據排序方式排序
   */
  const displayStations = getSortedStations(
    getFilteredStations(stations, filterType).filter(
      (station) =>
        (station.StationName?.Zh_tw?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (station.StationAddress?.Zh_tw?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        )
    ),
    sortType
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, sortType, searchText]);

  const totalPages = Math.ceil(displayStations.length / itemsPerPage);
  const pagedStations = displayStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /**
   * 渲染站點列表和操作介面
   * 包含：
   * 1. 過濾和排序控制項
   * 2. 搜尋欄和站點快速選擇
   * 3. 站點資訊卡片列表
   */
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 過濾按鈕 */}
        <div className="flex flex-wrap gap-2 lg:flex-1">
          {filterDefs.map((filter) => (
            <button
              key={filter.key}
              className={`px-3 py-1 rounded text-sm ${
                filterType === filter.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setFilterType(filter.key)}
            >
              {filter.label}
            </button>
          ))}
          {/* 更新時間 */}
          <div className="text-sm text-gray-500 flex items-center gap-2 whitespace-nowrap">
            <span>最後更新：{lastUpdateTime}</span>
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              disabled={loading}
            >
              {loading ? "更新中..." : "立即更新"}
            </button>
          </div>
        </div>

        {/* 排序和搜尋 */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 py-1 border rounded text-sm bg-white"
          >
            {sortDefs.map((sort) => (
              <option key={sort.key} value={sort.key}>
                {sort.label}
              </option>
            ))}
          </select>
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="搜尋站點或點擊選擇"
              className="px-2 py-1 border rounded text-sm pr-24 w-64"
            />
            <span className="absolute right-2 text-xs text-gray-500">
              {displayStations.length} / {stations.length} 站
            </span>
            {isDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-10"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {displayStations.map((station) => (
                  <div
                    key={station.StationID}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSearchText(station.StationName.Zh_tw);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {station.StationName.Zh_tw}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 站點列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pagedStations.map((station) => (
          <div
            key={station.StationID}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {station.StationName.Zh_tw}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {station.StationAddress.Zh_tw}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                {SERVICE_TYPE[station.ServiceType] || "類型未知"}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                總車位: {station.BikesCapacity || "未知"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`${utils.getBikeStatusColor(
                  station.availability?.AvailableRentBikes
                )} rounded-lg p-3 text-center`}
              >
                <div className="text-2xl font-bold text-gray-900">
                  {station.availability?.AvailableRentBikes ?? "?"}
                </div>
                <div className="text-sm text-gray-600">可借車輛</div>
              </div>
              <div
                className={`${utils.getBikeStatusColor(
                  station.availability?.AvailableReturnBikes
                )} rounded-lg p-3 text-center`}
              >
                <div className="text-2xl font-bold text-gray-900">
                  {station.availability?.AvailableReturnBikes ?? "?"}
                </div>
                <div className="text-sm text-gray-600">可停空位</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            上一頁
          </button>

          <span className="text-sm flex items-center gap-1">
            第
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                )
              )}
            </select>
            頁 / 共 {totalPages} 頁
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
      )}

      {displayStations.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          找不到符合條件的站點
        </div>
      )}
    </div>
  );
}
