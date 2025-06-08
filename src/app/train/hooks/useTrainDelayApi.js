// 取得台鐵即時誤點資料 hook
import { useState, useEffect } from "react";
import { fetchWithError } from "../../utils/fetchUtils";

const DELAY_URL =
  "https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveTrainDelay?$format=JSON";

export function useTrainDelayApi(deps = [], shouldFetch = true) {
  const [delayData, setDelayData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shouldFetch) {
      setDelayData([]);
      return;
    }
    setLoading(true);
    fetchWithError(DELAY_URL)
      .then((res) => {
        if (res.error) {
          setDelayData([]);
          setError(res.error);
        } else {
          // 若沒有誤點時間則設為0
          const normalizedData = res.data.map((item) => ({
            ...item,
            DelayTime: item.DelayTime == null ? 0 : item.DelayTime,
          }));
          setDelayData(normalizedData);
          // console.log("取得誤點資料：", normalizedData);
          setError("");
        }
      })
      .catch((err) => {
        setDelayData([]);
        setError(err.message || "取得誤點資料失敗");
      })
      .finally(() => setLoading(false));
  }, deps);

  return { delayData, loading, error };
}
