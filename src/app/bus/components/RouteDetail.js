import React, { useEffect } from "react";

// 刷新公車及時狀態倒數計時器
function RefreshCountdown({ onRefresh }) {
  const [count, setCount] = React.useState(30);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState("");

  useEffect(() => {
    if (updating || error) return;
    console.log(`${count} 秒`, new Date().toISOString());
    if (count > 0) {
      const timerId = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      (async () => {
        setUpdating(true);
        const result = await (onRefresh && onRefresh());
        if (result && result.error) setError(result.error);
        setCount(30);
        setUpdating(false);
      })();
    }
  }, [count, updating, error]);

  useEffect(() => {
    if (!error) return;
    const timerId = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timerId);
  }, [error]);

  return (
    <span className="text-sm text-gray-500">
      {error ? error : updating ? "更新中..." : `${count} 秒後自動更新`}
    </span>
  );
}

export default function RouteDetail({
  routes,
  selectedRoute,
  setSelectedRoute,
  stops,
  eta,
  realTimeBuses,
  direction,
  setDirection,
  refreshLiveBusStatus,
}) {
  if (!selectedRoute) return null;

  return (
    <div>
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={() => setSelectedRoute(null)}
      >
        ← 返回路線清單
      </button>
      <h2 className="text-lg font-bold mb-2">
        {selectedRoute.SubRouteName?.Zh_tw || selectedRoute.RouteName?.Zh_tw}（
        {selectedRoute.DepartureStopNameZh} →{" "}
        {selectedRoute.DestinationStopNameZh}）
      </h2>
      {/* Tab 切換 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {routes.some(
            (r) =>
              r.RouteUID === selectedRoute.RouteUID &&
              r.SubRouteName?.Zh_tw === selectedRoute.SubRouteName?.Zh_tw &&
              r.Direction === 0
          ) && (
            <button
              className={`px-4 py-2 rounded-t ${
                direction === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setDirection(0)}
            >
              往
              {(() => {
                const match = routes.find(
                  (r) =>
                    r.RouteUID === selectedRoute.RouteUID &&
                    r.SubRouteName?.Zh_tw ===
                      selectedRoute.SubRouteName?.Zh_tw &&
                    r.Direction === 0
                );
                return match?.DestinationStopNameZh || "去程";
              })()}
            </button>
          )}
          {routes.some(
            (r) =>
              r.RouteUID === selectedRoute.RouteUID &&
              r.SubRouteName?.Zh_tw === selectedRoute.SubRouteName?.Zh_tw &&
              r.Direction === 1
          ) && (
            <button
              className={`px-4 py-2 rounded-t ${
                direction === 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setDirection(1)}
            >
              往
              {(() => {
                const match = routes.find(
                  (r) =>
                    r.RouteUID === selectedRoute.RouteUID &&
                    r.SubRouteName?.Zh_tw ===
                      selectedRoute.SubRouteName?.Zh_tw &&
                    r.Direction === 1
                );
                return match?.DestinationStopNameZh || "回程";
              })()}
            </button>
          )}
        </div>
        <RefreshCountdown onRefresh={refreshLiveBusStatus} />
      </div>
      <div>
        {stops
          .filter((s) => s.Direction === direction)
          .map((s) => (
            <div
              key={
                s.SubRouteUID +
                "-" +
                (s.Operators?.map((op) => op.OperatorID).join("_") || "") +
                "-" +
                s.Direction
              }
            >
              <div className="font-semibold text-blue-700 mb-2">
                {s.Operators?.[0]?.OperatorName?.Zh_tw || ""}
              </div>
              <ol className="border-l-2 border-blue-300 pl-4">
                {s.Stops.map((stop) => {
                  const etaObj = eta.find(
                    (e) =>
                      e.StopUID === stop.StopUID &&
                      e.Direction === direction &&
                      e.RouteUID === selectedRoute.RouteUID
                  );
                  let etaText = "—";
                  if (etaObj) {
                    if (
                      etaObj.StopStatus === 0 &&
                      etaObj.EstimateTime != null
                    ) {
                      const min = Math.floor(etaObj.EstimateTime / 60);
                      if (min === 0) {
                        etaText = "進站中";
                      } else if (min === 1) {
                        etaText = "即將進站";
                      } else if (min < 60) {
                        etaText = `${min}分`;
                      } else {
                        const hr = Math.floor(min / 60);
                        etaText = `${hr}時${min % 60}分`;
                      }
                    } else {
                      switch (etaObj.StopStatus) {
                        case 1:
                          etaText = "尚未發車";
                          break;
                        case 2:
                          etaText = "交管不停靠";
                          break;
                        case 3:
                          etaText = "末班車已過";
                          break;
                        case 4:
                          etaText = "今日未營運";
                          break;
                        default:
                          etaText = "—";
                      }
                    }
                  }
                  const busesHere = realTimeBuses.filter((bus) => {
                    const stopsOfDir = stops
                      .filter((s) => s.Direction === direction)
                      .flatMap((s) => s.Stops || []);
                    const maxSeq = Math.max(
                      ...stopsOfDir.map((s) => s.StopSequence || 0)
                    );
                    return (
                      bus.RouteUID === selectedRoute.RouteUID &&
                      bus.Direction === direction &&
                      stop.StopSequence === bus.StopSequence &&
                      bus.StopSequence !== maxSeq
                    );
                  });
                  const isAnyBus = busesHere.length > 0;
                  return (
                    <li
                      key={stop.StopUID + "-" + stop.StopSequence}
                      className="flex justify-between items-center py-2 border-b border-gray-100 relative"
                    >
                      <span
                        className={`absolute left-[-1.37rem] w-2.5 h-2.5 rounded-full z-10 ${
                          isAnyBus ? "bg-green-500" : "bg-blue-300"
                        }`}
                      ></span>
                      <span className="min-w-[6.5rem] text-green-700 text-xs font-bold">
                        {isAnyBus &&
                          busesHere.map((bus) => (
                            <span key={bus.PlateNumb}>{bus.PlateNumb}</span>
                          ))}
                      </span>
                      <span className="text-gray-800 flex-1 text-center">
                        {stop.StopName.Zh_tw}
                      </span>
                      <span className="w-[6.5rem] text-blue-600 font-mono text-center">
                        {etaText}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
      </div>
    </div>
  );
}
