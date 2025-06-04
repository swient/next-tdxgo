"use client";
import React from "react";

export default function TimetableDetail({
  timetableData,
  selectedOriginStation,
  selectedDestStation,
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-4 py-2">車次 / 車種</th>
            <th className="border px-4 py-2">出發→抵達 / 行駛時間</th>
          </tr>
        </thead>
        <tbody>
          {timetableData.TrainTimetables.map((train) => {
            const originStop = train.StopTimes.find(
              (stop) => stop.StationID === selectedOriginStation.StationID
            );
            const destStop = train.StopTimes.find(
              (stop) => stop.StationID === selectedDestStation.StationID
            );
            return { train, originStop, destStop };
          })
            .filter(({ originStop, destStop }) => originStop && destStop)
            .sort((a, b) =>
              a.originStop.DepartureTime.localeCompare(
                b.originStop.DepartureTime
              )
            )
            .map(({ train, originStop, destStop }) => (
              <React.Fragment key={train.TrainInfo.TrainNo}>
                <tr className="hover:bg-gray-50">
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
                        return `行駛時間：${hours}時${mins}分`;
                      })()}
                    </div>
                  </td>
                </tr>
                {/* 第二行僅為分隔視覺效果，可省略內容 */}
                <tr className="hover:bg-gray-50"></tr>
              </React.Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
}
