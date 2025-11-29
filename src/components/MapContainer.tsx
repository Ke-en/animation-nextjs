"use client";

import React, { useEffect, useState } from 'react';
import TaiwanMap from '@/components/TaiwanMap';
import ControlsPanel from './ControlsPanel';
import CountyInfoPanel from './CountyInfoPanel';
import {normalizeCountyName, buildCountyMap, TCOUNTY_MAP} from '@/utils/dataUtils';

export default function MapContainer() {
  const [countyMap, setCountyMap] = useState<TCOUNTY_MAP | null>(null);
  const [countyList, setCountyList] = useState<string[]>([]);
  const [selectedCountyName, setSelectedCountyName] = useState<string | null>(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    const { countyMap: cm, countyList: clist, unmatched } = buildCountyMap();
    setCountyMap(cm);
    setCountyList(clist);
    if (process.env.NODE_ENV === 'development') {
      console.log('countyMap built, counties:', clist.length, 'unmatched samples:', unmatched.slice(0,5));
    }
  }, []);

  function onCountySelect(properties: any) {
    if (!properties) return;
    const name = normalizeCountyName(properties.COUNTYNAME || properties.COUNTY || properties.countyName);
    setSelectedCountyName(name);
    setSelectedDistrictName(null);
    setPanelVisible(true);
  }

  function onDistrictSelect(dname: string) {
    setSelectedDistrictName(dname);
    setPanelVisible(true);
  }

  function onClear() {
    setSelectedCountyName(null);
    setSelectedDistrictName(null);
    setPanelVisible(false);
  }

  const metrics = selectedCountyName && countyMap ? countyMap[selectedCountyName]?.metrics ?? null : null;
  const districts = selectedCountyName && countyMap ? countyMap[selectedCountyName]?.districts ?? [] : [];

  return (
    <div className="w-full flex flex-row">
      <div className="flex-1">
        <ControlsPanel
          countyList={countyList}
          getDistrictList={(c) => (countyMap && c ? (countyMap[c]?.districts || []).map((d) => d.name) : [])}
          selectedCounty={selectedCountyName}
          selectedDistrict={selectedDistrictName}
          onChangeCounty={(c: string) => {
            setSelectedCountyName(c);
            setSelectedDistrictName(null);
            setPanelVisible(true);
          }}
          onChangeDistrict={(d: string) => onDistrictSelect(d)}
          onClear={onClear}
        />

        <TaiwanMap
          onCountySelect={onCountySelect as  () => void}
          selectedCountyName={selectedCountyName as  any}
        />
      </div>

      <CountyInfoPanel
        visible={panelVisible}
        countyName={selectedCountyName ? selectedCountyName : null}
        metrics={metrics}
        districts={districts}
        selectedDistrictName={selectedDistrictName}
        onClose={() => onClear()}
      />
    </div>
  );
}
