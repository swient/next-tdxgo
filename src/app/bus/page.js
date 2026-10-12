"use client";
import { useBusApi } from "./hooks/useBusApi";
import { useFavorites } from "./hooks/useFavorites";

import CitySelector from "./components/CitySelector";
import RouteDetail from "./components/RouteDetail";
import RouteList from "./components/RouteList";
import FavoriteRouteList from "./components/FavoriteRouteList";

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
    showFavorite,
    setShowFavorite,
    loading,
    errors,
    refreshLiveBusStatus,
  } = useBusApi();

  const { favorites, isFavorite, toggleFavorite, removeFavorite } =
    useFavorites();

  const hasError =
    errors.routes || errors.stops || errors.eta || errors.realTimeBuses;

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-70px)] bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <img src="/icons/bus.svg" alt="bus" className="w-8 h-8" />
          全台公車即時資訊
        </h1>
        {!city && !showFavorite ? (
          <div>
            <div className="mb-4">
              <CitySelector onSelect={setCity} />
            </div>
            <button
              className="w-full py-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded"
              onClick={() => setShowFavorite(true)}
            >
              我的收藏
            </button>
          </div>
        ) : !selectedRoute ? (
          <div>
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => {
                setCity(null);
                setShowFavorite(false);
              }}
            >
              ← 返回縣市選擇
            </button>
            {showFavorite ? (
              <FavoriteRouteList
                setSelectedRoute={setSelectedRoute}
                setDirection={setDirection}
                favorites={favorites}
                removeFavorite={removeFavorite}
              />
            ) : (
              <>
                <h2 className="text-lg font-bold mb-2">
                  {city?.name || ""}公車
                </h2>
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">載入資料中，請稍候...</div>
                  </div>
                )}
                {!loading && hasError && (
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
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => setSelectedRoute(null)}
            >
              ← 返回路線清單
            </button>
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">載入資料中，請稍候...</div>
              </div>
            )}
            {!loading && hasError && (
              <div className="text-red-600 font-semibold">
                {errors.routes ||
                  errors.stops ||
                  errors.eta ||
                  errors.realTimeBuses}
              </div>
            )}
            {!loading && !hasError && (
              <RouteDetail
                selectedRoute={selectedRoute}
                stops={stops}
                eta={eta}
                realTimeBuses={realTimeBuses}
                direction={direction}
                setDirection={setDirection}
                refreshLiveBusStatus={refreshLiveBusStatus}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
