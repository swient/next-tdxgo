"use client";

import React from "react";
import { CITIES } from "../constants";

export default function CitySelector({ selectedCity, onCityChange, disabled }) {
  return (
    <div>
      <label className="block mb-2 text-gray-700 font-semibold">選擇縣市</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CITIES.map((city) => (
          <button
            key={city.id}
            className={`
              py-2 px-4 rounded transition
              ${
                selectedCity === city.id
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 hover:bg-blue-300 text-blue-800"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "font-medium"}
            `}
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
