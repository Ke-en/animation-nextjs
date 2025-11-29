"use client";

import React from 'react';
import { TDISTRICT } from '@/utils/dataUtils';

const AGE_KEYS = [
  '15至19歲生育率',
  '20至24歲生育率',
  '25至29歲生育率',
  '30至34歲生育率',
  '35至39歲生育率',
  '40至44歲生育率',
  '45至49歲生育率',
];
type TLABEL_MAP = {
  [key: string]: string;
};
const LABEL_MAP: TLABEL_MAP = {
  '15至19歲生育率': '15–19 歲生育率',
  '20至24歲生育率': '20–24 歲生育率',
  '25至29歲生育率': '25–29 歲生育率',
  '30至34歲生育率': '30–34 歲生育率',
  '35至39歲生育率': '35–39 歲生育率',
  '40至44歲生育率': '40–44 歲生育率',
  '45至49歲生育率': '45–49 歲生育率',
};

type TCountyInfoPanelProps = {
    visible?: boolean;
    countyName: string | null;
    metrics?: any;
    districts?: Array<TDISTRICT>;
    selectedDistrictName?: string | null;
    onClose?: () => void;
};

export default function CountyInfoPanel({
  visible = false,
  countyName = '',
  metrics = null,
  districts = [],
  selectedDistrictName = null,
  onClose = () => {},
}: TCountyInfoPanelProps) {
  if (!visible) return null;

//   const countyName = featureProperties?.COUNTYNAME || '';

  return (
    <aside className="fixed right-6 top-24 w-80 bg-white border border-green-200 rounded p-4 shadow-lg z-40">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{countyName}</h3>
          <p className="text-xs text-gray-500">資料來源：fertilityrate113.json（區級未加權平均）</p>
        </div>
        <button onClick={onClose} className="text-gray-600">關閉</button>
      </div>

      <div className="mt-3">
        <h4 className="font-medium">年齡層生育率</h4>
        <ul className="mt-2 space-y-1">
          {AGE_KEYS.map((k) => {
            const item = metrics?.ageGroups?.[k];
            const value = item?.mean != null ? Number(item.mean).toFixed(2) : '—';
            return (
              <li key={k} className="flex justify-between text-sm">
                <span>{LABEL_MAP[k]}</span>
                <span className="font-medium">{value}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3">
        <h4 className="font-medium">總生育率 / 一般生育率</h4>
        <div className="flex justify-between mt-2 text-sm">
          <div>總生育率</div>
          <div className="font-medium">{metrics?.total?.mean != null ? Number(metrics.total.mean).toFixed(2) : '—'}</div>
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <div>一般生育率</div>
          <div className="font-medium">{metrics?.general?.mean != null ? Number(metrics.general.mean).toFixed(2) : '—'}</div>
        </div>
      </div>

      <div className="mt-4">
        <details>
          <summary className="cursor-pointer">顯示區級明細 ({districts.length})</summary>
          <div className="max-h-48 overflow-auto mt-2 text-sm">
            {districts.map((d: TDISTRICT) => {
              const t = d.row['總生育率'];
              return (
                <div key={d.name} className="flex justify-between py-1 border-b last:border-b-0">
                  <div>{d.name}</div>
                  <div className="text-gray-700">{t != null ? String(t) : '—'}</div>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </aside>
  );
}
