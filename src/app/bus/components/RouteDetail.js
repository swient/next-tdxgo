import React, { useEffect } from "react";

// 刷新公車及時狀態倒數計時器
function RefreshCountdown({ onRefresh }) {
  const [count, setCount] = React.useState(30);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState("");

  useEffect(() => {
    if (updating || error) return;

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

// 依站序資料推算某方向的起訖站名
function getTermini(stops, direction) {
  const seqs = [];
  (stops || []).forEach((s) => {
    if (s.Direction !== direction) return;
    (s.Stops || []).forEach((st) => {
      seqs.push({
        name: st.StopName?.Zh_tw || "",
        seq: st.StopSequence ?? 0,
      });
    });
  });
  if (seqs.length === 0) return null;
  const sorted = seqs.slice().sort((a, b) => a.seq - b.seq);
  return {
    departure: sorted[0].name,
    destination: sorted[sorted.length - 1].name,
  };
}

export default function RouteDetail({
  selectedRoute,
  stops,
  eta,
  realTimeBuses,
  direction,
  setDirection,
  refreshLiveBusStatus,
}) {
  if (!selectedRoute) return null;

  // 可用方向直接從已載入的站序資料推得
  const availableDirections = Array.from(
    new Set((stops || []).map((s) => s.Direction))
  );
  const termini = getTermini(stops, direction);
  const departName =
    termini?.departure || selectedRoute.DepartureStopNameZh || "去程";
  const destName =
    termini?.destination || selectedRoute.DestinationStopNameZh || "回程";

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">
        {selectedRoute.SubRouteName?.Zh_tw || selectedRoute.RouteName?.Zh_tw}（
        {departName} → {destName}）
      </h2>
      {/* Tab 切換 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {availableDirections.includes(0) && (
            <button
              className={`px-4 py-2 rounded-t ${
                direction === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setDirection(0)}
            >
              往
              {getTermini(stops, 0)?.destination ||
                selectedRoute.DestinationStopNameZh ||
                "去程"}
            </button>
          )}
          {availableDirections.includes(1) && (
            <button
              className={`px-4 py-2 rounded-t ${
                direction === 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setDirection(1)}
            >
              往
              {getTermini(stops, 1)?.destination ||
                selectedRoute.DepartureStopNameZh ||
                "回程"}
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
