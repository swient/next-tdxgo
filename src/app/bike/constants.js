/**
 * TDX API 相關設定
 */
// API 基礎 URL
export const BASE_URL = "https://tdx.transportdata.tw/api/basic/v2";
// 自動更新間隔時間 (5分鐘)
export const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000;
// 一頁15筆資料
export const itemsPerPage = 15;

/**
 * 城市清單設定
 * id: API 使用的城市代碼
 * name: 顯示用的中文名稱
 */
export const CITIES = [
  { id: "Taipei", name: "臺北市" },
  { id: "NewTaipei", name: "新北市" },
  { id: "Taoyuan", name: "桃園市" },
  { id: "Taichung", name: "臺中市" },
  { id: "Tainan", name: "臺南市" },
  { id: "Kaohsiung", name: "高雄市" },
  { id: "Hsinchu", name: "新竹市" },
  { id: "HsinchuCounty", name: "新竹縣" },
  { id: "MiaoliCounty", name: "苗栗縣" },
  { id: "ChanghuaCounty", name: "彰化縣" },
  { id: "YunlinCounty", name: "雲林縣" },
  { id: "Chiayi", name: "嘉義市" },
  { id: "ChiayiCounty", name: "嘉義縣" },
  { id: "PingtungCounty", name: "屏東縣" },
  { id: "TaitungCounty", name: "臺東縣" },
];

/**
 * 自行車服務類型對照表
 * 用於顯示不同類型的共享單車系統
 */
export const SERVICE_TYPE = {
  1: "YouBike 1.0",
  2: "YouBike 2.0",
  3: "Moovo",
};
