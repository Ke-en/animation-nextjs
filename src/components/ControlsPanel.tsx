"use client";

import React from 'react';

type TControlsPanelProps = {
    countyList?: string[];
    getDistrictList?: (county: string | null) => string[];
    selectedCounty?: string | null;
    selectedDistrict?: string | null;
    onChangeCounty?: (county: string ) => void;
    onChangeDistrict?: (district: string) => void;
    onClear?: () => void;
};

const ControlsPanel = ({
  countyList = [],
  getDistrictList = () => [],
  selectedCounty = null,
  selectedDistrict = null,
  onChangeCounty = () => {},
  onChangeDistrict = () => {},
  onClear = () => {},
}: TControlsPanelProps) => {
  const districts = selectedCounty ? getDistrictList(selectedCounty) : [];

  return (
    <div className="p-4">
      <div className="flex gap-2 items-center mb-4">
        <label className="text-sm">縣市</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedCounty || ''}
          onChange={(e) => onChangeCounty(e.target.value)}
        >
          <option value="">請選縣市</option>
          {countyList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="text-sm">鄉鎮市區</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedDistrict || ''}
          onChange={(e) => onChangeDistrict(e.target.value)}
        >
          <option value="">請選鄉鎮市區</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button className="ml-4 bg-gray-800 text-white px-3 py-1 rounded" onClick={onClear}>
          清除
        </button>
      </div>
    </div>
  );
}

export default ControlsPanel;
