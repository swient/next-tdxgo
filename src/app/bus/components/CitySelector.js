import React from "react";

const CITY_LIST = [
  { key: "Taipei", name: "臺北市" },
  { key: "NewTaipei", name: "新北市" },
  { key: "Keelung", name: "基隆市" },
  { key: "YilanCounty", name: "宜蘭縣" },
  { key: "Taoyuan", name: "桃園市" },
  { key: "HsinchuCounty", name: "新竹縣" },
  { key: "Hsinchu", name: "新竹市" },
  { key: "MiaoliCounty", name: "苗栗縣" },
  { key: "Taichung", name: "臺中市" },
  { key: "ChanghuaCounty", name: "彰化縣" },
  { key: "NantouCounty", name: "南投縣" },
  { key: "YunlinCounty", name: "雲林縣" },
  { key: "ChiayiCounty", name: "嘉義縣" },
  { key: "Chiayi", name: "嘉義市" },
  { key: "Tainan", name: "臺南市" },
  { key: "Kaohsiung", name: "高雄市" },
  { key: "PingtungCounty", name: "屏東縣" },
  { key: "TaitungCounty", name: "臺東縣" },
  { key: "HualienCounty", name: "花蓮縣" },
  { key: "PenghuCounty", name: "澎湖縣" },
  { key: "KinmenCounty", name: "金門縣" },
  { key: "LienchiangCounty", name: "連江縣" },
];

export default function CitySelector({ onSelect }) {
  return (
    <div>
      <label className="block mb-2 text-gray-700 font-semibold">選擇縣市</label>
      <div className="grid grid-cols-2 gap-2">
        {CITY_LIST.map((c) => (
          <button
            key={c.key}
            className="bg-blue-100 hover:bg-blue-300 text-blue-800 font-medium py-2 rounded transition"
            onClick={() => onSelect({ key: c.key, name: c.name })}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
