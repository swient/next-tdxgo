"use client";
import React from "react";
import { useBusApi } from "./hooks/useBusApi";

import CitySelector from "./components/CitySelector";
import RouteDetail from "./components/RouteDetail";
import RouteList from "./components/RouteList";

export default function BusPage() {
  const {
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
  } = useBusApi();

  const hasError =
    errors.routes || errors.stops || errors.eta || errors.realTimeBuses;

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-70px)] bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <img src="/icons/bus.svg" alt="bus" className="w-8 h-8" />
          全台公車即時資訊
        </h1>
        {!city ? (
          <CitySelector onSelect={setCity} />
        ) : !selectedRoute ? (
          <div>
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => setCity(null)}
            >
              ← 返回縣市選擇
            </button>
            <h2 className="text-lg font-bold mb-2">{city.name}公車</h2>
            {loading && <div className="text-gray-500">載入中...</div>}
            {hasError && (
              <div className="text-red-600 font-semibold">
                {errors.routes ||
                  errors.stops ||
                  errors.eta ||
                  errors.realTimeBuses}
              </div>
            )}
            {!loading && !hasError && (
              <RouteList
                routes={routes}
                setSelectedRoute={setSelectedRoute}
                setDirection={setDirection}
              />
            )}
          </div>
        ) : (
          <RouteDetail
            routes={routes}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
            stops={stops}
            eta={eta}
            realTimeBuses={realTimeBuses}
            direction={direction}
            setDirection={setDirection}
          />
        )}
      </div>
    </div>
  );
}
