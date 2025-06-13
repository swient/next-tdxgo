"use client";
import React, { useState, useEffect } from "react";

export default function TimetableDetail({
  timetableData,
  selectedOriginStation,
  selectedDestStation,
  liveBoard,
  selectedDate,
}) {
  const filteredList = timetableData
    ? timetableData.TrainTimetables.map((train) => {
        const originStop = train.StopTimes.find(
          (stop) => stop.StationID === selectedOriginStation.StationID
        );
        const destStop = train.StopTimes.find(
          (stop) => stop.StationID === selectedDestStation.StationID
        );
        return { train, originStop, destStop };
      })
        .filter(({ train, originStop, destStop }) => {
          if (!originStop || !destStop) return false;
          if (!originStop.DepartureTime) return false;
          // 若選擇日期不是今天，直接顯示所有班次
          const now = new Date();
          const todayStr = now.toISOString().slice(0, 10);
          if (selectedDate && selectedDate !== todayStr) return true;
          // 取得延遲分鐘
          let delayMin = 0;
          if (liveBoard && Array.isArray(liveBoard) && liveBoard.length > 0) {
            const delayObj = liveBoard.find(
              (d) => d.TrainNo === train.TrainInfo.TrainNo
            );
            if (delayObj && typeof delayObj.DelayTime === "number") {
              delayMin = delayObj.DelayTime;
            }
          }
          // 計算實際出發時間
          const [depHour, depMin] =
            originStop.DepartureTime.split(":").map(Number);
          const depDateTime = new Date(now);
          depDateTime.setHours(depHour, depMin, 0, 0);
          const depWithDelay = new Date(
            depDateTime.getTime() + delayMin * 60000
          );
          // 過站僅顯示一小時內的班次
          if (depWithDelay - now >= -60 * 60000) return true;
          return false;
        })
        .sort((a, b) =>
          a.originStop.DepartureTime.localeCompare(b.originStop.DepartureTime)
        )
    : [];
  const [nearestIdx, setNearestIdx] = useState(null);

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (selectedDate && selectedDate !== todayStr) {
      setNearestIdx(null);
      return;
    }
    let minDiff = Infinity;
    let found = null;
    for (let i = 0; i < filteredList.length; i++) {
      const depTimeStr = filteredList[i].originStop.DepartureTime;
      if (!depTimeStr) continue;
      const depDateTime = new Date(now);
      const [depHour, depMin] = depTimeStr.split(":").map(Number);
      depDateTime.setHours(depHour, depMin, 0, 0);
      let delayMin = 0;
      let delayObj = null;
      if (liveBoard && Array.isArray(liveBoard) && liveBoard.length > 0) {
        delayObj = liveBoard.find(
          (d) => d.TrainNo === filteredList[i].train.TrainInfo.TrainNo
        );
        if (delayObj && typeof delayObj.DelayTime === "number") {
          delayMin = delayObj.DelayTime;
        }
      }
      const depWithDelay = new Date(depDateTime.getTime() + delayMin * 60000);
      const diff = depWithDelay - now;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        found = i;
      }
    }
    setNearestIdx(found);
  }, [filteredList, liveBoard]);

  if (!filteredList.length || timetableData.TrainTimetables.length === 0) {
    return <div className="mt-6 text-center text-gray-500">當前無任何班次</div>;
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-4 py-2">車次 / 車種</th>
            <th className="border px-4 py-2">出發→抵達 / 行駛時間</th>
            <th className="border px-4 py-2">即時資訊</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map(({ train, originStop, destStop }, idx) => {
            // 比對車號
            let delay = {};
            if (liveBoard && Array.isArray(liveBoard) && liveBoard.length > 0) {
              delay = liveBoard.find(
                (d) => d.TrainNo === train.TrainInfo.TrainNo
              );
            }
            const highlightRow =
              idx === nearestIdx ? "bg-blue-100" : "hover:bg-gray-50";
            return (
              <React.Fragment key={train.TrainInfo.TrainNo}>
                <tr className={highlightRow}>
                  <td
                    className="border px-4 py-2 text-center font-bold"
                    rowSpan={2}
                  >
                    {train.TrainInfo.TrainNo}
                    {(() => {
                      const rawType =
                        train.TrainInfo.TrainTypeName.Zh_tw.replace(
                          /\(.*?\)/g,
                          ""
                        );
                      let color = "text-green-600";
                      if (rawType.includes("區間")) color = "text-blue-600";
                      else if (rawType.includes("莒光"))
                        color = "text-yellow-500";
                      else if (
                        rawType.includes("自強") ||
                        rawType.includes("普悠瑪")
                      )
                        color = "text-red-600";
                      return (
                        <div className={`text-lg font-normal mt-1 ${color}`}>
                          {rawType}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="border px-4 py-2 text-center" rowSpan={2}>
                    <div className="text-lg font-bold">
                      {originStop.DepartureTime} → {destStop.ArrivalTime}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
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
                        return hours === 0
                          ? `${mins}分`
                          : `${hours}時${mins}分`;
                      })()}
                    </div>
                  </td>
                  {/* 即時資訊欄位 */}
                  <td className="border px-4 py-2 text-center" rowSpan={2}>
                    {(() => {
                      const depTimeStr = originStop.DepartureTime;
                      if (!depTimeStr) return "-";
                      const now = new Date();
                      const yyyy = now.getFullYear();
                      const mm = String(now.getMonth() + 1).padStart(2, "0");
                      const dd = String(now.getDate()).padStart(2, "0");
                      const todayStr = `${yyyy}-${mm}-${dd}`;
                      // 若查詢日期不是今天，依日期顯示狀態
                      if (selectedDate && selectedDate !== todayStr) {
                        if (selectedDate < todayStr) {
                          return <span className="text-gray-400">已過站</span>;
                        } else {
                          return "準點";
                        }
                      }
                      // 出發時間加上誤點分鐘
                      const depDateTime = new Date(
                        `${todayStr}T${depTimeStr}:00`
                      );
                      const delayMin =
                        delay && delay.DelayTime ? delay.DelayTime : 0;
                      const depWithDelay = new Date(
                        depDateTime.getTime() + delayMin * 60000
                      );
                      if (depWithDelay < now) {
                        return <span className="text-gray-400">已過站</span>;
                      }
                      if (delay && delay.DelayTime) {
                        return (
                          <span className="text-red-600">{`晚 ${delay.DelayTime} 分鐘`}</span>
                        );
                      }
                      return "準點";
                    })()}
                  </td>
                </tr>
                {/* 第二行僅為分隔視覺效果，可省略內容 */}
                <tr className="hover:bg-gray-50"></tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
