"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const FilterComponent = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [enrollingNow, setEnrollingNow] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true); // State to toggle visibility

  const applyFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const resetFilters = () => {
    setSelectedFilters([]);
    setEnrollingNow(false);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="bg-white border rounded shadow">
      {/* Header */}
      <div className="flex justify-between items-center border-b bg-slate-700 px-4 py-3">
        <h6 className="text-lg font-bold text-white flex items-center">
          Filter
          <button
            onClick={toggleFilterVisibility}
            className="ml-2 focus:outline-none"
          >
            {isFilterVisible ? (
              <ChevronUp className="w-5 h-5 text-white" /> // Arrow Up
            ) : (
              <ChevronDown className="w-5 h-5 text-white" /> // Arrow Down
            )}
          </button>
        </h6>
        <button
          onClick={resetFilters}
          className="text-blue-600 font-medium flex items-center hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Filters Section */}
      {isFilterVisible && (
        <div className="grid grid-cols-5 gap-6 mt-6 p-6">
          {/* By Country */}
          <div>
            <strong className="block mb-2 text-gray-800">By Country</strong>
            <div className="flex flex-wrap gap-2">
              {["UK"].map((country, idx) => (
                <button
                  key={idx}
                  onClick={() => applyFilter(country)}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilters.includes(country)
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* By City */}
          <div>
            <strong className="block mb-2 text-gray-800">By City</strong>
            <div className="flex flex-wrap gap-2">
              {["London"].map((city, idx) => (
                <button
                  key={idx}
                  onClick={() => applyFilter(city)}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilters.includes(city)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* By Curriculum */}
          <div>
            <strong className="block mb-2 text-gray-800">By Curriculum</strong>
            <div className="flex flex-wrap gap-2">
              {["British Curriculum", "IB Curriculum"].map(
                (curriculum, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyFilter(curriculum)}
                    className={`px-4 py-2 rounded-full ${
                      selectedFilters.includes(curriculum)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {curriculum}
                  </button>
                )
              )}
            </div>
          </div>

          {/* By Age */}
          <div>
            <strong className="block mb-2 text-gray-800">By Age</strong>
            <div className="flex flex-wrap gap-2">
              {[
                "2",
                "3",
                "4 - 5",
                "6 - 10",
                "6 - 11",
                "11 - 12",
                "13 - 15",
                "16 - 18",
              ].map((age, idx) => (
                <button
                  key={idx}
                  onClick={() => applyFilter(age)}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilters.includes(age)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Enrolling Now */}
          <div className="flex flex-col items-start">
            <strong className="block mb-2 text-gray-800">Enrolling Now</strong>
            <button
              onClick={() => setEnrollingNow(!enrollingNow)}
              className={`w-16 h-8 flex items-center bg-gray-200 rounded-full p-1 transition-colors duration-300 ${
                enrollingNow ? "bg-blue-600" : ""
              }`}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full transform transition-transform ${
                  enrollingNow ? "translate-x-8" : ""
                }`}
              ></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
