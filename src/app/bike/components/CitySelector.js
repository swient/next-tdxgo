"use client";

import React from "react";
import { CITIES } from "../constants";

export default function CitySelector({ onCityChange, disabled }) {
  return (
    <div>
      <label className="block mb-2 text-gray-700 font-semibold">選擇縣市</label>
      <div className="grid grid-cols-3 gap-2">
        {CITIES.map((city) => (
          <button
            key={city.id}
            className="bg-blue-100 hover:bg-blue-300 text-blue-800 font-medium py-2 rounded transition"
            onClick={() => onCityChange(city.id)}
            disabled={disabled}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
