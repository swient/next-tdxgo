import { useState, useEffect } from "react";
import { fetchWithError } from "../../utils/fetchUtils";

const BASE_URL = "https://tdx.transportdata.tw/api/basic";

export function useTrainApi() {
  const [stations, setStations] = useState([]);
  const [stationLines, setStationLines] = useState([]);
  const [selectedOriginCity, setSelectedOriginCity] = useState("");
  const [selectedDestCity, setSelectedDestCity] = useState("");
  const [selectedOriginStation, setSelectedOriginStation] = useState(null);
  const [selectedDestStation, setSelectedDestStation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timetableData, setTimetableData] = useState(null);
  const [loadingBaseData, setLoadingBaseData] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [errors, setErrors] = useState({
    stations: "",
    lines: "",
    timetable: "",
  });

  // 取得所有車站與路線
  useEffect(() => {
    setLoadingBaseData(true);
    Promise.all([
      fetchWithError(`${BASE_URL}/v3/Rail/TRA/Station?$format=JSON`),
      fetchWithError(`${BASE_URL}/v3/Rail/TRA/StationOfLine?$format=JSON`),
    ])
      .then(([stationRes, lineRes]) => {
        // 處理車站資料
        if (stationRes.error) {
          setStations([]);
          setErrors((prev) => ({
            ...prev,
            stations: stationRes.error,
          }));
        } else {
          setStations(stationRes.data.Stations);
        }
        // 處理路線資料
        if (lineRes.error) {
          setStationLines([]);
          setErrors((prev) => ({
            ...prev,
            lines: lineRes.error,
          }));
        } else {
          setStationLines(lineRes.data.StationOfLines);
        }
      })
      .finally(() => {
        setLoadingBaseData(false);
      });
  }, []);

  // 切換起始縣市時清除起始站與時刻表
  useEffect(() => {
    setSelectedOriginStation(null);
    setTimetableData(null);
    setErrors((prev) => ({ ...prev, timetable: "" }));
  }, [selectedOriginCity]);

  // 切換終點縣市時清除終點站與時刻表
  useEffect(() => {
    setSelectedDestStation(null);
    setTimetableData(null);
    setErrors((prev) => ({ ...prev, timetable: "" }));
  }, [selectedDestCity]);

  // 取得時刻表
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedOriginStation || !selectedDestStation || !selectedDate)
        return;
      setLoadingTimetable(true);
      setErrors((prev) => ({ ...prev, timetable: "" }));
      setTimetableData(null);
      const url = `${BASE_URL}/v3/Rail/TRA/DailyTrainTimetable/OD/${selectedOriginStation.StationID}/to/${selectedDestStation.StationID}/${selectedDate}`;
      const response = await fetchWithError(url);
      setLoadingTimetable(false);
      if (response.error) {
        setErrors((prev) => ({ ...prev, timetable: response.error }));
      } else {
        setTimetableData(response.data);
      }
    };
    fetchTimetable();
  }, [selectedOriginStation, selectedDestStation, selectedDate]);

  return {
    stations,
    stationLines,
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
  };
}
