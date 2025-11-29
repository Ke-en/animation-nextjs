// utilities for processing fertility data
import fertilityData from "@/data/fertilityrate113.json";

// Normalize county name: convert 台 -> 臺, trim
export function normalizeCountyName(name: string | null): string {
  if (!name) return "";
  return name.replace(/台/g, "臺").trim();
}

// Extract county and district from 區域別 like '臺北市松山區'
export function extractCountyAndDistrict(region: string) {
  if (!region || typeof region !== "string")
    return { county: null, district: null };
  const match = region.match(/^(.*?[市縣])/);
  if (match) {
    const county = normalizeCountyName(match[1]);
    const district = region.slice(match[1].length).trim();
    return { county, district: district || null };
  }
  // fallback: 如果沒有市/縣，取前兩個字作為縣市（較常見且穩健）
  const fallback = region.trim().slice(0, 2);
  return { county: normalizeCountyName(fallback), district: null };
}

function toNumber(v: any): number | null {
  // number的轉換會不會太複雜？
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function median(arr: number[]) {
  const nums = arr.slice().sort((a, b) => a - b);
  const len = nums.length;
  if (len === 0) return null;
  const mid = Math.floor(len / 2);
  return len % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
}

export type TDISTRICT = {
  name: string;
  row: any;
};

export type TCOUNTY_MAP = {
  [county: string]: {
    rawRows: Array<any>;
    districts: Array<TDISTRICT>;
    metrics?: any;
  };
};

type TEntry = {
  [key: string]: any;
};

// Build countyMap from fertilityData
export function buildCountyMap() {
  const countyMap: TCOUNTY_MAP = {};
  const unmatched = new Set();

  fertilityData.forEach((row) => {
    const region = row["區域別"] || "";
    const { county, district } = extractCountyAndDistrict(region);
    if (!county) {
      unmatched.add(region);
      return;
    }

    if (!countyMap[county]) {
      countyMap[county] = {
        rawRows: [],
        districts: [],
      };
    }

    const entry: TEntry = { ...row };
    // parse numeric fields
    const exactAgeKeys = [
      "15至19歲生育率",
      "20至24歲生育率",
      "25至29歲生育率",
      "30至34歲生育率",
      "35至39歲生育率",
      "40至44歲生育率",
      "45至49歲生育率",
    ];
    exactAgeKeys.forEach((k) => {
      entry[k] = toNumber(entry[k]);
    });
    entry["總生育率"] = toNumber(entry["總生育率"]);
    entry["一般生育率"] = toNumber(entry["一般生育率"]);

    countyMap[county].rawRows.push(entry);
    countyMap[county].districts.push({ name: district || region, row: entry });
  });

  // compute metrics per county
  Object.keys(countyMap).forEach((county) => {
    const rows = countyMap[county].rawRows;
    const exactAgeKeys = [
      "15至19歲生育率",
      "20至24歲生育率",
      "25至29歲生育率",
      "30至34歲生育率",
      "35至39歲生育率",
      "40至44歲生育率",
      "45至49歲生育率",
    ];

    const metrics: any = {};
    exactAgeKeys.forEach((k) => {
      const vals = rows
        .map((r) => r[k])
        .filter((v) => v !== null && v !== undefined);
      const sum = vals.reduce((s, v) => s + v, 0);
      metrics[k] =
        vals.length > 0
          ? {
              mean: sum / vals.length,
              median: median(vals),
              min: Math.min(...vals),
              max: Math.max(...vals),
              n: vals.length,
            }
          : { mean: null, median: null, min: null, max: null, n: 0 };
    });

    // total and general
    const totalVals = rows
      .map((r) => r["總生育率"])
      .filter((v) => v !== null && v !== undefined);
    const generalVals = rows
      .map((r) => r["一般生育率"])
      .filter((v) => v !== null && v !== undefined);
    const totalSum = totalVals.reduce((s, v) => s + v, 0);
    const generalSum = generalVals.reduce((s, v) => s + v, 0);

    countyMap[county].metrics = {
      ageGroups: metrics,
      total:
        totalVals.length > 0
          ? {
              mean: totalSum / totalVals.length,
              median: median(totalVals),
              n: totalVals.length,
            }
          : { mean: null, median: null, n: 0 },
      general:
        generalVals.length > 0
          ? {
              mean: generalSum / generalVals.length,
              median: median(generalVals),
              n: generalVals.length,
            }
          : { mean: null, median: null, n: 0 },
    };
  });

  return {
    countyMap,
    countyList: Object.keys(countyMap).sort(),
    unmatched: Array.from(unmatched),
  };
}
