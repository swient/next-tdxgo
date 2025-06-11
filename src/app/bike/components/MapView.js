"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const getMarkerColor = (availability) => {
  if (!availability) return "gray";
  if (availability.AvailableRentBikes === 0) return "red"; // 沒車可租
  if (availability.AvailableReturnBikes === 0) return "orange"; // 沒車位可停
  return "green"; // 正常
};

// 建立顏色標記 icon
const createColoredDivIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background-color:${color};
      width:20px;
      height:20px;
      border-radius:50%;
      border: 2px solid white;
      box-shadow: 0 0 3px rgba(0,0,0,0.5);">
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

export default function MapView({ stations }) {
  if (!stations || stations.length === 0) return null;

  // 使用第一筆站點作為地圖中心點
  const center = [
    stations[0].StationPosition.PositionLat,
    stations[0].StationPosition.PositionLon,
  ];

  return (
    <div className="h-[500px] w-full my-6 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 顯示每個站點的 marker */}
        {stations.map((station) => {
          return (
            <Marker
              key={station.StationID}
              position={[
                station.StationPosition.PositionLat,
                station.StationPosition.PositionLon,
              ]}
              icon={createColoredDivIcon(getMarkerColor(station.availability))}
            >
              <Popup>
                <strong>{station.StationName.Zh_tw}</strong>
                <br />
                可借車輛：{station.availability?.AvailableRentBikes ?? "?"}
                <br />
                可停空位：{station.availability?.AvailableReturnBikes ?? "?"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
